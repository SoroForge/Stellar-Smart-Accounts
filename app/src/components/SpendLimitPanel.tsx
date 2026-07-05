import React from "react";

interface SpendLimitPanelProps {
  assetAddress: string;
}

export const SpendLimitPanel: React.FC<SpendLimitPanelProps> = ({ assetAddress }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Spending Limits</h3>
      <p className="text-sm text-gray-400">
        Asset: <span className="font-mono">{assetAddress}</span>
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Spending limits are managed by the standalone spending-limits contract. Call
        <code className="mx-1 rounded bg-gray-100 px-1 text-xs">set_limit</code>
        directly on the deployed contract to configure caps.
      </p>
    </div>
  );
};
