/**
 * @stellar-smart-accounts/sdk
 *
 * Account abstraction layer for the Stellar ecosystem.
 * Smart wallets, session keys, social recovery, and spending limits
 * — built on Soroban smart contracts.
 *
 * @packageDocumentation
 */

export { SmartAccount } from "./SmartAccount";
export type {
  ExecutionResult,
  NetworkConfig,
  RecoveryConfig,
  RecoveryProposal,
  SessionKeyConfig,
  Signer,
  SignerConfig,
  SmartWalletConfig,
  SmartWalletDeployResult,
  StellarNetwork,
} from "./types";

export const VERSION = "0.0.1";
