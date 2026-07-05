import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  xdr,
  rpc,
  type Transaction,
} from "@stellar/stellar-sdk";

import type {
  ExecutionResult,
  RecoveryConfig,
  RecoveryProposal,
  SessionKeyConfig,
  Signer,
  SmartWalletConfig,
  SmartWalletDeployResult,
} from "./types.js";

/**
 * `SmartAccount` is the primary entry point for interacting with a
 * stellar-smart-accounts wallet deployed on Soroban.
 *
 * @example
 * ```typescript
 * import { SmartAccount } from "@stellar-smart-accounts/sdk";
 *
 * const result = await SmartAccount.deploy({
 *   network: { network: "testnet", rpcUrl: "...", networkPassphrase: "..." },
 *   signerConfig: {
 *     signers: [{ address: "G...", weight: 1 }],
 *     threshold: 1,
 *   },
 *   deployerSecret: "S...",
 * });
 *
 * console.log("Deployed at:", result.contractId);
 * ```
 */
export class SmartAccount {
  readonly contractId: string;
  readonly config: SmartWalletConfig;
  private readonly sessionKeysContractId: string | undefined;

  private constructor(contractId: string, config: SmartWalletConfig) {
    this.contractId = contractId;
    this.config = config;
    this.sessionKeysContractId = config.sessionKeysContractId ?? undefined;
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
  static async deploy(config: SmartWalletConfig): Promise<SmartWalletDeployResult> {
    if (config.signerConfig.signers.length < 1) {
      throw new Error("SmartAccount.deploy(): at least one signer is required");
    }
    if (config.signerConfig.threshold < 1) {
      throw new Error("SmartAccount.deploy(): threshold must be >= 1");
    }
    if (!config.deployerSecret) {
      throw new Error("SmartAccount.deploy(): config.deployerSecret is required");
    }

    const server = new rpc.Server(config.network.rpcUrl);
    const keypair = Keypair.fromSecret(config.deployerSecret);
    const passphrase = config.network.networkPassphrase;

    // 1. Upload the compiled smart-wallet WASM.
    const wasm = readWasm("smart_wallet.wasm");
    const uploadOp = Operation.uploadContractWasm({ wasm });
    const uploadResult = await SmartAccount._buildAndSubmit(server, keypair, uploadOp, passphrase);
    const wasmHash = extractBytes(uploadResult.resultValue);
    if (!wasmHash || wasmHash.length !== 32) {
      throw new Error(
        `SmartAccount.deploy(): unexpected WASM hash length ${String(wasmHash?.length ?? 0)}`,
      );
    }

    // 2. Deploy the contract instance from the uploaded WASM.
    const deployerAddress = Address.fromString(keypair.publicKey());
    const createOp = Operation.createCustomContract({
      address: deployerAddress,
      wasmHash,
    });
    const createResult = await SmartAccount._buildAndSubmit(server, keypair, createOp, passphrase);
    const contractId = extractContractId(createResult.resultValue);
    if (!contractId) {
      throw new Error("SmartAccount.deploy(): failed to read contract id from deployment result");
    }

    // 3. Call `initialize` with the first signer as owner and the configured threshold.
    const owner = config.signerConfig.signers[0];
    const initOp = new Contract(contractId).call(
      "initialize",
      nativeToScVal(owner.address, { type: "address" }),
      nativeToScVal(config.signerConfig.threshold, { type: "u32" }),
    );
    const initResult = await SmartAccount._buildAndSubmit(server, keypair, initOp, passphrase);

    return { contractId, transactionHash: initResult.transactionHash };
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
  async addSigner(signer: Signer): Promise<ExecutionResult> {
    const op = new Contract(this.contractId).call(
      "add_signer",
      nativeToScVal(
        { address: signer.address, weight: signer.weight },
        { type: { address: ["symbol", "address"], weight: ["symbol", "u32"] } },
      ),
    );
    return this._invoke(op);
  }

  /**
   * Remove a signer by their Stellar address.
   */
  async removeSigner(address: string): Promise<ExecutionResult> {
    const op = new Contract(this.contractId).call(
      "remove_signer",
      nativeToScVal(address, { type: "address" }),
    );
    return this._invoke(op);
  }

  /**
   * Return the current list of signers.
   */
  async getSigners(): Promise<Signer[]> {
    const server = new rpc.Server(this.config.network.rpcUrl);
    const source = this._readOnlySource();
    const op = new Contract(this.contractId).call("signers");
    const account = await server.getAccount(source.publicKey());
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.config.network.networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(`simulateTransaction failed: ${sim.error}`);
    }
    const result = sim.result?.retval;
    if (!result) {
      return [];
    }

    const native = scValToNative(result);
    if (!Array.isArray(native)) {
      return [];
    }
    return native.map((entry) => toSigner(entry)).filter((s): s is Signer => s !== null);
  }

  // ---------------------------------------------------------------------------
  // Session keys
  // ---------------------------------------------------------------------------

  /**
   * Issue a session key with scoped permissions and a time limit.
   */
  async issueSessionKey(config: SessionKeyConfig): Promise<ExecutionResult> {
    if (config.expiresAtLedger <= 0) {
      throw new Error("issueSessionKey(): expiresAtLedger must be > 0");
    }
    if (config.maxFeeStoops <= 0n) {
      throw new Error("issueSessionKey(): maxFeeStoops must be > 0");
    }
    const target = this.sessionKeysContractId ?? this.config.sessionKeysContractId;
    if (!target) {
      throw new Error("issueSessionKey(): sessionKeysContractId is not configured");
    }
    const op = new Contract(target).call(
      "issue",
      nativeToScVal(
        {
          key: config.address,
          expires_at: config.expiresAtLedger,
          max_fee: config.maxFeeStoops,
        },
        {
          type: {
            key: ["symbol", "address"],
            expires_at: ["symbol", "u32"],
            max_fee: ["symbol", "i128"],
          },
        },
      ),
    );
    return this._invoke(op);
  }

  /**
   * Revoke an active session key before it expires.
   */
  async revokeSessionKey(address: string): Promise<ExecutionResult> {
    const target = this.sessionKeysContractId ?? this.config.sessionKeysContractId;
    if (!target) {
      throw new Error("revokeSessionKey(): sessionKeysContractId is not configured");
    }
    const op = new Contract(target).call("revoke", nativeToScVal(address, { type: "address" }));
    return this._invoke(op);
  }

  // ---------------------------------------------------------------------------
  // Social recovery
  // ---------------------------------------------------------------------------

  /**
   * Configure guardians and recovery threshold on the wallet.
   */
  async configureRecovery(config: RecoveryConfig): Promise<ExecutionResult> {
    let last: ExecutionResult = { success: true, transactionHash: "" };
    for (const guardian of config.guardians) {
      const op = new Contract(this.contractId).call(
        "add_guardian",
        nativeToScVal(guardian, { type: "address" }),
      );
      last = await this._invoke(op);
      if (!last.success) {
        return last;
      }
    }
    const thresholdOp = new Contract(this.contractId).call(
      "set_recovery_threshold",
      nativeToScVal(config.threshold, { type: "u32" }),
    );
    return this._invoke(thresholdOp);
  }

  /**
   * Initiate a social recovery proposal to transfer wallet control.
   */
  async initiateRecovery(newOwner: string): Promise<RecoveryProposal> {
    const op = new Contract(this.contractId).call(
      "initiate_recovery",
      nativeToScVal(newOwner, { type: "address" }),
    );
    const result = await this._invoke(op);
    return {
      proposalId: result.transactionHash,
      newOwner,
      approvals: [],
      requiredApprovals: 0,
      createdAtLedger: result.ledger ?? 0,
    };
  }

  /**
   * Approve a pending recovery proposal (called by a guardian).
   *
   * `proposalId` is unused at the contract level in v0.1 (single pending
   * proposal model) but accepted for API symmetry with future versions.
   */
  async approveRecovery(proposalId: string, guardian: string): Promise<ExecutionResult> {
    void proposalId;
    const op = new Contract(this.contractId).call(
      "approve_recovery",
      nativeToScVal(guardian, { type: "address" }),
    );
    return this._invoke(op);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Build, simulate, sign, and submit a Soroban transaction.
   *
   * - Loads the source account, builds the transaction (BASE_FEE, 30s timeout)
   * - Calls `server.prepareTransaction(tx)` which simulates and attaches the
   *   transaction footprint
   * - Signs with `sourceKeypair` and submits
   * - Polls `server.getTransaction(hash)` until a final status is reached
   *
   * @throws if the transaction ends in a `FAILED` status or polling is exhausted.
   */
  private static async _buildAndSubmit(
    server: rpc.Server,
    sourceKeypair: Keypair,
    operation: xdr.Operation,
    networkPassphrase: string,
  ): Promise<{ transactionHash: string; ledger: number; resultValue?: xdr.ScVal | undefined }> {
    const sourceAccount = await server.getAccount(sourceKeypair.publicKey());
    const tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const prepared = await server.prepareTransaction(tx);
    prepared.sign(sourceKeypair);

    const sendResult = await server.sendTransaction(prepared);

    if (sendResult.status === "PENDING") {
      const hash = sendResult.hash;
      let attempts = 0;
      const maxAttempts = 30;
      while (attempts < maxAttempts) {
        await sleep(1000);
        const polled = await server.getTransaction(hash);
        if (polled.status === rpc.Api.GetTransactionStatus.SUCCESS) {
          const success = polled;
          const returnValue: xdr.ScVal | undefined = success.returnValue;
          return { transactionHash: hash, ledger: success.ledger, resultValue: returnValue };
        }
        if (polled.status === rpc.Api.GetTransactionStatus.FAILED) {
          throw new Error(`Transaction ${hash} failed: ${describeFailure(polled)}`);
        }
        attempts += 1;
      }
      throw new Error(
        `Transaction ${hash} did not reach a final status after ${String(maxAttempts)} attempts`,
      );
    }

    if (sendResult.status === "ERROR") {
      const errorResult = sendResult as rpc.Api.SendTransactionResponse & {
        errorResultXdr?: string;
      };
      throw new Error(
        `Transaction submission error: ${errorResult.errorResultXdr ?? "unknown error"}`,
      );
    }

    throw new Error(`Transaction submission returned unexpected status: ${sendResult.status}`);
  }

  /**
   * Resolve a signing keypair from the configured `signerSecret`, throwing a
   * clear error when none is available.
   */
  private _signerKeypair(): Keypair {
    if (!this.config.signerSecret) {
      throw new Error(
        "A signer secret is required to sign this transaction. Set config.signerSecret.",
      );
    }
    return Keypair.fromSecret(this.config.signerSecret);
  }

  /**
   * Read-only simulations use a deterministic source account that does not
   * need to be funded. Falls back to the network master key.
   */
  private _readOnlySource(): Keypair {
    if (this.config.signerSecret) {
      return Keypair.fromSecret(this.config.signerSecret);
    }
    return Keypair.master(this.config.network.networkPassphrase);
  }

  /**
   * Build, sign (with the configured signer), and submit an invocation against
   * the wallet contract, returning an `ExecutionResult`.
   */
  private async _invoke(operation: xdr.Operation): Promise<ExecutionResult> {
    try {
      const server = new rpc.Server(this.config.network.rpcUrl);
      const keypair = this._signerKeypair();
      const result = await SmartAccount._buildAndSubmit(
        server,
        keypair,
        operation,
        this.config.network.networkPassphrase,
      );
      return {
        success: true,
        transactionHash: result.transactionHash,
        ledger: result.ledger,
      };
    } catch (err) {
      return {
        success: false,
        transactionHash: "",
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Module-level helpers (kept out of the class to keep the public surface clean)
// ---------------------------------------------------------------------------

const NETWORK_PASSPHRASES: Record<string, string> = {
  mainnet: Networks.PUBLIC,
  testnet: Networks.TESTNET,
  futurenet: Networks.FUTURENET,
  standalone: Networks.STANDALONE,
};

/**
 * Resolve the canonical passphrase for a named network. Mirrors the SDK's
 * accepted `StellarNetwork` values so callers can pass either a literal
 * passphrase or a network name.
 */
export function resolveNetworkPassphrase(network: string): string {
  return NETWORK_PASSPHRASES[network] ?? network;
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Read a compiled WASM blob from disk.
 *
 * Searches a small set of candidate locations (relative to the package root
 * and the current working directory) so the SDK works whether it is invoked
 * from the repo root or from a dependent project.
 */
function readWasm(fileName: string): Buffer {
  const candidates: string[] = [];
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    candidates.push(resolve(here, "..", "..", "..", "deployments", "wasm", fileName));
    candidates.push(resolve(here, "..", "..", "deployments", "wasm", fileName));
  } catch {
    // import.meta.url unavailable (CJS build) — fall through to cwd-based paths.
  }
  candidates.push(resolve(process.cwd(), "deployments", "wasm", fileName));
  candidates.push(resolve(process.cwd(), "deployments", "wasm", fileName));

  for (const candidate of candidates) {
    try {
      return readFileSync(candidate);
    } catch {
      // try next candidate
    }
  }
  throw new Error(
    `Could not read WASM file "${fileName}". Expected at deployments/wasm/${fileName}.`,
  );
}

/**
 * Extract a 32-byte buffer (WASM hash) from a host-function return ScVal.
 * Handles `scvBytes` and object-wrapped `Hash` representations.
 */
function extractBytes(scv: xdr.ScVal | undefined): Buffer | undefined {
  if (!scv) return undefined;
  try {
    if (scv.switch() === xdr.ScValType.scvBytes()) {
      const v = scv.value();
      return Buffer.isBuffer(v) ? v : Buffer.from(v as unknown as Uint8Array);
    }
  } catch {
    // fall through to native conversion
  }
  const native = scValToNative(scv);
  if (Buffer.isBuffer(native)) return native;
  if (native instanceof Uint8Array) return Buffer.from(native);
  return undefined;
}

/**
 * Extract a contract id (C...) string from a host-function return ScVal.
 */
function extractContractId(scv: xdr.ScVal | undefined): string | undefined {
  if (!scv) return undefined;
  const native = scValToNative(scv);
  if (typeof native === "string" && native.startsWith("C")) return native;
  return undefined;
}

/**
 * Convert a deserialised signer map entry into the SDK `Signer` shape.
 */
function toSigner(entry: unknown): Signer | null {
  if (!entry || typeof entry !== "object") return null;
  const obj = entry as Record<string, unknown>;
  const address = obj.address;
  const weight = obj.weight;
  if (typeof address !== "string" || typeof weight !== "number") return null;
  return { address, weight };
}

/**
 * Best-effort human-readable description of a failed transaction response.
 */
function describeFailure(polled: rpc.Api.GetFailedTransactionResponse): string {
  const failed = polled as rpc.Api.GetFailedTransactionResponse & {
    resultXdr?: xdr.TransactionResult;
    diagnosticEventsXdr?: xdr.DiagnosticEvent[];
  };
  const parts: string[] = [];
  parts.push(`resultXdr=${String(failed.resultXdr)}`);
  if (failed.diagnosticEventsXdr && failed.diagnosticEventsXdr.length > 0) {
    parts.push(`events=${failed.diagnosticEventsXdr.map((e) => String(e)).join("; ")}`);
  }
  return parts.join(" | ") || "no diagnostic data";
}

/**
 * Re-exported so consumers can construct `Transaction` typed values when
 * extending the adapter. Mirrors the original barrel intent.
 */
export type { Transaction };
