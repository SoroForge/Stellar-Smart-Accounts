import { readFileSync } from "node:fs";

import { SmartAccount } from "../../packages/sdk/src/index.js";

interface DeploymentFile {
  contracts: {
    smartWallet: { contractId: string };
  };
}

async function main(): Promise<void> {
  let deployment: DeploymentFile;
  try {
    deployment = JSON.parse(readFileSync("deployments/testnet.json", "utf8")) as DeploymentFile;
  } catch {
    console.error("deployments/testnet.json not found. Run scripts/deploy.sh testnet first.");
    process.exit(1);
  }

  const contractId = deployment.contracts.smartWallet.contractId;
  console.log("Connecting to smart wallet:", contractId);

  const wallet = SmartAccount.connect(contractId, {
    network: {
      network: "testnet",
      rpcUrl: "https://soroban-testnet.stellar.org",
      networkPassphrase: "Test SDF Network ; September 2015",
    },
    signerConfig: {
      signers: [],
      threshold: 1,
    },
  });

  const signers = await wallet.getSigners();
  console.log("Current signers:");
  for (const s of signers) {
    console.log(`  ${s.address} (weight: ${String(s.weight)})`);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
