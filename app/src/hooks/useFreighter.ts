import { useEffect, useState } from "react";

import { FreighterAdapter } from "@stellar-smart-accounts/wallet-adapter";

const adapter = new FreighterAdapter();

interface FreighterState {
  publicKey: string | null;
  isConnected: boolean;
  isInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (xdr: string, networkPassphrase?: string) => Promise<string>;
}

export function useFreighter(): FreighterState {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    void (async () => {
      const installed = await adapter.isInstalled();
      setIsInstalled(installed);
    })();
  }, []);

  const connect = async (): Promise<void> => {
    const result = await adapter.connect();
    setPublicKey(result.publicKey);
    setIsConnected(true);
  };

  const disconnect = async (): Promise<void> => {
    await adapter.disconnect();
    setPublicKey(null);
    setIsConnected(false);
  };

  const signTransaction = async (xdr: string, networkPassphrase?: string): Promise<string> => {
    return adapter.signTransaction(xdr, { networkPassphrase });
  };

  return { publicKey, isConnected, isInstalled, connect, disconnect, signTransaction };
}
