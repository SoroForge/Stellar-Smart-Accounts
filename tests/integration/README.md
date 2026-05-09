# Integration Tests

Integration tests in this directory require a live Stellar node.

## Running locally

```bash
# Set required environment variables
export STELLAR_NETWORK=testnet
export STELLAR_RPC_URL=https://soroban-testnet.stellar.org
export STELLAR_SECRET=S...   # a funded testnet keypair

pnpm test:integration
```

Integration tests are skipped in CI unless the `STELLAR_NETWORK` env var is set. They are intended
to be run manually before releases.
