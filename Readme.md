# Loka Application

This repository contains both the backend services (`loka-server`) and the Angular frontend (`loka-app-angular`) for the Loka application.

## Overview

Loka is a web application featuring a backend built with Kotlin and a frontend developed using Angular. This repository combines both the backend (`loka-server`) and frontend (`loka-app-angular`) into a single cohesive structure.

## Prerequisites

Ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Maven](https://maven.apache.org/install.html)
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/get-npm)

Make sure Docker Desktop is running before executing the startup script.

## Directory Structure

The repository structure is as follows:

```
loka/
├── loka-server/          # Backend services and scripts
└── loka-app-angular/     # Angular frontend
```

## Starting the Project

Use the provided startup script to launch the entire project:

```bash
cd loka-server/setup_script
node start_all.js
```

The `start_all.js` script performs the following:

- Starts necessary Docker services: PostgreSQL, MinIO, and Keycloak.
- Waits until all backend services are fully operational.
- Initializes the Angular frontend (if not already started separately).

To stop all running services, press `Ctrl+C`. The script will gracefully shut down all processes.

### Starting Frontend Manually (optional)

If needed, the frontend can be started manually:

```bash
cd loka-app-angular
npm install
npm start
```

## Testing

The default setup uses the **development environment**, automatically generating sample data via the `DataInitializer`.

**User Roles for Testing:**

| Role              | Permissions                                        | Credentials                             |
| ----------------- | -------------------------------------------------- | --------------------------------------- |
| **Guest**         | View all experiences and reviews                   | No credentials required                 |
| **Verified User** | Create, update, delete own experiences and reviews | `verifieduser@loka.de` / `userpassword` |
| **Admin**         | All permissions                                    | `admin@loka.de` / `adminpassword`       |

For any questions, please reach out to the project maintainer.
Seulgi Jo-März / s.jo-maerz@outlook.com
