import React, { useState } from "react";

import { SmartAccount } from "@stellar-smart-accounts/sdk";
import type { SmartWalletDeployResult } from "@stellar-smart-accounts/sdk";

interface DeployWalletProps {
  publicKey: string;
  rpcUrl: string;
  networkPassphrase: string;
  sessionKeysContractId: string;
  onDeployed: (contractId: string) => void;
}

export const DeployWallet: React.FC<DeployWalletProps> = ({
  publicKey,
  rpcUrl,
  networkPassphrase,
  sessionKeysContractId,
  onDeployed,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SmartWalletDeployResult | null>(null);

  const handleDeploy = async () => {
    setLoading(true);
    setError(null);
    try {
      const deployResult = await SmartAccount.deploy({
        network: {
          network: "testnet",
          rpcUrl,
          networkPassphrase,
        },
        signerConfig: {
          signers: [{ address: publicKey, weight: 1 }],
          threshold: 1,
        },
        deployerSecret: "",
        sessionKeysContractId,
      });
      setResult(deployResult);
      onDeployed(deployResult.contractId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Deploy New Wallet</h3>
      {error && <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      {result && (
        <div className="mb-3 rounded-md bg-green-50 p-2 text-sm text-green-700">
          Deployed: {result.contractId}
        </div>
      )}
      <button
        onClick={handleDeploy}
        disabled={loading}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Deploying...
          </span>
        ) : (
          "Deploy Smart Wallet"
        )}
      </button>
      <p className="mt-2 text-xs text-gray-400">
        The owner will be your connected Freighter address.
      </p>
    </div>
  );
};
