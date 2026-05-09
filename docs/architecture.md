# Architecture

> **Status:** Work in progress — updated as the project evolves.

## Overview

`stellar-smart-accounts` is structured as a pnpm monorepo with two layers:

- **On-chain layer** (`/contracts`) — Soroban smart contracts written in Rust
- **Off-chain layer** (`/packages`) — TypeScript SDK and wallet adapters

## Contract interaction diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     @stellar-smart-accounts/sdk                   │
│               (TypeScript — builds & submits transactions)        │
└──────────────────────────────┬───────────────────────────────────┘
                               │ Soroban RPC
                               ▼
              ┌────────────────────────────────┐
              │       smart-wallet contract     │
              │  • Signer registry & threshold  │
              │  • Social recovery              │
              │  • Cross-contract delegation    │
              └──────────┬──────────┬──────────┘
                         │          │
              ┌──────────┘          └──────────┐
              ▼                                ▼
   ┌────────────────────┐          ┌──────────────────────┐
   │  session-keys       │          │   spending-limits     │
   │  contract           │          │   contract            │
   └────────────────────┘          └──────────────────────┘
```

## Key design decisions

<!-- Document significant technical decisions here as they are made -->

| Decision | Rationale |
|---|---|
| _TBD_ | _TBD_ |

## Adding a new contract

1. Create `contracts/<name>/` with `Cargo.toml` and `src/lib.rs`
2. Add it to `contracts/Cargo.toml` `[workspace] members`
3. Expose its interface in `packages/sdk/src/`
4. Add tests under `contracts/<name>/src/lib.rs` `#[cfg(test)]`
