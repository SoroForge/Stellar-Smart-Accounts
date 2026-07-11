import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@stellar/freighter-api", () => ({
  getPublicKey: vi.fn().mockResolvedValue({ publicKey: "GTESTPUBLICKEY" }),
  getNetwork: vi.fn().mockResolvedValue({
    network: "Test SDF Network ; September 2015",
    networkPassphrase: "Test SDF Network ; September 2015",
  }),
  signTransaction: vi.fn().mockResolvedValue({ signedTxXdr: "AAAAsignedXDRbase64==" }),
}));

import { FreighterAdapter } from "../adapters/freighter.js";

describe("FreighterAdapter", () => {
  let adapter: FreighterAdapter;

  beforeEach(() => {
    adapter = new FreighterAdapter();
    vi.clearAllMocks();
    // Mock globalThis.freighter (not window.freighter)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).freighter = true;
  });

  afterEach(() => {
    // Cleanup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).freighter;
  });

  it("isInstalled returns true when Freighter is available", async () => {
    const result = await adapter.isInstalled();
    expect(result).toBe(true);
  });

  it("isInstalled returns false when freighter is not available", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).freighter;
    const result = await adapter.isInstalled();
    expect(result).toBe(false);
  });

  it("connect returns publicKey and network", async () => {
    const result = await adapter.connect();
    expect(result.publicKey).toBe("GTESTPUBLICKEY");
    expect(result.network).toBe("Test SDF Network ; September 2015");
  });

  it("signTransaction returns the signed XDR", async () => {
    const signed = await adapter.signTransaction("rawxdr", {
      networkPassphrase: "Test SDF Network ; September 2015",
    });
    expect(typeof signed).toBe("string");
    expect(signed.length).toBeGreaterThan(0);
    expect(signed).toBe("AAAAsignedXDRbase64==");
  });

  it("signTransaction throws on empty result", async () => {
    const { signTransaction } = await import("@stellar/freighter-api");
    (signTransaction as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ signedTxXdr: "" });
    await expect(adapter.signTransaction("rawxdr")).rejects.toThrow(/empty signed transaction/);
  });

  it("disconnect clears cached public key", async () => {
    await adapter.connect();
    const infoBefore = await adapter.getInfo();
    expect(infoBefore.connected).toBe(true);
    await adapter.disconnect();
    const infoAfter = await adapter.getInfo();
    expect(infoAfter.connected).toBe(false);
  });
});
