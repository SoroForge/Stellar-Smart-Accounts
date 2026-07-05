import { isConnected, getNetwork, getPublicKey, signTransaction } from "@stellar/freighter-api";

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
    try {
      const result = await isConnected();
      return result.isConnected;
    } catch {
      return false;
    }
  }

  async connect(): Promise<ConnectResult> {
    const installed = await this.isInstalled();
    if (!installed) {
      throw new Error("Freighter is not installed");
    }

    try {
      const pubResult = await getPublicKey();
      const netResult = await getNetwork();

      this.connectedPublicKey = pubResult.publicKey;

      return {
        publicKey: pubResult.publicKey,
        network: netResult.networkPassphrase,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Freighter connect failed: ${msg}`);
    }
  }

  async signTransaction(xdr: string, opts?: SignOptions): Promise<string> {
    try {
      const freighterOpts: { networkPassphrase?: string; accountToSign?: string } = {};
      if (opts?.networkPassphrase) {
        freighterOpts.networkPassphrase = opts.networkPassphrase;
      }
      if (opts?.accountToSign) {
        freighterOpts.accountToSign = opts.accountToSign;
      }
      const result = await signTransaction(xdr, freighterOpts);

      let signedXdr: string;
      if (typeof result === "string") {
        signedXdr = result;
      } else if (typeof result === "object" && "signedTxXdr" in result) {
        signedXdr = (result as { signedTxXdr: string }).signedTxXdr;
      } else {
        throw new Error("Freighter returned no signed transaction");
      }

      if (!signedXdr) {
        throw new Error("Freighter returned an empty signed transaction");
      }

      return signedXdr;
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Freighter ")) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Freighter sign failed: ${msg}`);
    }
  }

  async disconnect(): Promise<void> {
    this.connectedPublicKey = null;
  }
}
