/**
 * Core types for stellar-smart-accounts SDK.
 */

import type { Transaction } from "@stellar/stellar-sdk";

// ---------------------------------------------------------------------------
// Network
// ---------------------------------------------------------------------------

export type StellarNetwork = "mainnet" | "testnet" | "futurenet" | "standalone";

export interface NetworkConfig {
  network: StellarNetwork;
  rpcUrl: string;
  networkPassphrase: string;
}

// ---------------------------------------------------------------------------
// Signers
// ---------------------------------------------------------------------------

export interface Signer {
  /** Stellar account address */
  address: string;
  /** Voting weight (1–255) */
  weight: number;
}

export interface SignerConfig {
  signers: Signer[];
  /** Minimum combined weight required to authorise a transaction */
  threshold: number;
}

// ---------------------------------------------------------------------------
// Smart Wallet
// ---------------------------------------------------------------------------

export interface SmartWalletConfig {
  network: NetworkConfig;
  signerConfig: SignerConfig;
  /** Soroban contract ID of the deployed smart-wallet contract */
  contractId?: string;
}

export interface SmartWalletDeployResult {
  contractId: string;
  transactionHash: string;
}

// ---------------------------------------------------------------------------
// Session Keys
// ---------------------------------------------------------------------------

export interface SessionKeyConfig {
  /** The temporary address to grant session access */
  address: string;
  /** Ledger sequence at which the key expires */
  expiresAtLedger: number;
  /** Maximum fee (in stroops) the session key may authorise */
  maxFeeStoops: bigint;
}

// ---------------------------------------------------------------------------
// Social Recovery
// ---------------------------------------------------------------------------

export interface RecoveryConfig {
  guardians: string[];
  /** Number of guardians required to approve a recovery — must be ≤ guardians.length */
  threshold: number;
}

export interface RecoveryProposal {
  proposalId: string;
  newOwner: string;
  approvals: string[];
  requiredApprovals: number;
  createdAtLedger: number;
}

// ---------------------------------------------------------------------------
// Transaction
// ---------------------------------------------------------------------------

export type SignedTransaction = Transaction;

export interface ExecutionResult {
  success: boolean;
  transactionHash: string;
  ledger?: number;
  error?: string;
}
