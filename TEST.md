# THUMELA Demo Runbook

## What this is for

Use these commands to start the backend, mobile app, and local checks for the THUMELA demo.

## Prerequisites

- Node.js 20+
- npm
- Android emulator, iOS simulator, or a browser for Expo web
- Optional: Firebase and Open Payments environment variables

## Install dependencies

```bash
npm install
cd backend && npm install
cd ../mobile && npm install
```

## Configure environment files

```bash
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env
```

Edit `backend/.env` with your Firebase, Open Payments, and WhatsApp values if available.

## Start the backend

```bash
cd backend
npm run dev
```

The API should be available on `http://localhost:3001`.

## Start the mobile app

```bash
cd mobile
npx expo start
```

For web preview, press `w` or use the Expo browser tab.

## Run type checks

```bash
npx tsc -p backend/tsconfig.json --noEmit
npx tsc -p mobile/tsconfig.json --noEmit
```

## Run the mobile preview test

```bash
npx playwright test e2e/mobile.spec.ts
```

## Demo login

Use the seeded test user credentials from the README or the backend seed script.

## Suggested demo flow

1. Log in as Nomzamo.
2. Open Home and confirm the wallet balance and currency badge.
3. Open Deposit and complete a simulated deposit.
4. Open Payments to show a cross-currency send quote.
5. Open Community to show the network map and a community request.
6. Open Activity to review transactions and payment requests.

## Notes

- If the backend runs without Firebase or Open Payments env vars, it uses the local fallback store and mock payment paths.
- If Expo web shows stale state, restart the mobile bundler and reload the page.