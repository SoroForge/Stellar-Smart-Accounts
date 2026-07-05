import React from "react";

import type { Signer } from "@stellar-smart-accounts/sdk";

interface SignerPanelProps {
  signers: Signer[];
  loading: boolean;
  error: string | null;
}

export const SignerPanel: React.FC<SignerPanelProps> = ({ signers, loading, error }) => {
  const truncate = (addr: string): string => {
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Signers</h3>
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
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
          Loading signers...
        </div>
      )}
      {error && <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      {!loading && !error && signers.length === 0 && (
        <p className="text-sm text-gray-400">No signers registered.</p>
      )}
      {!loading && signers.length > 0 && (
        <ul className="space-y-2">
          {signers.map((s, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
            >
              <span className="font-mono text-sm text-gray-900">{truncate(s.address)}</span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                weight: {s.weight}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
