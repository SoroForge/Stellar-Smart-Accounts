import React, { useState } from "react";

import type { ExecutionResult } from "@stellar-smart-accounts/sdk";
import { SmartAccount } from "@stellar-smart-accounts/sdk";

import { DeployWallet } from "../components/DeployWallet";
import { Header } from "../components/Header";
import { SessionKeyPanel } from "../components/SessionKeyPanel";
import { SignerPanel } from "../components/SignerPanel";
import { SpendLimitPanel } from "../components/SpendLimitPanel";
import { WalletStatus } from "../components/WalletStatus";
import { useFreighter } from "../hooks/useFreighter";
import { useSmartAccount } from "../hooks/useSmartAccount";

export const DemoPage: React.FC = () => {
  const freighter = useFreighter();
  const [contractId, setContractId] = useState(import.meta.env.VITE_SMART_WALLET_CONTRACT_ID || "");
  const { wallet, signers, loading, error } = useSmartAccount(contractId || null);

  const rpcUrl = import.meta.env.VITE_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
  const networkPassphrase =
    import.meta.env.VITE_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
  const sessionKeysContractId = import.meta.env.VITE_SESSION_KEYS_CONTRACT_ID || "";
  const spendingLimitsContractId = import.meta.env.VITE_SPENDING_LIMITS_CONTRACT_ID || "";

  const handleIssueSessionKey = async (
    address: string,
    expiresAtLedger: number,
  ): Promise<ExecutionResult> => {
    if (!wallet) throw new Error("Wallet not connected");
    return wallet.issueSessionKey({
      address,
      expiresAtLedger,
      maxFeeStoops: 100_000n,
    });
  };

  const handleRevokeSessionKey = async (address: string): Promise<ExecutionResult> => {
    if (!wallet) throw new Error("Wallet not connected");
    return wallet.revokeSessionKey(address);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Wallet Demo</h1>
          <p className="mt-1 text-sm text-gray-600">
            Contract ID: <span className="font-mono text-gray-900">{contractId || "Not set"}</span>
          </p>
        </div>

        {!freighter.isInstalled && (
          <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
            Freighter wallet extension is not detected. Install it from{" "}
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              freighter.app
            </a>{" "}
            to use the interactive features.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <WalletStatus
            publicKey={freighter.publicKey}
            isConnected={freighter.isConnected}
            isInstalled={freighter.isInstalled}
          />

          <SignerPanel signers={signers} loading={loading} error={error} />
        </div>

        {freighter.isConnected && freighter.publicKey && (
          <DeployWallet
            publicKey={freighter.publicKey}
            rpcUrl={rpcUrl}
            networkPassphrase={networkPassphrase}
            sessionKeysContractId={sessionKeysContractId}
            onDeployed={(id) => setContractId(id)}
          />
        )}

        {wallet && (
          <div className="grid gap-6 md:grid-cols-2">
            <SessionKeyPanel onIssue={handleIssueSessionKey} onRevoke={handleRevokeSessionKey} />
            <SpendLimitPanel assetAddress={spendingLimitsContractId} />
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-700">Configured Contracts</h3>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Smart Wallet</dt>
              <dd className="font-mono text-gray-900">{contractId || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Session Keys</dt>
              <dd className="font-mono text-gray-900">{sessionKeysContractId || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Spending Limits</dt>
              <dd className="font-mono text-gray-900">{spendingLimitsContractId || "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="text-center text-xs text-gray-400">
          SmartAccount SDK v{SmartAccount ? "0.1.0" : "—"}
        </div>
      </div>
    </div>
  );
};
