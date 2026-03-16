# ArcLend

ArcLend is my privacy-focused lending demo on Solana, powered by Arcium.

The main idea is simple:
regular onchain lending exposes collateral, debt, and health factors in public state.
ArcLend avoids that by encrypting borrower intent and running risk checks through Arcium-style private computation.

Built by [Rajlol](https://x.com/rajlol01).

## What this site does
- Connect wallet (Phantom / Solflare)
- Open a private borrow intent (collateral + borrow amount + term)
- Run encrypted-style health checks
- Repay and move loans to history
- Show clear UI states (success / error / processing)

## Why Arcium is used
In ArcLend, Arcium is used to keep risk-sensitive lending data private.

Practical flow in this project:
1. User submits borrow input from the frontend.
2. Payload is encrypted client-side (`app/src/lib/encryption.ts`, `app/src/lib/arcium.ts`).
3. Risk logic (LTV / health / liquidation semantics) is treated as private compute flow.
4. User sees borrower-facing result, without exposing raw risk details publicly.

Privacy benefit:
- Reduces predatory liquidation visibility from publicly readable risk metrics.

## Tech stack
- Next.js (App Router) frontend: `app/`
- Solana wallet adapter integration
- Arcium client integration hooks
- Anchor + Solana program scaffold: `programs/`
- Encrypted instruction circuits: `encrypted-ixs/`

## Project structure
```text
.
├── app/                 # ArcLend web app
├── encrypted-ixs/       # Encrypted instruction circuits
├── programs/            # Anchor/Solana program
├── tests/               # Program tests
├── Anchor.toml
├── Arcium.toml
└── package.json
```

## Run locally
### 1) Install dependencies
```bash
yarn install
```

### 2) Configure env
```bash
cp app/.env.example app/.env.local
```

Set testnet/devnet RPC in `app/.env.local`.

### 3) Start frontend
```bash
cd app
yarn dev
```

Open: `http://localhost:3000`

## Notes about current demo behavior
- Faucet is manual via Solana faucet link in header.
- Wallet SOL balance is live from RPC.
- “Available SOL” in borrow form is wallet balance minus locally tracked locked collateral from active ArcLend loans.
- This is a demo app and not production-ready lending infrastructure.

## Open-source repository
GitHub: [https://github.com/rajdeblol/arc-lend](https://github.com/rajdeblol/arc-lend)
