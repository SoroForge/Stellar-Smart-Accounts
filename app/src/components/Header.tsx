import React from "react";
import { Link } from "react-router-dom";

import { useFreighter } from "../hooks/useFreighter";

export const Header: React.FC = () => {
  const { isConnected, publicKey, connect, disconnect } = useFreighter();

  const truncate = (pk: string): string => {
    if (pk.length <= 12) return pk;
    return `${pk.slice(0, 6)}...${pk.slice(-4)}`;
  };

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="text-lg font-bold text-gray-900">
          Stellar Smart Accounts
        </Link>
        <div className="flex items-center gap-3">
          {isConnected && publicKey ? (
            <>
              <span className="hidden text-sm text-gray-600 sm:inline">{truncate(publicKey)}</span>
              <button
                onClick={disconnect}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={connect}
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
