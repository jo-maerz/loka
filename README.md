# Loka Frontend

This repository contains the Angular frontend for the Loka application. The backend services and startup scripts are managed in a separate repository: [Loka Server](https://github.com/jo-maerz/loka-server).

## Prerequisites

Before running the frontend, ensure that the following are installed:

- [Node.js (v18+)](https://nodejs.org/) and [npm](https://www.npmjs.com/get-npm)
- The backend services should be running. Refer to the [Loka Server repository](https://github.com/jo-maerz/loka-server) for instructions on setting up the backend.

## Project Structure

Ensure the repositories are organized as sibling folders:

```
parent-folder/
├── loka-server/         # Backend services and startup script (start_all.js)
└── loka-app-angular/    # Angular frontend
```

## Running the Frontend

The `start_all.js` script in the backend repository handles the frontend build and startup automatically. If you need to manually start the frontend:

1. **Navigate to the frontend directory:**
   ```bash
   cd /path/to/parent-folder/loka-app-angular
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200/`.

## Additional Notes

- The backend must be running for the application to function correctly.
- For backend setup details, refer to the [Loka Server repository](https://github.com/jo-maerz/loka-server).

For further assistance, refer to the backend documentation or contact the project maintainers.
