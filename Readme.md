# Project Startup

This repository contains the backend services and a startup script to initialize all necessary project dependencies. The Angular frontend resides in a sibling repository (`loca-app-angular`).

## Prerequisites

Before running the startup script, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/)
- [Maven](https://maven.apache.org/install.html)
- [Node.js (v18+)](https://nodejs.org/) and [npm](https://www.npmjs.com/get-npm)

## Directory Structure

Ensure the repositories are organized as sibling folders:
parent-folder/
├── loca-server/ # Contains the backend and the startup script (start_all.js)
└── loca-app-angular/ # Contains the Angular frontend

## How to Start the Project

1. **Navigate to the `loca-server` directory:**

   ```
   bash cd /path/to/parent-folder/loca-server
   ```

2. **Run the startup script:**
   ```
   bash node start_all.js
   ```

The `start_all.js` script will:

- **Start Docker services:** Initializes Postgres/pgAdmin, MiniO, and Keycloak (if not already running).
- **Wait for services:** Ensures that Postgres and Keycloak are fully operational before proceeding.
- **Configure Keycloak:** Sets up the Keycloak admin-cli client via its Admin REST API.
- **Launch backend:** Runs the Maven-based Spring Boot backend.
- **Launch frontend:** Installs Angular dependencies (via `npm install`) and starts the Angular application.

3. **Stop the Services:**
   To stop all the services, press Ctrl+C in your terminal.
   The script will handle termination signals and cleanly shut down all spawned processes.
