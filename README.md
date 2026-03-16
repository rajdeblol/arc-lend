# ArcLend

ArcLend is a privacy-preserving lending/borrowing dApp on Solana testnet/devnet using Arcium MPC.

It protects borrower intent by keeping risk internals encrypted:
- Collateral and debt intents are stored as encrypted ciphertext (MXE-only visibility).
- Health/liquidation checks execute on encrypted state and return only private status output.
- Settlement flow returns borrower-readable outcomes without exposing raw risk parameters.

## Submission Checklist 

### 1) Functional Solana project integrated with Arcium
- Solana wallet connection and transaction UX are implemented in the Next.js app.
- Arcium integration points are implemented in:
  - `app/src/lib/arcium.ts`
  - `app/src/lib/encryption.ts`
  - `encrypted-ixs/*`
  - `programs/<arclend-program>/src/lib.rs`
- The frontend includes encrypted flow messaging and private-risk actions (borrow, health check, repay).

### 2) Clear explanation of Arcium usage and privacy benefits
- Client payloads are encrypted before private computation.
- Risk logic (LTV/health/liquidation semantics) is executed in encrypted state.
- Private outputs are shown to the borrower while preventing public exposure of sensitive risk metrics.

### 3) Open-source GitHub repository
- Current local repository has no remote configured yet.
- To satisfy this requirement, publish this code to a public GitHub repo:

```bash
cd arclend
git init
git add .
git commit -m "ArcLend: Solana + Arcium private lending app"
git branch -M main
git remote add origin https://github.com/<your-username>/arclend.git
git push -u origin main
```

### 4) Submission language
- All documentation and the requirement summary are in English.

## How Arcium Provides Privacy

1. Client encrypts payloads with Arcium MXE public key material using RescueCipher.
2. Program queues MPC computation (`invoke` phase) for an initialized computation definition.
3. Arcium executes circuits on encrypted values.
4. Callback instruction stores/handles encrypted outputs.
5. Trader waits for finalization and decrypts only their own readable outputs.

Each encrypted workflow follows Arcium's required 3-step model:
- `init_comp_def` (once per encrypted instruction after deploy)
- invoke instruction from client
- callback instruction from Arcium cluster

## Repository Structure

```text
arclend/
├── encrypted-ixs/                      # Arcis encrypted circuits
├── programs/<arclend-program>/src/lib.rs # Anchor program + Arcium callbacks
├── tests/<arclend>.ts                   # Anchor/TS integration tests
└── app/                                # Next.js App Router frontend
```

## Prerequisites

- Rust stable + Cargo
- Solana CLI `2.3.0`
- Anchor CLI `0.32.1`
- Arcium CLI
- Node.js 20+
- Yarn 1.22+
- Devnet RPC URL (Helius recommended)

## Setup

```bash
cd arclend
cp app/.env.example app/.env.local

# install frontend + test dependencies
yarn install

# initialize Arcium scaffold metadata (first run)
arcium init

# build encrypted circuits
arcium build

# build Anchor program
anchor build
```

## Devnet Deploy

```bash
# set your RPC first
export HELIUS_DEVNET_RPC_URL="https://devnet.helius-rpc.com/?api-key=<api-key>"

# deploy with Arcium-required flags
arcium deploy --cluster-offset 456 --recovery-set-size 4 --keypair-path ~/.config/solana/id.json --rpc-url "$HELIUS_DEVNET_RPC_URL"

# deploy/update the Solana program
anchor deploy --provider.cluster devnet
```

## Initialize Computation Definitions

Run once after deployment:

```bash
anchor run test
```

Or call the three init instructions from your client:
- `init_open_position_comp_def`
- `init_check_liquidation_comp_def`
- `init_close_position_comp_def`

## Run Tests

```bash
yarn test:program
```

## Run Frontend

```bash
cd app
yarn dev
```

Open `http://localhost:3000`.

## Architecture Diagram

```text
+----------------------+         +-------------------------------+
| Next.js Frontend     |         | Solana Program (Anchor)       |
| - TradeForm          | invoke  | - open_position               |
| - PositionCard       +-------->+ - check_liquidation           |
| - PnlReveal          |         | - close_position              |
+----------+-----------+         | - *_callback handlers         |
           |                     +---------------+---------------+
           | encrypted payload                   |
           v                                     | queue_computation
+----------------------+                         v
| Arcium Client SDK    |                 +-------------------------+
| - getMXEPublicKey    |                 | Arcium MPC Network      |
| - RescueCipher       |                 | - open_position circuit |
| - awaitFinalization  |                 | - liquidation circuit   |
+----------+-----------+                 | - close_position circuit|
           | decrypt result              +-----------+-------------+
           +----------------------------------------+
                                callback ciphertext / finalization
```

## Production Notes

- UI deliberately avoids exposing position size and entry price.
- Liquidation output is a private binary signal, not a threshold leak.
- Use dedicated fee vault operations in `GlobalState` for production fee accounting.
- For mainnet hardening, add rate-limits, slippage controls, and risk guardrails at order ingress.
