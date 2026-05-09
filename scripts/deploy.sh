#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Deploy stellar-smart-accounts contracts to a Stellar network
# =============================================================================
#
# Usage:
#   ./scripts/deploy.sh [testnet|mainnet|futurenet]
#
# Required environment variables:
#   STELLAR_SECRET   — Secret key of the deployer account (funded)
#   STELLAR_RPC_URL  — Soroban RPC endpoint
#
# Optional:
#   NETWORK_PASSPHRASE — defaults to the standard passphrase for the chosen network
#
# Example:
#   STELLAR_SECRET=S... ./scripts/deploy.sh testnet
# =============================================================================

set -euo pipefail

NETWORK="${1:-testnet}"

# ---------------------------------------------------------------------------
# Validate inputs
# ---------------------------------------------------------------------------

if [[ -z "${STELLAR_SECRET:-}" ]]; then
  echo "Error: STELLAR_SECRET is not set."
  exit 1
fi

if [[ -z "${STELLAR_RPC_URL:-}" ]]; then
  echo "Error: STELLAR_RPC_URL is not set."
  exit 1
fi

echo "Deploying to: $NETWORK"
echo "RPC:          $STELLAR_RPC_URL"

# ---------------------------------------------------------------------------
# Build contracts
# ---------------------------------------------------------------------------

echo ""
echo "Building Soroban contracts..."
(cd contracts && cargo build --target wasm32-unknown-unknown --release)

WASM_DIR="contracts/target/wasm32-unknown-unknown/release"

# ---------------------------------------------------------------------------
# TODO: Upload & deploy each contract
# ---------------------------------------------------------------------------
# stellar contract upload --wasm "$WASM_DIR/smart_wallet.wasm" ...
# stellar contract deploy --wasm-hash <hash> ...

echo ""
echo "TODO: complete deployment steps in scripts/deploy.sh"
echo "See: https://developers.stellar.org/docs/tools/developer-tools/cli/stellar-cli"
