import type { ConnectResult, SignOptions, WalletAdapter, WalletInfo } from "./types.js";

/**
 * Abstract base class providing shared logic for all wallet adapters.
 * Extend this and implement the abstract methods for a new connector.
 */
export abstract class BaseAdapter implements WalletAdapter {
  abstract name: string;

  abstract isInstalled(): Promise<boolean>;
  abstract connect(): Promise<ConnectResult>;
  abstract signTransaction(xdr: string, opts?: SignOptions): Promise<string>;
  abstract disconnect(): Promise<void>;

  /**
   * Subclasses override this to expose their cached public key (or `null`
   * when disconnected). Used by `getInfo()` to report connection state.
   */
  protected connectedPublicKey: string | null = null;

  /** Convenience method: return a summary of the wallet state. */
  async getInfo(): Promise<WalletInfo> {
    const installed = await this.isInstalled();
    const publicKey = this.connectedPublicKey;
    const info: WalletInfo = {
      name: this.name,
      installed,
      connected: publicKey !== null,
    };
    if (publicKey !== null) {
      info.publicKey = publicKey;
    }
    return info;
  }
}
