import { describe, it, expect } from "vitest";
import * as adapterExports from "./index";

describe("Wallet Adapter Exports", () => {
  it("should export BaseAdapter", () => {
    expect(adapterExports.BaseAdapter).toBeDefined();
  });

  it("should have proper exports", () => {
    expect(Object.keys(adapterExports).length).toBeGreaterThan(0);
  });
});
