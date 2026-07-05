import { describe, it, expect, vi } from "vitest";

vi.mock("@stellar/freighter-api", () => ({
  isConnected: vi.fn().mockResolvedValue({ isConnected: true }),
  getPublicKey: vi.fn().mockResolvedValue({ publicKey: "GTEST" }),
  getNetwork: vi.fn().mockResolvedValue({
    network: "testnet",
    networkPassphrase: "Test SDF Network ; September 2015",
  }),
  signTransaction: vi.fn().mockResolvedValue({ signedTxXdr: "AAAAsigned" }),
}));

import * as adapterExports from "./index.js";

describe("Wallet Adapter Exports", () => {
  it("should export BaseAdapter", () => {
    expect(adapterExports.BaseAdapter).toBeDefined();
  });

  it("should export FreighterAdapter", () => {
    expect(adapterExports.FreighterAdapter).toBeDefined();
  });

  it("should have proper exports", () => {
    expect(Object.keys(adapterExports).length).toBeGreaterThan(0);
  });
});
