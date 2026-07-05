/**
 * Ambient type declarations for `@stellar/freighter-api`.
 *
 * This file provides type coverage when the `@stellar/freighter-api` package
 * is not installed in `node_modules` (e.g. offline development). When the real
 * package is installed, its bundled `.d.ts` takes precedence.
 *
 * Based on the Freighter API v1.x surface.
 */

declare module "@stellar/freighter-api" {
  export type FreighterRequest = Record<string, unknown>;

  export interface IsConnectedResult {
    isConnected: boolean;
  }

  export interface GetPublicKeyResult {
    publicKey: string;
  }

  export interface GetNetworkResult {
    network: string;
    networkPassphrase: string;
  }

  export interface SignTransactionResult {
    signedTxXdr: string;
    signerAddress?: string;
  }

  export interface SetAllowedStatusResult {
    isAllowed: boolean;
  }

  export function isConnected(): Promise<IsConnectedResult>;
  export function getPublicKey(): Promise<GetPublicKeyResult>;
  export function getNetwork(): Promise<GetNetworkResult>;
  export function signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      accountToSign?: string;
    },
  ): Promise<SignTransactionResult | string>;
  export function setAllowedStatus(): Promise<SetAllowedStatusResult>;
  export function getAddress(): Promise<GetPublicKeyResult>;
}
