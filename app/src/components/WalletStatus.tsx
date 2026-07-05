import React from "react";

interface WalletStatusProps {
  publicKey: string | null;
  isConnected: boolean;
  isInstalled: boolean;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({
  publicKey,
  isConnected,
  isInstalled,
}) => {
  const truncate = (pk: string): string => {
    if (pk.length <= 16) return pk;
    return `${pk.slice(0, 8)}...${pk.slice(-6)}`;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-500">Wallet Status</h3>
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">Freighter installed</dt>
          <dd className={isInstalled ? "text-green-600" : "text-red-600"}>
            {isInstalled ? "Yes" : "No"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Connected</dt>
          <dd className={isConnected ? "text-green-600" : "text-gray-400"}>
            {isConnected ? "Yes" : "No"}
          </dd>
        </div>
        {publicKey && (
          <div className="flex justify-between">
            <dt className="text-gray-600">Public key</dt>
            <dd className="font-mono text-gray-900">{truncate(publicKey)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
};
