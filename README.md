# Workout Viewer

A React Native TypeScript application with Express.js backend for tracking workouts.

## Project Structure

```
workout-viewer/
├── ui/          # React Native app (Expo + TypeScript)
├── server/      # Express.js API server (TypeScript)
├── test-data/   # Test FIT files (gitignored)
└── README.md    # This file
```

## Getting Started

### UI (React Native App)

```bash
cd ui
npm install
npm start        # Start Expo development server
npm run ios      # Run on iOS simulator
npm run android  # Run on Android emulator
npm run web      # Run in web browser
```

### Server (Express API)

```bash
cd server
npm install
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Run production build
```

## Development Workflow

1. Start the server: `cd server && npm run dev`
2. Start the React Native app: `cd ui && npm start`
3. The server runs on `http://localhost:3000`
4. The mobile app can connect to the API endpoints

## Tech Stack

- **Frontend**: React Native, Expo, TypeScript, Expo Router
- **Backend**: Node.js, Express.js, TypeScript
- **Development**: Hot reload for both client and server