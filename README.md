# Community Remit

Cross-border remittance for connected communities — built on **Open Payments** and the **Interledger Protocol**.

> Make a R5 conversion as accessible as R10,000. Reconnect communities and money across borders.

## Quick Start

### Prerequisites

- Node.js 20+
- Expo CLI (`npx expo`)
- Interledger test wallet credentials from [wallet.interledger-test.dev](https://wallet.interledger-test.dev)

### 1. Install

```bash
npm install
cd backend && npm install
cd ../mobile && npm install
```

### 2. Configure backend

```bash
cp backend/.env.example backend/.env
# Edit OP_WALLET_ADDRESS, OP_KEY_ID, OP_PRIVATE_KEY_PATH
```

### 3. Start backend

```bash
cd backend && npm run dev
# → http://localhost:3001
```

### 4. Start mobile app

```bash
cd mobile && cp .env.example .env && npx expo start
```

Demo login: `nomzamo@example.com` / `password123`

## Project Structure

```
├── backend/          Node.js API — Open Payments SDK + Firebase
├── mobile/           React Native (Expo) — Capitec-inspired UI
├── docs/
│   └── APPLICATION.md   Full functionality, flows & ILP explanation
└── README.md
```

## Built On

- [OpenRemit](https://github.com/marclevin/OpenRemit) — quote/consent/callback payment flow
- [@interledger/open-payments](https://github.com/interledger/open-payments-node) — official Node.js SDK

## Features

- Deposit / withdraw (POC — simulated bank rails)
- Cross-currency payments via Open Payments (quote → consent → send)
- One-time and recurring payments
- WhatsApp payment instructions
- Payment requests with notifications
- Community crowdfund requests with network map
- Transaction history
- English, isiXhosa, Kiswahili
- Configurable 4-colour theme

See [docs/APPLICATION.md](docs/APPLICATION.md) for the complete specification.
