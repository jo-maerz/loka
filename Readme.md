# Project Startup

This repository contains the backend services and a startup script to initialize all necessary project dependencies. The Angular frontend resides in a sibling repository (`loka-app-angular`).

## Prerequisites

Before running the startup script, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Maven](https://maven.apache.org/install.html)
- [Node.js (v18+)](https://nodejs.org/) and [npm](https://www.npmjs.com/get-npm)

Ensure that **Docker Desktop** is running before executing the startup script.

## Directory Structure

Ensure the repositories are organized as sibling folders:

```
parent-folder/
├── loka-server/         # Contains the backend and the startup script (start_all.js)
└── loka-app-angular/    # Contains the Angular frontend
```

## Starting the Project

1. **Navigate to the `setup_script` directory in `loka-server`:**

   ```bash
   cd /path/to/parent-folder/loka-server/setup_script
   ```

2. **Run the startup script:**

   ```bash
   node start_all.js
   ```

   The `start_all.js` script will:

   - **Start Docker services**: Initializes PostgreSQL/pgAdmin, MinIO, and Keycloak (if not already running).
   - **Wait for services**: Ensures that PostgreSQL and Keycloak are fully operational before proceeding.
   - **Configure Keycloak**: Sets up the Keycloak `admin-cli` client via its Admin REST API.
   - **Launch backend**: Runs the Maven-based Spring Boot backend.
   - **Launch frontend**: Installs Angular dependencies (via `npm install`) and starts the Angular application.

3. **Stopping the Services:**
   To stop all running services, press `Ctrl+C` in your terminal.
   The script handles termination signals and will cleanly shut down all spawned processes.

## Testing the Project

The project is configured for the **development environment**. The `DataInitializer` will generate 5 experiences per city based on the current date and time.

### User Roles and Test Credentials

There are three user roles in the application:

- **Admin**: Can edit and delete all experiences and reviews.
  - **Test credentials**: `admin@loka.de` / `adminpassword`
- **Verified User**: Can create, edit, and delete their own experiences and reviews.
  - **Test credentials**: `verifieduser@loka.de` / `userpassword`
- **Guest**: Can view all experiences and reviews (no credentials required).
