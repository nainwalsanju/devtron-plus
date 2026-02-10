# Jules Mobile Prototype

Jules Mobile is an AI-powered coding assistant and VM manager for iOS and Android. It combines a chat-based AI interface with a functional IDE for managing and connecting to Virtual Machines (VMs).

## Features

- **AI Chat Assistant**: Conversational interface to get coding help (Prototype).
- **VM Manager**: List, add, and manage your development environments.
- **Terminal Access**: Real-time SSH terminal directly in the app.
- **Hybrid Support**: Connect to your own **Local VMs** via SSH or provision **Cloud VMs** (Mocked).
- **Pricing Tiers**:
  - **Free**: Connect unlimited Local VMs.
  - **Pro**: Access to managed Cloud VMs.

## Architecture

The project is a monorepo containing:

1. **`mobile/`**: React Native (Expo) application.
   - UI: React Navigation (Tabs), Screens (Chat, IDE).
   - Tech: TypeScript, Socket.io Client.
2. **`backend/`**: Node.js Express Server.
   - API: REST endpoints for Auth and VM management.
   - Real-time: Socket.io for terminal streaming.
   - SSH: `ssh2` library for connecting to remote servers.

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo Go app on your phone (or Android Emulator / iOS Simulator)

## Quick Start

### 1. Setup Backend

The backend handles authentication and SSH connections.

```bash
cd jules-mobile/backend
npm install
npm start
```
*Server runs on `http://localhost:3000`*

### 2. Setup Mobile App

The mobile app connects to the backend.

```bash
cd jules-mobile/mobile
npm install
npm start
```

**Important**:
- If running on **Android Emulator**, the app automatically connects to `10.0.2.2:3000`.
- If running on a **Physical Device**, open `mobile/src/services/api.ts` and change `BACKEND_URL` to your computer's local IP address (e.g., `http://192.168.1.5:3000`).

## Usage Guide

1. **Login**: Click "Login with GitHub" (Mocked, no real credentials needed).
2. **Chat**: Use the Chat tab to talk to the AI assistant.
3. **IDE (VM Manager)**:
   - **Add Local VM**: Click `+`, select "Local VM".
     - *Tip*: Enter `mock` as the Host to test the terminal without a real server.
   - **Add Cloud VM**: Click `+`, select "Cloud VM".
     - *Note*: Requires "Pro" plan. Click "Upgrade to Pro" at the top to test this feature.
   - **Connect**: Tap a VM in the list to open the terminal.

## Mock Mode

For prototype testing, the backend includes a **Mock SSH Server**.
- When adding a VM, if you set the Host to `mock`, the backend will simulate a terminal session.
- You can type commands like `ls`, `pwd`, or `help` and get simulated responses.
