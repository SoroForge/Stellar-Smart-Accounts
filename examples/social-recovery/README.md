# Example: Social Recovery

Demonstrates configuring guardians and simulating a full recovery flow on Testnet.

## Run

```bash
export STELLAR_SECRET=S...
export STELLAR_RPC_URL=https://soroban-testnet.stellar.org

pnpm --filter @examples/social-recovery start
```

## What it covers

- Deploying a smart wallet
- Registering three guardians (2-of-3 threshold)
- Simulating key loss and initiating a recovery
- Each guardian approving the recovery
- Verifying the new owner is installed

> **Note:** This example will be updated once the social recovery contracts land in v0.1.
