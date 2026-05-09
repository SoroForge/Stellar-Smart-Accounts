import { describe, it, expect } from "vitest";
import * as sdkExports from "./index";

describe("SDK Exports", () => {
  it("should export SmartAccount", () => {
    expect(sdkExports.SmartAccount).toBeDefined();
  });

  it("should have proper exports", () => {
    expect(Object.keys(sdkExports).length).toBeGreaterThan(0);
  });
});
