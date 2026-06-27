# THUMELA — Application Documentation

## Problem Statement

People making cross-border payments in third-world countries fall victim to high exchange rates or unsecure payment rails such as individual intermediaries, with no regulation. Other services impose minimum send/exchange amounts. Remittance becomes expensive, tedious, and anxiety-inducing.

## Mission

At its core, THUMELA is a cross-currency remittance app. Where we shine:

- **Interledger Protocol** makes a R5 conversion as accessible as a R10,000 conversion — no punitive minimums.
- **Community features** reconnect people and their money — support stays tangible even when someone is 9,000 km away and sending their last R200.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native (Expo) |
| Backend | Node.js + Express + TypeScript |
| Payments | `@interledger/open-payments` SDK |
| Database | Firebase Firestore (in-memory fallback for local dev) |
| Messaging | Meta WhatsApp Cloud API |
| Reference | [OpenRemit](https://github.com/marclevin/OpenRemit), [open-payments-node](https://github.com/interledger/open-payments-node) |

---

## Actors & Capabilities

### End Users

| # | Capability | Implementation |
|---|------------|----------------|
| 1 | Deposit from bank | POC: country → bank picker → simulated credit to wallet balance |
| 2 | Withdraw to bank/mobile money | POC: provider picker → simulated debit from wallet balance |
| 3 | Send cross-currency payment | Open Payments quote → consent → outgoing payment via ILP |
| 3.1 | One-time payment | `paymentMode: ONE_TIME` in quote flow |
| 3.2 | Recurring payment | GNAP grant `limits.interval` + recurring metadata |
| 4 | WhatsApp payment instructions | `POST /api/payments/whatsapp-instruction` |
| 5 | Receive in local currency | Receiver wallet resolved via Open Payments; quote shows receive amount |
---
## Application Pages

### 1. Home
- Wallet balance (local currency)
- Quick actions: Deposit, Pay, Request, Community, Withdraw, History
Flow:
1. Select beneficiary (saved name + Interledger wallet address)
**Interledger Protocol (ILP)** connects payment networks through standardized connectors. **Open Payments** is the API layer that lets third-party apps (like THUMELA) instruct Account Servicing Entities without holding funds.
2. Choose one-time or recurring (start, expiry, interval)
3. Generate quote via Open Payments
4. Authorize at wallet (GNAP redirect) or send WhatsApp instruction

### 3. Deposit (POC)
1. Select country (ZA, KE, GB, US)
2. See country-specific providers (FNB, M-Pesa, HSBC, etc.)
| Traditional | THUMELA + ILP |
3. Enter amount → simulated deposit credits wallet

### 4. Request Payment
1. Select payer from users
2. Enter amount + optional reason
3. Payer receives in-app notification

### 5. Community
- Create community from users with prior transactions
- Approve/deny join requests
- Network map of members (initials / geo-positioned nodes)
- Create community requests (target, expiry)
- Members contribute at will

### 6. Withdraw (POC)
- Select bank/mobile provider
- Enter amount → simulated withdrawal

---

## Payment Process (Open Payments)

Built on the [OpenRemit](https://github.com/marclevin/OpenRemit) quote/consent/callback pattern using `@interledger/open-payments`:

```
Mobile App          Backend API              Open Payments Network
──────────          ───────────              ─────────────────────
1. Select beneficiary
2. Choose one-time/recurring
3. POST /payments/quote
                    walletAddress.get()  ──► Resolve sender & receiver wallets
                    grant.request()      ──► Incoming-payment grant (receiver)
                    incomingPayment.create()
                    grant.request()      ──► Quote grant (sender)
                    quote.create()       ──► Cross-currency quote via ILP
4. Show quote to user
5. POST /payments/consent
                    grant.request()      ──► Interactive outgoing grant
                    ◄── interactUrl
6. Open wallet consent page
7. GET /api/callback
                    grant.continue()
                    outgoingPayment.create() ──► Execute payment on ILP
8. Poll /payments/status/:id
```

### SDK entry points (backend)

- `backend/src/lib/openPayments.ts` — authenticated SDK client singleton
- `backend/src/lib/quoteFlow.ts` — shared resolve → incoming payment → quote flow
- `backend/src/routes/payments.ts` — quote, consent, status
- `backend/src/routes/callback.ts` — GNAP redirect handler

---

## How Interledger Makes Cross-Currency Cheaper

Traditional remittance rails:

- Correspondent banking chains add fees at each hop
- FX spreads are opaque and often unfavourable on small amounts
- Minimum transfer thresholds exclude micro-payments (e.g. R5 for airtime)

**Interledger Protocol (ILP)** connects payment networks through standardized connectors. **Open Payments** is the API layer that lets third-party apps (like THUMELA) instruct Account Servicing Entities without holding funds.

| Traditional | THUMELA + ILP |
|-------------|----------------------|
| High minimums | Any amount — R5 same as R10,000 |
| Opaque FX | Quote shows exact debit/receive before send |
| Unregulated intermediaries | Regulated wallet providers + GNAP consent |
| Slow settlement | ILP packet routing optimised for micropayments |

The app never moves money itself. It:

1. **Discovers** wallet metadata (`walletAddress.get`)
2. **Requests grants** (GNAP) for incoming payments, quotes, and outgoing payments
3. **Creates** an incoming payment on the receiver's wallet
4. **Quotes** the cross-currency conversion
5. **Executes** an outgoing payment after user consent

Connectors along the ILP path compete on price, which drives down cost — especially valuable for small remittances that traditional rails price out.

---

## WhatsApp Integration

For elderly and low-literacy users, payment instructions can be sent via WhatsApp:

```
POST /api/payments/whatsapp-instruction
{
  "phone": "+27821234567",
  "beneficiaryName": "Nomzamo",
  "amount": "500",
  "transactionId": "..."
}
```

When `WHATSAPP_TOKEN` is not set, messages are logged to the console (POC mode).

Webhook: `GET/POST /api/whatsapp/webhook` for Meta Cloud API verification.

---

## Firebase Data Model

| Collection | Purpose |
|------------|---------|
| `users` | Profile, wallet address, balance, FCM token, geo |
| `transactions` | All payment/deposit/withdrawal records |
| `beneficiaries` | Saved recipients per user |
| `paymentRequests` | P2P payment requests |
| `communities` | Groups, members, pending joins |
| `communityRequests` | Crowdfund-style requests + contributions |
| `notifications` | In-app alerts |

Without Firebase credentials, the backend uses an in-memory store with seeded demo users.

---

## Internationalisation

Translation files (fill in / extend as needed):

- `mobile/src/i18n/en.json` — English
- `mobile/src/i18n/xh.json` — isiXhosa
- `mobile/src/i18n/sw.json` — Kiswahili

Language picker appears at the top of each screen.

---

## Theme

Four-colour scheme (Capitec-inspired), configurable in `mobile/src/theme/colors.ts`:

| Token | Default | Role |
|-------|---------|------|
| `primary` | `#004B49` | Headers, balance, brand |
| `secondary` | `#E8F5E9` | Soft backgrounds, borders |
| `accent` | `#FF6B35` | Primary CTAs |
| `background` | `#F7F9F8` | Screen background |

Switch schemes at runtime via `ThemeProvider` (`default` | `ocean`).

---

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| nomzamo@example.com | password123 | Student (ZA) |
| mother@example.com | password123 | Sender (ZA) |
| jane@example.com | password123 | UK |
| kamau@example.com | password123 | Kenya |

---

## Environment Setup

### Backend (`backend/.env`)

```
OP_WALLET_ADDRESS=https://ilp.interledger-test.dev/your-wallet
OP_KEY_ID=your-key-uuid
OP_PRIVATE_KEY_PATH=./private.key
JWT_SECRET=long-random-string
FIREBASE_PROJECT_ID=...        # optional
WHATSAPP_TOKEN=...             # optional
```

Get test wallet credentials from [wallet.interledger-test.dev](https://wallet.interledger-test.dev).

### Mobile (`mobile/.env`)

```
EXPO_PUBLIC_API_URL=http://localhost:3001
```

---

## API Reference (summary)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Sign in |
| GET | `/api/wallet/balance` | Wallet balance |
| POST | `/api/wallet/deposit` | Simulated deposit |
| POST | `/api/wallet/withdraw` | Simulated withdrawal |
| GET | `/api/beneficiaries` | List beneficiaries |
| POST | `/api/beneficiaries` | Add beneficiary |
| POST | `/api/payments/quote` | Open Payments quote |
| POST | `/api/payments/consent` | Start GNAP consent |
| GET | `/api/payments/status/:id` | Payment status |
| POST | `/api/requests` | Create payment request |
| GET | `/api/communities` | List communities |
| POST | `/api/communities/:id/requests` | Community crowdfund |
| GET | `/api/transactions/history` | Transaction history |
