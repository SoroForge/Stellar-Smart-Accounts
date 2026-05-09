import type {
  ExecutionResult,
  RecoveryConfig,
  RecoveryProposal,
  SessionKeyConfig,
  Signer,
  SmartWalletConfig,
  SmartWalletDeployResult,
} from "./types";

/**
 * `SmartAccount` is the primary entry point for interacting with a
 * stellar-smart-accounts wallet deployed on Soroban.
 *
 * @example
 * ```typescript
 * import { SmartAccount } from "@stellar-smart-accounts/sdk";
 *
 * const wallet = await SmartAccount.deploy({
 *   network: { network: "testnet", rpcUrl: "...", networkPassphrase: "..." },
 *   signerConfig: {
 *     signers: [{ address: "G...", weight: 1 }],
 *     threshold: 1,
 *   },
 * });
 *
 * console.log("Deployed at:", wallet.contractId);
 * ```
 */
export class SmartAccount {
  readonly contractId: string;
  readonly config: SmartWalletConfig;

  private constructor(contractId: string, config: SmartWalletConfig) {
    this.contractId = contractId;
    this.config = config;
  }

  // ---------------------------------------------------------------------------
  // Factory methods
  // ---------------------------------------------------------------------------

  /**
   * Deploy a new smart wallet contract and return an initialised `SmartAccount`
   * instance pointing to it.
   *
   * @throws {Error} If deployment fails or the RPC node is unreachable.
   */
  static async deploy(_config: SmartWalletConfig): Promise<SmartWalletDeployResult> {
    // TODO: upload WASM, deploy contract, call initialize()
    throw new Error("SmartAccount.deploy() — not yet implemented");
  }

  /**
   * Connect to an existing deployed smart wallet contract.
   */
  static connect(contractId: string, config: SmartWalletConfig): SmartAccount {
    return new SmartAccount(contractId, config);
  }

  // ---------------------------------------------------------------------------
  // Signer management
  // ---------------------------------------------------------------------------

  /**
   * Add a new signer to the wallet. Requires existing signers to meet the
   * current threshold.
   */
  async addSigner(_signer: Signer): Promise<ExecutionResult> {
    // TODO: build and submit Soroban invocation
    throw new Error("addSigner() — not yet implemented");
  }

  /**
   * Remove a signer by their Stellar address.
   */
  async removeSigner(_address: string): Promise<ExecutionResult> {
    throw new Error("removeSigner() — not yet implemented");
  }

  /**
   * Return the current list of signers.
   */
  async getSigners(): Promise<Signer[]> {
    throw new Error("getSigners() — not yet implemented");
  }

  // ---------------------------------------------------------------------------
  // Session keys
  // ---------------------------------------------------------------------------

  /**
   * Issue a session key with scoped permissions and a time limit.
   */
  async issueSessionKey(_config: SessionKeyConfig): Promise<ExecutionResult> {
    throw new Error("issueSessionKey() — not yet implemented");
  }

  /**
   * Revoke an active session key before it expires.
   */
  async revokeSessionKey(_address: string): Promise<ExecutionResult> {
    throw new Error("revokeSessionKey() — not yet implemented");
  }

  // ---------------------------------------------------------------------------
  // Social recovery
  // ---------------------------------------------------------------------------

  /**
   * Configure guardians and recovery threshold on the wallet.
   */
  async configureRecovery(_config: RecoveryConfig): Promise<ExecutionResult> {
    throw new Error("configureRecovery() — not yet implemented");
  }

  /**
   * Initiate a social recovery proposal to transfer wallet control.
   */
  async initiateRecovery(_newOwner: string): Promise<RecoveryProposal> {
    throw new Error("initiateRecovery() — not yet implemented");
  }

  /**
   * Approve a pending recovery proposal (called by a guardian).
   */
  async approveRecovery(_proposalId: string, _guardian: string): Promise<ExecutionResult> {
    throw new Error("approveRecovery() — not yet implemented");
  }
}
