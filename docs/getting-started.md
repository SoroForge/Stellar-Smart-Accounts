# Getting started

This guide walks you through deploying your first smart wallet on Stellar Testnet.

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 22 | [nodejs.org](https://nodejs.org) |
| pnpm | ≥ 8 | `npm i -g pnpm` |
| Rust | stable | [rustup.rs](https://rustup.rs) |
| stellar-cli | latest | `cargo install --locked stellar-cli --features opt` |

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

```typescript
// TODO: add example once SmartAccount.deploy() is implemented
```

## Step 4 — Connect an existing wallet

```typescript
// TODO: add example once SmartAccount.connect() is implemented
```

## Next steps

- [API reference](./api-reference.md) — full SDK interface documentation
- [Architecture](./architecture.md) — how the contracts fit together
- [Examples](/examples) — runnable end-to-end examples
