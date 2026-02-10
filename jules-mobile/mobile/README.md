# Jules Mobile App

A React Native (Expo) app for Jules, an AI-powered coding assistant and VM manager.

## Features

- **Chat Interface**: Talk to the AI assistant (Prototype).
- **IDE/VM Manager**: Manage Local/Cloud VMs.
- **Terminal View**: Real-time SSH terminal connected to backend via Socket.io.
- **Pricing Logic**: UI restricts cloud VMs based on the user's plan.

## Folder Structure

- `src/screens`:
  - `ChatScreen.tsx`: AI Chat interface.
  - `IDEScreen.tsx`: VM Manager & List.
  - `LoginScreen.tsx`: Authentication screen.
- `src/components`:
  - `TerminalView.tsx`: Real-time terminal emulator.
- `src/context`:
  - `AuthContext.tsx`: Manages user login state and plan (Free/Pro).
- `src/services`:
  - `api.ts`: API client (Login, Add VM, Upgrade Plan).
- `src/navigation`:
  - `MainNavigator.tsx`: Bottom Tab Navigation (Chat vs IDE).

## Installation

```bash
cd mobile
npm install
npm start
```

## Running on Device

1. **Install Expo Go** on your iOS or Android device.
2. Ensure your phone and computer are on the **same Wi-Fi network**.
3. Scan the QR code from the terminal output.

### Important: Backend Connection

The app attempts to connect to the backend server. You might need to update the `BACKEND_URL` in `src/services/api.ts` with your computer's local IP address.

**Default Configuration:**
- **Android Emulator**: Uses `10.0.2.2:3000` (Localhost on Android).
- **iOS Simulator**: Uses `localhost:3000`.
- **Physical Device**: Needs your LAN IP (e.g., `192.168.1.X:3000`).

## Development

- **Run Verification**:
  Ensure the backend is running first (`npm start` in `backend/`).
  The mobile app logic is mirrored in `backend/verify_backend.ts` for automated testing.
