# Deployment Guide

## CI Fixes Applied

All CI pipeline errors have been resolved:

### 1. **Lint & Format, Typecheck, Test (Node 22)** - pnpm Lockfile Issues

- **Issue**: `@stellar/freighter-api` peer dependency was causing lockfile conflicts
- **Fix**: Marked `@stellar/freighter-api` as optional peer dependency in
  `packages/wallet-adapter/package.json`
- **Result**: `pnpm install --frozen-lockfile` now works correctly

### 2. **Test Soroban Contracts** - Missing System Dependencies

- **Issue**: Missing `dbus-1` library required by `stellar-cli`
- **Fix**: Added system dependency installation step in CI workflow:
  ```yaml
  - name: Install system dependencies
    run: |
      sudo apt-get update
      sudo apt-get install -y libdbus-1-dev pkg-config
  ```
- **Result**: Contract tests and builds now pass

### 3. **Build Demo App** - Node.js Module Imports in Browser

- **Issue**: SDK was importing Node.js modules (`fs`, `path`, `url`) at the top level, causing
  browser bundle failures
- **Fix**:
  - Refactored SDK to use dynamic imports for Node.js modules (only loaded when needed)
  - Updated `tsup.config.ts` to set `platform: "node"` and `target: "node18"`
  - Fixed package.json exports to put `types` first for proper TypeScript resolution
- **Result**: Browser builds now succeed, Node.js functionality preserved

## Manual Contract Deployment to Testnet

### Prerequisites

1. **Install Stellar CLI**:

   ```bash
   cargo install --locked stellar-cli
   ```

2. **Generate and Fund Deployer Account**:

   ```bash
   # Generate a new keypair
   stellar keys generate --global deployer --network testnet

   # Get the public key
   stellar keys address deployer

   # Fund it at https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY
   ```

3. **Set Environment Variables**:
   ```bash
   export STELLAR_SECRET="S..."  # Your secret key
   export STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
   ```

### Deploy Contracts

Run the deployment script:

```bash
./scripts/deploy.sh testnet
```

This will:

1. Build all WASM contracts
2. Upload and deploy smart-wallet, session-keys, and spending-limits contracts
3. Initialize each contract with appropriate parameters
4. Write deployment details to `deployments/testnet.json`

### Verify Deployment

```bash
# Check smart-wallet contract
stellar contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- signers

# Output should show the deployer as the initial signer
```

### Update Documentation

After successful deployment, update:

1. `README.md` - Add contract IDs to the "Live deployment (Testnet)" section
2. `deployments/testnet.json` - Should be auto-updated by the deploy script
3. `.env` files in app and examples - Add contract IDs for demo applications

## Alternative: TypeScript Deployment Script

> Note: A TypeScript-based deployment script is planned for a future update. For now, use the bash
> script `./scripts/deploy.sh` which is battle-tested.

## CI Status

All CI checks are now passing:

- ✅ Lint & Format
- ✅ Typecheck
- ✅ Test (Node 22)
- ✅ Test Soroban Contracts
- ✅ Build
- ✅ Build Demo App

## Next Steps

1. Deploy contracts to testnet using one of the methods above
2. Update contract IDs in documentation
3. Deploy demo app to Vercel with updated contract IDs
4. Test end-to-end functionality
