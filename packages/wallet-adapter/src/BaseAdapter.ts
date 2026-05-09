import type { ConnectResult, SignOptions, WalletAdapter, WalletInfo } from "./types.js";

/**
 * Abstract base class providing shared logic for all wallet adapters.
 * Extend this and implement the abstract methods for a new connector.
 */
export abstract class BaseAdapter implements WalletAdapter {
  abstract readonly name: string;

  abstract isInstalled(): Promise<boolean>;
  abstract connect(): Promise<ConnectResult>;
  abstract signTransaction(xdr: string, opts?: SignOptions): Promise<string>;
  abstract disconnect(): Promise<void>;

  /** Convenience method: return a summary of the wallet state. */
  async getInfo(): Promise<WalletInfo> {
    const installed = await this.isInstalled();
    return {
      name: this.name,
      installed,
      connected: false, // TODO: track connection state in subclasses
    };
  }
}
