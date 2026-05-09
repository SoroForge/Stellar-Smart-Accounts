# Contributing to stellar-smart-accounts

Thank you for your interest in contributing! This guide will help you get
set up and explain how we collaborate.

---

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Getting started](#getting-started)
- [Development workflow](#development-workflow)
- [Commit conventions](#commit-conventions)
- [Pull requests](#pull-requests)
- [Testing](#testing)
- [Releasing](#releasing)

---

## Code of conduct

All contributors are expected to follow our [Code of Conduct](./CODE_OF_CONDUCT.md).
Be kind and respectful.

---

## Getting started

### Prerequisites

- **Node.js ≥ 18** and **pnpm ≥ 8** for TypeScript packages
- **Rust stable** and the `wasm32-unknown-unknown` target for Soroban contracts
- **stellar-cli** — install with `cargo install --locked stellar-cli --features opt`

### Fork and clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_FORK/stellar-smart-accounts.git
cd stellar-smart-accounts
git remote add upstream https://github.com/YOUR_USERNAME/stellar-smart-accounts.git
```

### Install and build

```bash
pnpm install
pnpm build
rustup target add wasm32-unknown-unknown
```

---

## Development workflow

1. Sync your fork with upstream before starting work:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Create a feature branch named after the type of work:
   ```
   feat/session-key-revocation
   fix/threshold-underflow
   docs/spending-limits-interface
   ```

3. Make your changes, keeping commits small and focused.

4. Run all checks before pushing:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm test:contracts   # if you touched Rust
   ```

5. Open a pull request against `main`.

---

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org). The format is:

```
<type>(<scope>): <short description>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
`chore`, `revert`, `contract`

**Scopes**: `sdk`, `wallet-adapter`, `contracts`, `smart-wallet`, `session-keys`,
`spending-limits`, `docs`, `examples`, `ci`, `deps`

**Examples**:
```
feat(sdk): add SmartAccount.deploy() factory method
fix(smart-wallet): prevent threshold underflow on signer removal
contract(session-keys): implement is_valid() expiry check
docs(sdk): document session key usage examples
```

A commit hook (`commitlint`) will reject commits that don't follow this format.

---

## Pull requests

- All PRs must target the `main` branch.
- Fill in the PR template completely — especially the testing section.
- Every user-facing change needs a changeset (`pnpm changeset`).
- Keep PRs focused: one logical change per PR. Large PRs are harder to review.
- Expect a review within 3–5 business days.

---

## Testing

### TypeScript

```bash
pnpm test               # run all tests
pnpm test:coverage      # with coverage report
```

We use [Vitest](https://vitest.dev/). Tests live alongside source files as
`*.test.ts`.

### Soroban contracts

```bash
cd contracts
cargo test
```

Contract tests use `soroban-sdk`'s built-in test utilities and run entirely
in a simulated Soroban environment — no network connection required.

### Integration (testnet)

Integration tests that require a live node are in `tests/integration/` and
are skipped in CI unless `STELLAR_NETWORK=testnet` is set. You can run them
locally after setting up a testnet account:

```bash
STELLAR_NETWORK=testnet STELLAR_SECRET=S... pnpm test:integration
```

---

## Releasing

Releases are managed by [Changesets](https://github.com/changesets/changesets).
Only maintainers publish releases. If you are a maintainer:

```bash
# Bump versions and update changelogs
pnpm version

# Publish to npm (via CI on merge to main)
pnpm release
```

---

Questions? Open a [Discussion](https://github.com/YOUR_USERNAME/stellar-smart-accounts/discussions).
