import { BaseAdapter } from "../BaseAdapter.js";
import type { ConnectResult, SignOptions } from "../types.js";

/**
 * Wallet adapter for the Freighter browser extension.
 *
 * @see https://freighter.app
 *
 * @example
 * ```typescript
 * import { FreighterAdapter } from "@stellar-smart-accounts/wallet-adapter/freighter";
 *
 * const adapter = new FreighterAdapter();
 * if (await adapter.isInstalled()) {
 *   const { publicKey } = await adapter.connect();
 * }
 * ```
 */
export class FreighterAdapter extends BaseAdapter {
  readonly name = "Freighter";

  async isInstalled(): Promise<boolean> {
    // TODO: check window.freighter or @stellar/freighter-api
    throw new Error("FreighterAdapter.isInstalled() — not yet implemented");
  }

  async connect(): Promise<ConnectResult> {
    // TODO: call freighter getPublicKey() and getNetwork()
    throw new Error("FreighterAdapter.connect() — not yet implemented");
  }

  async signTransaction(xdr: string, _opts?: SignOptions): Promise<string> {
    // TODO: call freighter signTransaction()
    void xdr;
    throw new Error("FreighterAdapter.signTransaction() — not yet implemented");
  }

  async disconnect(): Promise<void> {
    // TODO: clear local session state
    throw new Error("FreighterAdapter.disconnect() — not yet implemented");
  }
}
