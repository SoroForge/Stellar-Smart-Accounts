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

# Set network passphrase based on target network
case "$NETWORK" in
  testnet)
    NETWORK_PASSPHRASE="${NETWORK_PASSPHRASE:-Test SDF Network ; September 2015}"
    ;;
  mainnet)
    NETWORK_PASSPHRASE="${NETWORK_PASSPHRASE:-Public Global Stellar Network ; September 2015}"
    ;;
  futurenet)
    NETWORK_PASSPHRASE="${NETWORK_PASSPHRASE:-Test SDF Future Network ; October 2022}"
    ;;
  *)
    echo "Error: Unknown network '$NETWORK'. Use testnet, mainnet, or futurenet."
    exit 1
    ;;
esac

DEPLOYER_PUBLIC=$(stellar keys address "$STELLAR_SECRET" 2>/dev/null || echo "")

echo "============================================="
echo " stellar-smart-accounts — Contract Deployment"
echo "============================================="
echo "Network:          $NETWORK"
echo "RPC:              $STELLAR_RPC_URL"
echo "Passphrase:       $NETWORK_PASSPHRASE"
echo "============================================="
echo ""

# ---------------------------------------------------------------------------
# Build contracts
# ---------------------------------------------------------------------------

echo "Building Soroban contracts..."
(cd contracts && cargo build --target wasm32-unknown-unknown --release)

WASM_DIR="contracts/target/wasm32-unknown-unknown/release"

# Copy wasm artifacts to deployments/wasm
mkdir -p deployments/wasm
cp "$WASM_DIR/smart_wallet.wasm" deployments/wasm/
cp "$WASM_DIR/session_keys.wasm" deployments/wasm/
cp "$WASM_DIR/spending_limits.wasm" deployments/wasm/

echo "WASM artifacts copied to deployments/wasm/"
echo ""

# ---------------------------------------------------------------------------
# Helper: upload + deploy + initialize a single contract
# ----------------------------------------------------------------------------

# upload_and_deploy <wasm_file> <contract_name> <init_args...>
# Sets: <CONTRACT_NAME_UPPER>_WASM_HASH and <CONTRACT_NAME_UPPER>_CONTRACT_ID
upload_and_deploy() {
  local wasm_file="$1"
  local contract_name="$2"
  local init_args=("${@:3}")
  local upper_name
  upper_name=$(echo "$contract_name" | tr '[:lower:]' '[:upper:]' | tr '-' '_')

  echo "--- Deploying $contract_name ---"

  # Upload WASM
  local wasm_hash
  wasm_hash=$(stellar contract upload \
    --network "$NETWORK" \
    --source-account "$STELLAR_SECRET" \
    --wasm "$WASM_DIR/$wasm_file" \
    --dump-i64-return-value 2>&1 | tail -1 | tr -d ' ')
  echo "  WASM hash: $wasm_hash"

  # Deploy contract
  local contract_id
  contract_id=$(stellar contract deploy \
    --network "$NETWORK" \
    --source-account "$STELLAR_SECRET" \
    --wasm-hash "$wasm_hash" \
    --dump-i64-return-value 2>&1 | tail -1 | tr -d ' ')
  echo "  Contract ID: $contract_id"

  # Initialize contract (if init args provided)
  if [[ ${#init_args[@]} -gt 0 ]]; then
    stellar contract invoke \
      --network "$NETWORK" \
      --source-account "$STELLAR_SECRET" \
      --id "$contract_id" \
      -- \
      initialize "${init_args[@]}"
    echo "  Initialized."
  fi

  # Export variables for the JSON writer
  export "${upper_name}_WASM_HASH=$wasm_hash"
  export "${upper_name}_CONTRACT_ID=$contract_id"

  echo ""
}

# ---------------------------------------------------------------------------
# Upload & deploy each contract
# ---------------------------------------------------------------------------

# smart-wallet: initialize(owner, threshold)
# Owner is the deployer's public key, threshold = 1
DEPLOYER_ADDR="${DEPLOYER_PUBLIC:-$(stellar keys address "$STELLAR_SECRET" 2>/dev/null || echo "")}"

upload_and_deploy "smart_wallet.wasm" "smart-wallet" "$DEPLOYER_ADDR" "1"
SMART_WALLET_WASM_HASH="$SMART_WALLET_WASM_HASH"
SMART_WALLET_CONTRACT_ID="$SMART_WALLET_CONTRACT_ID"

# session-keys: initialize(wallet_contract)
upload_and_deploy "session_keys.wasm" "session-keys" "$SMART_WALLET_CONTRACT_ID"
SESSION_KEYS_WASM_HASH="$SESSION_KEYS_WASM_HASH"
SESSION_KEYS_CONTRACT_ID="$SESSION_KEYS_CONTRACT_ID"

# spending-limits: initialize(wallet_contract)
upload_and_deploy "spending_limits.wasm" "spending-limits" "$SMART_WALLET_CONTRACT_ID"
SPENDING_LIMITS_WASM_HASH="$SPENDING_LIMITS_WASM_HASH"
SPENDING_LIMITS_CONTRACT_ID="$SPENDING_LIMITS_CONTRACT_ID"

# ---------------------------------------------------------------------------
# Write deployments/testnet.json
# ----------------------------------------------------------------------------

mkdir -p deployments

DEPLOYED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "deployments/${NETWORK}.json" <<EOF
{
  "network": "$NETWORK",
  "rpcUrl": "$STELLAR_RPC_URL",
  "networkPassphrase": "$NETWORK_PASSPHRASE",
  "contracts": {
    "smartWallet": {
      "wasmHash": "$SMART_WALLET_WASM_HASH",
      "contractId": "$SMART_WALLET_CONTRACT_ID"
    },
    "sessionKeys": {
      "wasmHash": "$SESSION_KEYS_WASM_HASH",
      "contractId": "$SESSION_KEYS_CONTRACT_ID"
    },
    "spendingLimits": {
      "wasmHash": "$SPENDING_LIMITS_WASM_HASH",
      "contractId": "$SPENDING_LIMITS_CONTRACT_ID"
    }
  },
  "deployedAt": "$DEPLOYED_AT",
  "deployedBy": "$DEPLOYER_PUBLIC"
}
EOF

echo "============================================="
echo " Deployment complete!"
echo "============================================="
echo ""
echo "Contract IDs:"
echo "  smart-wallet:     $SMART_WALLET_CONTRACT_ID"
echo "  session-keys:      $SESSION_KEYS_CONTRACT_ID"
echo "  spending-limits:  $SPENDING_LIMITS_CONTRACT_ID"
echo ""
echo "Deployment record: deployments/${NETWORK}.json"
echo ""
echo "Verify with:"
echo "  stellar contract invoke --id $SMART_WALLET_CONTRACT_ID --network $NETWORK -- signers"
