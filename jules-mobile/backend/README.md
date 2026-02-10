# Jules Backend

A Node.js/Express server that acts as the API and SSH gateway for the Jules Mobile application.

## Features

- **Authentication**: GitHub OAuth (Mocked).
- **REST API**: Manage VMs, Users, and Pricing.
- **SSH Gateway**: Connects to remote SSH servers and pipes the terminal stream to the mobile client via Socket.io.
- **Mock SSH Server**: Built-in simulator for testing without real servers.

## Installation

```bash
cd backend
npm install
npm start
```
*Server runs on port 3000.*

## API Endpoints

### Auth

- **POST /auth/github**: Returns a mock JWT token and user profile.
- **GET /users/me**: Get current user profile.

### VM Management

- **GET /vms**: List all VMs for the authenticated user.
- **POST /vms**: Add a new VM.
  - Body: `{ name, type, host, username, port }`
  - **Note**: If `type: 'cloud'` and user is on `free` plan, returns `403 Forbidden`.

### Pricing

- **POST /users/me/upgrade**: Upgrade user to `pro` plan.
- **POST /users/me/downgrade**: Downgrade user to `free` plan.

## Real-Time Socket Events

The backend uses `socket.io` for terminal communication.

- **Client emits `start_session`**:
  - Payload: `vmId` (string).
  - Backend starts an SSH connection or mock session.

- **Client emits `input`**:
  - Payload: `data` (string).
  - Sends keystrokes/commands to the SSH session.

- **Server emits `output`**:
  - Payload: `data` (string).
  - Sends terminal output (stdout/stderr) back to the client.

## Development

- **Run Verification Tests**:
  ```bash
  npx ts-node verify_backend.ts
  ```
  This script simulates a full user flow (Login -> Add VM -> Check Pricing -> Upgrade -> Add Cloud VM) to ensure logic is correct.
