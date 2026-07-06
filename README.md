# Stellar-smart-accounts

> **Account abstraction for the Stellar ecosystem** — smart wallets with multi-sig, social recovery,
> session keys, and spending limits, built on Soroban smart contracts.

<p align="center">
  <a href="https://github.com/SoroForge/stellar-smart-accounts/actions/workflows/ci.yml">
    <img alt="CI" src="https://github.com/SoroForge/stellar-smart-accounts/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://www.npmjs.com/package/@stellar-smart-accounts/sdk">
    <img alt="npm" src="https://img.shields.io/npm/v/@stellar-smart-accounts/sdk?color=blue" />
  </a>
  <a href="https://github.com/SoroForge/stellar-smart-accounts/blob/main/CONTRIBUTING.md">
    <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen" />
  </a>
  <img alt="Stellar" src="https://img.shields.io/badge/Stellar-Mainnet%20%7C%20Testnet-7B68EE" />
</p>

---

## Table of contents

- [The problem](#the-problem)
- [How it works](#how-it-works)
- [Architecture](#architecture)
- [Features](#features)
- [Packages](#packages)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Contract reference](#contract-reference)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## The problem

Stellar accounts have exactly one critical weakness: a **single private key** controls everything.
Lose the key → lose all assets. Expose the key → wallet drained. This makes Stellar wallets
unsuitable for high-value use-cases without bespoke, off-chain key management.

Ethereum solved this with **account abstraction (ERC-4337)** — smart contract wallets that replace
the single-key model with programmable logic. Stellar already has the building blocks: native
multi-sig, weighted signers, time bounds, and the Soroban smart contract platform. Yet nobody has
assembled them into a reusable, open standard.

**`stellar-smart-accounts` fills that gap.**

---

## How it works

A `stellar-smart-accounts` wallet is a **Soroban smart contract** that acts as the on-chain
identity. The user's actual Stellar keypair is just one of potentially many signers. The contract
enforces policies — threshold weights, session expirations, spending caps — that no single key can
bypass.

```
User / dApp
     │
     ▼
┌──────────────────────────────────────┐
│         @stellar-smart-accounts/sdk   │  ← TypeScript SDK
│  (builds, signs & submits txns)       │
└──────────────────┬───────────────────┘
                   │  Soroban invocation
                   ▼
┌──────────────────────────────────────┐
│        smart-wallet contract          │  ← core on-chain logic
│  ┌─────────────┐  ┌────────────────┐ │
│  │  Signers &  │  │    Social      │ │
│  │  Threshold  │  │   Recovery     │ │
│  └─────────────┘  └────────────────┘ │
└───────────┬──────────────────────────┘
            │  cross-contract calls
     ┌──────┴──────┐
     ▼             ▼
┌─────────┐  ┌──────────────┐
│ session │  │  spending-   │
│  keys   │  │   limits     │
└─────────┘  └──────────────┘
```

Transactions flow through the SDK which constructs the correct Soroban invocation, gathers the
required signatures from all registered signers, and submits the transaction to the Stellar RPC
node. The contract on-chain validates all signatures before executing any operation.

---

## Architecture

### Contracts (`/contracts`)

| Contract          | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `smart-wallet`    | Core wallet: signer registry, threshold enforcement, recovery orchestration |
| `session-keys`    | Issue and revoke time-limited sub-keys with scoped permissions              |
| `spending-limits` | Per-asset, per-period spending caps enforced before every payment           |

### Packages (`/packages`)

| Package                                  | Description                                                                      |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `@stellar-smart-accounts/sdk`            | TypeScript SDK — deploy, configure, and transact with smart wallets              |
| `@stellar-smart-accounts/wallet-adapter` | Drop-in adapter for popular Stellar wallet connectors (Freighter, xBull, Lobstr) |

---

## Features

- **Multi-signer wallet** — register multiple Stellar keypairs with individual weights; transactions
  require signatures reaching a configurable threshold.

- **Social recovery** — designate trusted guardians; if you lose access, a quorum of guardians can
  restore control to a new key without any central authority.

- **Session keys** — issue short-lived sub-keys scoped to specific operations (e.g. "this key may
  only submit payments up to 10 XLM for the next 100 ledgers"). Perfect for dApps and automated
  bots.

- **Spending limits** — cap daily or weekly outflows per asset at the contract level — even a
  compromised signer cannot drain the wallet above the cap.

- **Gas delegation (meta-transactions)** — a relayer can pay the XLM transaction fee on behalf of
  the wallet owner, enabling gasless UX for end users.

- **Fully open & auditable** — MIT license, all contract code in this repo, no closed back-ends.

---

## Packages

### `@stellar-smart-accounts/sdk`

```bash
npm install @stellar-smart-accounts/sdk @stellar/stellar-sdk
# or
pnpm add @stellar-smart-accounts/sdk @stellar/stellar-sdk
```

### `@stellar-smart-accounts/wallet-adapter`

```bash
npm install @stellar-smart-accounts/wallet-adapter
```

---

## Getting started

### Prerequisites

| Tool        | Version                           |
| ----------- | --------------------------------- |
| Node.js     | ≥ 22                              |
| pnpm        | ≥ 8                               |
| Rust        | stable (for contract development) |
| stellar-cli | latest                            |

### Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/stellar-smart-accounts.git
cd stellar-smart-accounts
pnpm install
```

### Build TypeScript packages

```bash
pnpm build
```

### Build Soroban contracts

```bash
# Install Rust target
rustup target add wasm32-unknown-unknown

# Build all contracts
pnpm build:contracts
```

### Run tests

```bash
# TypeScript tests
pnpm test

# Contract tests
pnpm test:contracts
```

---

## Live deployment (Testnet)

The following contracts are deployed to **Stellar Testnet** and ready to use.

### Contract Addresses

| Contract        | Contract ID                                                | Explorer                                                                                                                            |
| --------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| smart-wallet    | `CBUEUWCNWF3Q5KCDA46SCBREGZUY5DVIF25T52D6MRYPKWWHJLLSWDP4` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBUEUWCNWF3Q5KCDA46SCBREGZUY5DVIF25T52D6MRYPKWWHJLLSWDP4) |
| session-keys    | `CBMJ52UOFODPM2THFP7E4ZO73LTPROEXRUPJO7LCSB6UTVIP7AO4JGT3` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBMJ52UOFODPM2THFP7E4ZO73LTPROEXRUPJO7LCSB6UTVIP7AO4JGT3) |
| spending-limits | `CDVQB6HYHLBZRRA5SKO2M55HBVZ2PLEFCLDP6662WFK7QSKW6RJMVDA5` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDVQB6HYHLBZRRA5SKO2M55HBVZ2PLEFCLDP6662WFK7QSKW6RJMVDA5) |

### Deployment Details

- **Network**: Stellar Testnet
- **RPC Endpoint**: https://soroban-testnet.stellar.org
- **Network Passphrase**: `Test SDF Network ; September 2015`
- **Deployed**: July 6, 2026
- **Deployer Account**: `GC6C5LTM55PL46YKOQR7M6PKECQ6TJ66D6ZSLAUC6MYRM5DAYPVJ26CN`

For complete deployment details including WASM hashes, see
[`deployments/testnet.json`](./deployments/testnet.json).

### Demo Application

**Demo**: [https://stellar-smart-accounts.vercel.app](https://stellar-smart-accounts.vercel.app)
_(coming soon)_

---

## Usage

### Deploy a new smart wallet

```typescript
import { SmartAccount } from "@stellar-smart-accounts/sdk";
import { Networks } from "@stellar/stellar-sdk";

const result = await SmartAccount.deploy({
  network: {
    network: "testnet",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: Networks.TESTNET,
  },
  signerConfig: {
    signers: [
      { address: "GABC...1234", weight: 2 },
      { address: "GDEF...5678", weight: 1 },
    ],
    threshold: 2,
  },
});

console.log("Smart wallet deployed:", result.contractId);
```

### Connect to an existing wallet

```typescript
import { SmartAccount } from "@stellar-smart-accounts/sdk";
import { Networks } from "@stellar/stellar-sdk";

// Connect to the pre-deployed testnet smart wallet
const wallet = SmartAccount.connect("CBUEUWCNWF3Q5KCDA46SCBREGZUY5DVIF25T52D6MRYPKWWHJLLSWDP4", {
  network: {
    network: "testnet",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: Networks.TESTNET,
  },
  signerConfig: {
    signers: [{ address: "YOUR_PUBLIC_KEY", weight: 1 }],
    threshold: 1,
  },
  sessionKeysContractId: "CBMJ52UOFODPM2THFP7E4ZO73LTPROEXRUPJO7LCSB6UTVIP7AO4JGT3",
});

// Read current signers
const signers = await wallet.getSigners();
console.log("Signers:", signers);
```

### Add a signer

```typescript
await wallet.addSigner({ address: "GNEW...9999", weight: 1 });
```

### Configure social recovery

```typescript
await wallet.configureRecovery({
  guardians: ["GFRIEND1...", "GFRIEND2...", "GFRIEND3..."],
  threshold: 2, // 2 of 3 guardians needed
});
```

### Issue a session key

```typescript
await wallet.issueSessionKey({
  address: "GSESSION...",
  expiresAtLedger: currentLedger + 5000,
  maxFeeStoops: 100_000n, // 0.01 XLM
});
```

### Initiate social recovery (if key is lost)

```typescript
// Any guardian calls:
await wallet.initiateRecovery("GNEWOWNER...");

// Each guardian approves:
await wallet.approveRecovery(proposalId, guardianAddress);
```

---

## Contract reference

Detailed contract interface documentation lives in [`/docs`](./docs):

- [Architecture overview](./docs/architecture.md)
- [Smart wallet interface](./docs/smart-wallet.md)
- [Session keys interface](./docs/session-keys.md)
- [Spending limits interface](./docs/spending-limits.md)

---

## Roadmap

The project is in active early development. Here is the planned work, roughly in priority order:

### v0.1 — Foundation

- [x] `smart-wallet` contract: signer management + threshold enforcement
- [x] `smart-wallet` contract: social recovery flow
- [x] TypeScript SDK: `SmartAccount.deploy()` and `SmartAccount.connect()`
- [x] TypeScript SDK: signer CRUD methods
- [x] Testnet deployment scripts
- [x] End-to-end integration tests

### v0.2 — Session keys & limits

- [x] `session-keys` contract
- [x] `spending-limits` contract
- [x] SDK: session key issuance and revocation
- [ ] SDK: spending limit configuration

### v0.3 — Wallet adapter & UX

- [x] `wallet-adapter` package with Freighter support
- [ ] Gasless / meta-transaction relayer interface
- [x] Example dApp

### v0.4 — Hardening

- [ ] Third-party security audit
- [ ] Fuzzing harness for contracts
- [ ] Mainnet deployment

> Want to pick up a task? Browse
> [open issues](https://github.com/Anas-01/stellar-smart-accounts/issues) and look for the
> `good first issue` or `help wanted` labels.

---

## Contributing

Contributions are welcome and appreciated! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for
guidelines on:

- Opening issues and feature requests
- Setting up your development environment
- Submitting pull requests
- Commit message conventions (we use [Conventional Commits](https://www.conventionalcommits.org))
- Releasing packages

---

## Security

Security vulnerabilities should **not** be reported via GitHub issues. Please read
[SECURITY.md](./SECURITY.md) for responsible disclosure instructions.

---

## License

MIT © — see [LICENSE](./LICENSE).
