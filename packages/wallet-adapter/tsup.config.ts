import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "adapters/freighter": "src/adapters/freighter.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["@stellar/stellar-sdk", "@stellar-smart-accounts/sdk"],
});
