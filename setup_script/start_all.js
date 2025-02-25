#!/usr/bin/env node
/**
 * start_all.js
 *
 * Starts all required services for the project:
 *   - Docker services (Postgres/pgAdmin, MinIO, Keycloak)
 *   - Maven-based Spring Boot backend
 *   - Angular frontend (with npm install before starting)
 *
 * Prerequisites: Docker, docker-compose, Maven, Node.js (v18+), and npm.
 *
 * This version of the script is located in: loka-server/setup_script/
 */

const { spawn } = require("child_process");
const net = require("net");
const http = require("http");
const path = require("path");
const process = require("process");
const { execSync } = require("child_process");

// Ensure aws-sdk is installed.
try {
  require.resolve("aws-sdk");
} catch (e) {
  console.log("aws-sdk not found. Installing...");
  execSync("npm install aws-sdk", { stdio: "inherit" });
}
const AWS = require("aws-sdk");

// Configure the S3 client for MinIO
const s3 = new AWS.S3({
  accessKeyId: "minioadmin",
  secretAccessKey: "minioadmin",
  region: "us-east-1", // required but ignored by MinIO
  s3ForcePathStyle: true, // Use path-style URLs for S3
  endpoint: "http://localhost:9000",
});

// Define a bucket policy for public read access
const bucketPolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicReadGetObject",
      Effect: "Allow",
      Principal: "*",
      Action: ["s3:GetObject"],
      Resource: ["arn:aws:s3:::my-bucket/*"],
    },
  ],
};

//
// Utility functions
//

/**
 * Spawns a command in a given working directory.
 */
function runCommand(command, args, cwd) {
  console.log(`Starting: ${command} ${args.join(" ")} in ${cwd}`);
  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: "inherit",
  });

  child.on("error", (err) => {
    console.error(`Error starting ${command}:`, err);
  });

  child.on("exit", (code, signal) => {
    console.log(
      `Process ${child.pid} exited with code ${code} (signal: ${signal})`
    );
  });

  return child;
}

/**
 * Spawns a command and returns a Promise that resolves when the process exits.
 */
function runCommandPromise(command, args, cwd) {
  console.log(`Starting: ${command} ${args.join(" ")} in ${cwd}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: true,
      stdio: "inherit",
    });
    child.on("error", (err) => {
      console.error(`Error starting ${command}:`, err);
      reject(err);
    });
    child.on("exit", (code, signal) => {
      console.log(
        `Process ${child.pid} exited with code ${code} (signal: ${signal})`
      );
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

/**
 * Returns true if any Docker Compose service in the directory is running.
 */
async function isDockerComposeRunning(cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", ["compose", "ps"], { cwd, shell: true });
    let output = "";
    child.stdout.on("data", (data) => (output += data.toString()));
    child.stderr.on("data", (data) => (output += data.toString()));
    child.on("error", reject);
    child.on("close", () => resolve(output.includes("Up")));
  });
}

/**
 * Starts Docker Compose services in the specified directory if not already running.
 */
async function startDockerComposeIfNotRunning(cwd) {
  try {
    const running = await isDockerComposeRunning(cwd);
    if (running) {
      console.log(`Docker Compose services in ${cwd} are already running.`);
      return null;
    }
    console.log(`Starting Docker Compose services in ${cwd}...`);
    return runCommand("docker compose", ["up", "-d"], cwd);
  } catch (err) {
    console.error("Error checking Docker Compose status:", err);
    throw err;
  }
}

/**
 * Checks TCP connectivity to a given host and port.
 */
function checkTCP(host, port, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let done = false;
    socket.setTimeout(timeout);
    socket.once("connect", () => {
      if (!done) {
        done = true;
        socket.end();
        resolve();
      }
    });
    socket.once("timeout", () => {
      if (!done) {
        done = true;
        socket.destroy();
        reject(new Error("Timeout"));
      }
    });
    socket.once("error", (err) => {
      if (!done) {
        done = true;
        socket.destroy();
        reject(err);
      }
    });
    socket.connect(port, host);
  });
}

/**
 * Checks HTTP connectivity by making a GET request.
 */
function checkHTTP(url, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: timeout }, (res) => {
      res.resume();
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
        resolve();
      } else {
        reject(new Error(`Status code: ${res.statusCode}`));
      }
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

/**
 * Waits for a TCP service to be available.
 */
async function waitForTCPService(host, port, retries = 100, interval = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await checkTCP(host, port, interval);
      console.log(`TCP service on ${host}:${port} is up.`);
      return;
    } catch (err) {
      console.log(
        `Waiting for TCP service on ${host}:${port}... (${i + 1}/${retries})`
      );
      await new Promise((res) => setTimeout(res, interval));
    }
  }
  throw new Error(
    `TCP service on ${host}:${port} did not start after ${retries} retries.`
  );
}

/**
 * Waits for an HTTP service to be available.
 */
async function waitForHTTPService(url, retries = 100, interval = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await checkHTTP(url, interval);
      console.log(`HTTP service at ${url} is up.`);
      return;
    } catch (err) {
      console.log(
        `Waiting for HTTP service at ${url}... (${i + 1}/${retries})`
      );
      await new Promise((res) => setTimeout(res, interval));
    }
  }
  throw new Error(
    `HTTP service at ${url} did not start after ${retries} retries.`
  );
}

/**
 * Configures the Keycloak admin-cli client via its Admin REST API.
 */
async function configureAdminCli() {
  console.log("Configuring admin-cli client in Keycloak...");

  // Obtain an admin token.
  const tokenUrl =
    "http://localhost:8081/realms/master/protocol/openid-connect/token";
  const params = new URLSearchParams();
  params.append("client_id", "admin-cli");
  params.append("username", "admin");
  params.append("password", "admin");
  params.append("grant_type", "password");

  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!tokenResponse.ok) {
    if (tokenResponse.status === 401) {
      console.log(
        "Admin token request unauthorized; skipping admin-cli configuration."
      );
      return;
    }
    throw new Error(
      `Failed to obtain admin token: ${tokenResponse.statusText}`
    );
  }
  const { access_token: accessToken } = await tokenResponse.json();

  // Retrieve admin-cli client info.
  const clientResponse = await fetch(
    "http://localhost:8081/admin/realms/master/clients?clientId=admin-cli",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!clientResponse.ok) {
    throw new Error(
      `Failed to get admin-cli client data: ${clientResponse.statusText}`
    );
  }
  const adminCliClients = await clientResponse.json();
  if (!adminCliClients.length) throw new Error("admin-cli client not found");
  const adminCliClient = adminCliClients[0];

  // Update client configuration if necessary.
  let updateNeeded = false;
  if (!adminCliClient.serviceAccountsEnabled) {
    adminCliClient.serviceAccountsEnabled = true;
    updateNeeded = true;
  }
  if (!adminCliClient.authorizationServicesEnabled) {
    adminCliClient.authorizationServicesEnabled = true;
    updateNeeded = true;
  }
  if (adminCliClient.publicClient) {
    adminCliClient.publicClient = false;
    adminCliClient.clientAuthenticatorType = "client-secret";
    updateNeeded = true;
  }
  if (updateNeeded) {
    const updateResponse = await fetch(
      `http://localhost:8081/admin/realms/master/clients/${adminCliClient.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminCliClient),
      }
    );
    if (!updateResponse.ok) {
      throw new Error(
        `Failed to update admin-cli client configuration: ${updateResponse.statusText}`
      );
    }
    console.log("admin-cli client configuration updated.");
  } else {
    console.log("admin-cli client configuration is already correct.");
  }

  // Get the service account user.
  const serviceAccountUserResponse = await fetch(
    `http://localhost:8081/admin/realms/master/clients/${adminCliClient.id}/service-account-user`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!serviceAccountUserResponse.ok) {
    throw new Error(
      `Failed to get service account user: ${serviceAccountUserResponse.statusText}`
    );
  }
  const serviceAccountUser = await serviceAccountUserResponse.json();
  const serviceAccountUserId = serviceAccountUser.id;

  // Retrieve the global "admin" realm role.
  const realmRoleResponse = await fetch(
    "http://localhost:8081/admin/realms/master/roles/admin",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!realmRoleResponse.ok) {
    throw new Error(
      `Failed to get master realm admin role: ${realmRoleResponse.statusText}`
    );
  }
  const adminRealmRole = await realmRoleResponse.json();

  // Check if the role is already assigned.
  const assignedRealmRolesResponse = await fetch(
    `http://localhost:8081/admin/realms/master/users/${serviceAccountUserId}/role-mappings/realm`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!assignedRealmRolesResponse.ok) {
    throw new Error(
      `Failed to get assigned realm roles: ${assignedRealmRolesResponse.statusText}`
    );
  }
  const assignedRealmRoles = await assignedRealmRolesResponse.json();
  const alreadyAssigned = assignedRealmRoles.some((r) => r.name === "admin");

  if (!alreadyAssigned) {
    const assignRealmResponse = await fetch(
      `http://localhost:8081/admin/realms/master/users/${serviceAccountUserId}/role-mappings/realm`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([adminRealmRole]),
      }
    );
    if (!assignRealmResponse.ok) {
      throw new Error(
        `Failed to assign admin realm role: ${assignRealmResponse.statusText}`
      );
    }
    console.log('Assigned "admin" realm role to admin-cli service account.');
  } else {
    console.log(
      'admin-cli service account already has the "admin" realm role.'
    );
  }
}

/**
 * Configures the MinIO bucket and sets its policy to public.
 */
async function configureMinioBucket() {
  try {
    // Wait for MinIO's TCP port to be available.
    await waitForTCPService("localhost", 9000);
    console.log("MinIO is up. Configuring bucket...");

    // Check if bucket exists.
    try {
      await s3.headBucket({ Bucket: "my-bucket" }).promise();
      console.log("Bucket 'my-bucket' already exists.");
    } catch (err) {
      if (err.statusCode === 404) {
        await s3.createBucket({ Bucket: "my-bucket" }).promise();
        console.log("Bucket 'my-bucket' created.");
      } else {
        throw err;
      }
    }

    // Apply the public bucket policy.
    await s3
      .putBucketPolicy({
        Bucket: "my-bucket",
        Policy: JSON.stringify(bucketPolicy),
      })
      .promise();
    console.log("Bucket 'my-bucket' policy updated to public.");
  } catch (err) {
    console.error("Error configuring MinIO bucket:", err);
  }
}

//
// Define directory paths.
// Now that the script is in loka-server/setup_script,
// - lokaServerDir is the parent folder.
// - lokaAppDir is two levels up, then into loka-app-angular.
const lokaServerDir = path.join(__dirname, "..");
const lokaAppDir = path.join(__dirname, "..", "..", "loka-app-angular");

//
// Store spawned processes.
const processes = [];

/**
 * Starts all services and applications.
 */
async function startProject() {
  console.log("Starting Docker services...");

  // Start Docker Compose services.
  // Assuming the Postgres (and possibly other services) compose file is in lokaServerDir
  const postgresProcess = await startDockerComposeIfNotRunning(lokaServerDir);
  if (postgresProcess) processes.push(postgresProcess);

  // MinIO Docker Compose is now assumed to be in the "miniO" subfolder of lokaServerDir.
  const minioProcess = await startDockerComposeIfNotRunning(
    path.join(lokaServerDir, "miniO")
  );
  if (minioProcess) processes.push(minioProcess);

  // Keycloak Compose is in the "keycloak_auth" subfolder of lokaServerDir.
  const keycloakProcess = await startDockerComposeIfNotRunning(
    path.join(lokaServerDir, "keycloak_auth")
  );
  const keycloakStarted = Boolean(keycloakProcess);
  if (keycloakProcess) processes.push(keycloakProcess);

  // Wait for Postgres and Keycloak to be ready.
  try {
    await waitForTCPService("localhost", 5432); // PostgreSQL
    await waitForHTTPService("http://localhost:8081"); // Keycloak
  } catch (err) {
    console.error("Error waiting for services:", err);
    process.exit(1);
  }

  // Configure admin-cli if Keycloak was started.
  if (keycloakStarted) {
    try {
      await configureAdminCli();
    } catch (err) {
      console.error("Error configuring admin-cli:", err);
      process.exit(1);
    }
  } else {
    console.log("Keycloak already running; skipping admin-cli configuration.");
  }

  // Configure MinIO bucket.
  await configureMinioBucket();

  // Start backend and frontend.
  console.log("Starting Maven Spring Boot backend");
  processes.push(runCommand("./mvnw", ["compile"], lokaServerDir));
  processes.push(runCommand("mvn", ["spring-boot:run"], lokaServerDir));

  console.log("Installing Angular frontend dependencies");
  try {
    await runCommandPromise("npm", ["i"], lokaAppDir);
  } catch (err) {
    console.error("Error during npm install in Angular frontend:", err);
    process.exit(1);
  }

  console.log("Starting Angular frontend");
  processes.push(runCommand("npm", ["start"], lokaAppDir));
}

/**
 * Terminates all spawned processes on exit.
 */
function shutdown() {
  console.log("\nTerminating all processes...");
  processes.forEach((proc) => {
    if (proc && !proc.killed) {
      proc.kill();
    }
  });
  process.exit();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Kick off the startup process.
startProject();
