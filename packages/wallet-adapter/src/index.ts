/**
 * @stellar-smart-accounts/wallet-adapter
 *
 * Drop-in adapter layer connecting stellar-smart-accounts to popular
 * Stellar wallet extensions (Freighter, xBull, Lobstr).
 *
 * @packageDocumentation
 */

export type { WalletAdapter, WalletInfo, ConnectResult } from "./types.js";
export { BaseAdapter } from "./BaseAdapter.js";
export { FreighterAdapter } from "./adapters/freighter.js";
