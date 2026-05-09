/** Minimal interface every wallet adapter must implement. */
export interface WalletAdapter {
  /** Human-readable wallet name (e.g. "Freighter") */
  readonly name: string;
  /** Whether the wallet extension is installed in the browser */
  isInstalled(): Promise<boolean>;
  /** Prompt the user to connect and return their public key */
  connect(): Promise<ConnectResult>;
  /** Sign an XDR-encoded transaction and return the signed XDR */
  signTransaction(xdr: string, opts?: SignOptions): Promise<string>;
  /** Disconnect / clear the session */
  disconnect(): Promise<void>;
}

export interface ConnectResult {
  publicKey: string;
  network: string;
}

export interface SignOptions {
  networkPassphrase?: string;
  accountToSign?: string;
}

export interface WalletInfo {
  name: string;
  installed: boolean;
  connected: boolean;
  publicKey?: string;
}
