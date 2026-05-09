# Example: Basic Wallet

Demonstrates deploying a smart wallet with a single signer and submitting a payment.

## Run

```bash
# From the repo root
pnpm install

# Set env vars
export STELLAR_SECRET=S...
export STELLAR_RPC_URL=https://soroban-testnet.stellar.org

pnpm --filter @examples/basic-wallet start
```

## What it covers

- Deploying a `SmartAccount` to Stellar Testnet
- Adding a second signer
- Submitting a payment through the smart wallet

> **Note:** This example will be updated once `SmartAccount.deploy()` is implemented.
