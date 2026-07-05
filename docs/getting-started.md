# Getting started

This guide walks you through deploying your first smart wallet on Stellar Testnet.

## Prerequisites

| Tool        | Version | Install                                             |
| ----------- | ------- | --------------------------------------------------- |
| Node.js     | ≥ 22    | [nodejs.org](https://nodejs.org)                    |
| pnpm        | ≥ 8     | `npm i -g pnpm`                                     |
| Rust        | stable  | [rustup.rs](https://rustup.rs)                      |
| stellar-cli | latest  | `cargo install --locked stellar-cli --features opt` |

## Step 1 — Install the SDK

```bash
pnpm add @stellar-smart-accounts/sdk @stellar/stellar-sdk
```

## Step 2 — Fund a testnet account

```bash
stellar keys generate --global deployer --network testnet
stellar keys address deployer
# Fund it at https://friendbot.stellar.org/?addr=<address>
```

## Step 3 — Deploy a smart wallet

The contracts are pre-deployed to Stellar Testnet. See
[`deployments/testnet.json`](../deployments/testnet.json) for the live contract IDs.

To deploy your own wallet instance:

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
    signers: [{ address: "GABC...1234", weight: 1 }],
    threshold: 1,
  },
  deployerSecret: "S...", // your funded testnet secret key
});

console.log("Smart wallet deployed:", result.contractId);
```

## Step 4 — Connect an existing wallet

```typescript
import { SmartAccount } from "@stellar-smart-accounts/sdk";
import { Networks } from "@stellar/stellar-sdk";

// Use the pre-deployed testnet contract ID from deployments/testnet.json
const wallet = SmartAccount.connect("CACT_ID_FROM_TESTNET_JSON", {
  network: {
    network: "testnet",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: Networks.TESTNET,
  },
  signerConfig: {
    signers: [{ address: "GABC...1234", weight: 1 }],
    threshold: 1,
  },
});

// Read the current signers from the live contract
const signers = await wallet.getSigners();
console.log("Signers:", signers);
```

## Next steps

- [API reference](./api-reference.md) — full SDK interface documentation
- [Architecture](./architecture.md) — how the contracts fit together
- [Examples](/examples) — runnable end-to-end examples
