import { describe, it, expect, vi, beforeEach } from "vitest";

import type { SmartWalletConfig } from "../types.js";

vi.mock("@stellar/stellar-sdk", () => {
  const mockServer = {
    getAccount: vi.fn().mockResolvedValue({
      accountId: () => "GAAA...",
      sequenceNumber: () => "0",
      incrementSequenceNumber: () => undefined,
    }),
    prepareTransaction: vi.fn().mockResolvedValue({ sign: () => undefined }),
    sendTransaction: vi.fn().mockResolvedValue({
      status: "PENDING",
      hash: "deadbeef",
    }),
    getTransaction: vi.fn().mockResolvedValue({
      status: "SUCCESS",
      ledger: 42,
      returnValue: undefined,
    }),
    simulateTransaction: vi.fn().mockResolvedValue({
      result: { retval: { switch: () => ({ name: () => "scvVoid" }) } },
    }),
  };
  const mockKeypair = {
    publicKey: () => "GAAA...",
    secret: () => "S...",
  };
  const moduleExports = {
    Address: { fromString: () => ({ toScVal: () => ({}) }) },
    BASE_FEE: "100",
    Contract: vi.fn().mockImplementation(() => ({
      call: () => ({}),
    })),
    Keypair: {
      fromSecret: () => mockKeypair,
      master: () => mockKeypair,
    },
    Networks: { PUBLIC: "P", TESTNET: "T", FUTURENET: "F", STANDALONE: "S" },
    Operation: { uploadContractWasm: () => ({}), createCustomContract: () => ({}) },
    TransactionBuilder: vi.fn().mockImplementation(() => ({
      addOperation: () => ({ setTimeout: () => ({ build: () => ({}) }) }),
      setTimeout: () => ({ build: () => ({}) }),
      build: () => ({}),
    })),
    nativeToScVal: vi.fn((v: unknown) => v),
    scValToNative: vi.fn(() => []),
    xdr: { ScValType: { scvBytes: () => ({}) } },
    rpc: {
      Server: vi.fn(() => mockServer),
      Api: {
        GetTransactionStatus: { SUCCESS: "SUCCESS", FAILED: "FAILED", NOT_FOUND: "NOT_FOUND" },
        isSimulationError: () => false,
        isSimulationSuccess: () => true,
      },
    },
  };
  return moduleExports;
});

import { SmartAccount } from "../SmartAccount.js";

const baseConfig: SmartWalletConfig = {
  network: {
    network: "testnet",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
  },
  signerConfig: {
    signers: [{ address: "GABC0000000000000000000000000000000000000000000000000AAA", weight: 1 }],
    threshold: 1,
  },
};

describe("SmartAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("connect returns SmartAccount with contractId", () => {
    const wallet = SmartAccount.connect("CABC...", baseConfig);
    expect(wallet).toBeInstanceOf(SmartAccount);
    expect(wallet.contractId).toBe("CABC...");
  });

  it("deploy throws if signers array is empty", async () => {
    const config = {
      ...baseConfig,
      signerConfig: { signers: [], threshold: 1 },
      deployerSecret: "S...",
    };
    await expect(SmartAccount.deploy(config)).rejects.toThrow(/at least one signer/);
  });

  it("deploy throws if threshold is zero", async () => {
    const config = {
      ...baseConfig,
      signerConfig: {
        signers: [{ address: "GABC", weight: 1 }],
        threshold: 0,
      },
      deployerSecret: "S...",
    };
    await expect(SmartAccount.deploy(config)).rejects.toThrow(/threshold must be >= 1/);
  });

  it("addSigner throws if SDK internals throw", async () => {
    const wallet = SmartAccount.connect("CABC...", baseConfig);
    const result = await wallet.addSigner({ address: "GNEW", weight: 1 });
    expect(result.success).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(result.error).toBeTruthy();
  });

  it("getSigners returns empty array from mocked simulate response", async () => {
    const wallet = SmartAccount.connect("CABC...", baseConfig);
    const signers = await wallet.getSigners();
    expect(Array.isArray(signers)).toBe(true);
    expect(signers.length).toBe(0);
  });
});
