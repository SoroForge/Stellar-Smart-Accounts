import React from "react";
import { Link } from "react-router-dom";

const ARCH_DIAGRAM = `┌──────────────────────────────────────────────────────────────────┐
│                     @stellar-smart-accounts/sdk                   │
│               (TypeScript — builds & submits transactions)        │
└──────────────────────────────┬───────────────────────────────────┘
                               │ Soroban RPC
                               ▼
               ┌────────────────────────────────┐
               │       smart-wallet contract     │
               │  • Signer registry & threshold  │
               │  • Social recovery              │
               │  • Cross-contract delegation    │
               └──────────┬──────────┬──────────┘
                          │          │
               ┌──────────┘          └──────────┐
               ▼                                ▼
    ┌────────────────────┐          ┌──────────────────────┐
    │  session-keys       │          │   spending-limits     │
    │  contract           │          │   contract            │
    └────────────────────┘          └──────────────────────┘`;

export const HomePage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Stellar Smart Accounts</h1>
        <p className="mt-3 text-lg text-gray-600">
          Account abstraction for the Stellar ecosystem — smart wallets with multi-sig, social
          recovery, session keys, and spending limits.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            to="/demo"
            className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Try the demo &rarr;
          </Link>
          <a
            href="https://github.com/SoroForge/stellar-smart-accounts"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            GitHub
          </a>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
        <p className="mt-3 text-gray-600">
          A smart wallet is a Soroban smart contract that acts as the on-chain identity. The
          contract enforces policies — threshold weights, session expirations, spending caps — that
          no single key can bypass.
        </p>
        <pre className="mt-6 overflow-x-auto rounded-lg bg-gray-900 p-6 text-xs text-green-400">
          {ARCH_DIAGRAM}
        </pre>
      </div>
    </div>
  );
};
