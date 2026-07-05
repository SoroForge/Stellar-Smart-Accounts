import React, { useState } from "react";

import type { ExecutionResult } from "@stellar-smart-accounts/sdk";

interface SessionKeyPanelProps {
  onIssue: (address: string, expiresAtLedger: number) => Promise<ExecutionResult>;
  onRevoke: (address: string) => Promise<ExecutionResult>;
}

export const SessionKeyPanel: React.FC<SessionKeyPanelProps> = ({ onIssue, onRevoke }) => {
  const [address, setAddress] = useState("");
  const [expiresAt, setExpiresAt] = useState("100000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleIssue = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await onIssue(address, parseInt(expiresAt, 10));
      if (result.success) {
        setSuccess(`Session key issued. Tx: ${result.transactionHash}`);
      } else {
        setError(result.error ?? "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await onRevoke(address);
      if (result.success) {
        setSuccess(`Session key revoked. Tx: ${result.transactionHash}`);
      } else {
        setError(result.error ?? "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Session Keys</h3>
      {error && <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      {success && (
        <div className="mb-3 rounded-md bg-green-50 p-2 text-sm text-green-700">{success}</div>
      )}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Session key address (G...)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Expires at ledger"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={handleIssue}
            disabled={loading || !address}
            className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Issue
          </button>
          <button
            onClick={handleRevoke}
            disabled={loading || !address}
            className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            Revoke
          </button>
        </div>
      </div>
    </div>
  );
};
