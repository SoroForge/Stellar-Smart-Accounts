import { useEffect, useState } from "react";

import { SmartAccount } from "@stellar-smart-accounts/sdk";
import type { Signer, SmartWalletConfig } from "@stellar-smart-accounts/sdk";

interface SmartAccountState {
  wallet: SmartAccount | null;
  signers: Signer[];
  loading: boolean;
  error: string | null;
}

export function useSmartAccount(contractId: string | null): SmartAccountState {
  const [wallet, setWallet] = useState<SmartAccount | null>(null);
  const [signers, setSigners] = useState<Signer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rpcUrl = import.meta.env.VITE_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
  const networkPassphrase =
    import.meta.env.VITE_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
  const sessionKeysContractId = import.meta.env.VITE_SESSION_KEYS_CONTRACT_ID || "";

  useEffect(() => {
    if (!contractId) {
      setWallet(null);
      setSigners([]);
      return;
    }

    const config: SmartWalletConfig = {
      network: { network: "testnet", rpcUrl, networkPassphrase },
      signerConfig: { signers: [], threshold: 1 },
      contractId,
      sessionKeysContractId,
    };

    const w = SmartAccount.connect(contractId, config);
    setWallet(w);
    setLoading(true);
    setError(null);

    void w
      .getSigners()
      .then((s: Signer[]) => setSigners(s))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [contractId, rpcUrl, networkPassphrase, sessionKeysContractId]);

  return { wallet, signers, loading, error };
}
