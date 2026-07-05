/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SMART_WALLET_CONTRACT_ID: string;
  readonly VITE_SESSION_KEYS_CONTRACT_ID: string;
  readonly VITE_SPENDING_LIMITS_CONTRACT_ID: string;
  readonly VITE_STELLAR_RPC_URL: string;
  readonly VITE_NETWORK_PASSPHRASE: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
