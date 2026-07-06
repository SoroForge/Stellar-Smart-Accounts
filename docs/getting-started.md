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

## Step 3 — Use pre-deployed contracts (recommended)

The contracts are already deployed to Stellar Testnet:

| Contract        | Contract ID                                                |
| --------------- | ---------------------------------------------------------- |
| smart-wallet    | `CBUEUWCNWF3Q5KCDA46SCBREGZUY5DVIF25T52D6MRYPKWWHJLLSWDP4` |
| session-keys    | `CBMJ52UOFODPM2THFP7E4ZO73LTPROEXRUPJO7LCSB6UTVIP7AO4JGT3` |
| spending-limits | `CDVQB6HYHLBZRRA5SKO2M55HBVZ2PLEFCLDP6662WFK7QSKW6RJMVDA5` |

See [`deployments/testnet.json`](../deployments/testnet.json) for full deployment details including
WASM hashes.

### Connect to the pre-deployed smart wallet

```typescript
import { SmartAccount } from "@stellar-smart-accounts/sdk";
import { Networks } from "@stellar/stellar-sdk";

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

// Read the current signers
const signers = await wallet.getSigners();
console.log("Signers:", signers);
```

## Step 4 — Deploy your own wallet (optional)

If you want to deploy your own instance:

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

## Step 5 — Interact with your wallet

```typescript
// Add a new signer
await wallet.addSigner({ address: "GNEW...9999", weight: 1 });

// Issue a session key
await wallet.issueSessionKey({
  address: "GSESSION...",
  expiresAtLedger: 1000000,
  maxFeeStoops: 100_000n,
});

// Configure social recovery
await wallet.configureRecovery({
  guardians: ["GFRIEND1...", "GFRIEND2...", "GFRIEND3..."],
  threshold: 2,
});
```

## Next steps

- [API reference](./api-reference.md) — full SDK interface documentation
- [Architecture](./architecture.md) — how the contracts fit together
- [Examples](/examples) — runnable end-to-end examples
