/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
        "contract",
      ],
    ],
    "scope-enum": [
      1,
      "always",
      [
        "sdk",
        "wallet-adapter",
        "contracts",
        "smart-wallet",
        "session-keys",
        "spending-limits",
        "docs",
        "examples",
        "ci",
        "deps",
        "release",
      ],
    ],
  },
};
