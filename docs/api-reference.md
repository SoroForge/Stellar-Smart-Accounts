# API Reference

> Auto-generated API docs will be added here via `typedoc` once the SDK stabilises. For now, refer
> to the inline JSDoc in each source file.

## `@stellar-smart-accounts/sdk`

### `SmartAccount`

| Method                                 | Description                   | Status     |
| -------------------------------------- | ----------------------------- | ---------- |
| `SmartAccount.deploy(config)`          | Deploy a new smart wallet     | 🚧 Planned |
| `SmartAccount.connect(id, config)`     | Connect to an existing wallet | 🚧 Planned |
| `wallet.addSigner(signer)`             | Add a new signer              | 🚧 Planned |
| `wallet.removeSigner(address)`         | Remove a signer               | 🚧 Planned |
| `wallet.getSigners()`                  | List current signers          | 🚧 Planned |
| `wallet.issueSessionKey(config)`       | Issue a scoped session key    | 🚧 Planned |
| `wallet.revokeSessionKey(address)`     | Revoke a session key          | 🚧 Planned |
| `wallet.configureRecovery(config)`     | Set up social recovery        | 🚧 Planned |
| `wallet.initiateRecovery(newOwner)`    | Start a recovery proposal     | 🚧 Planned |
| `wallet.approveRecovery(id, guardian)` | Guardian approves recovery    | 🚧 Planned |

## `@stellar-smart-accounts/wallet-adapter`

### `FreighterAdapter`

| Method                         | Description                     | Status     |
| ------------------------------ | ------------------------------- | ---------- |
| `adapter.isInstalled()`        | Check if Freighter is installed | 🚧 Planned |
| `adapter.connect()`            | Connect and get public key      | 🚧 Planned |
| `adapter.signTransaction(xdr)` | Sign a transaction XDR          | 🚧 Planned |
| `adapter.disconnect()`         | Clear session                   | 🚧 Planned |
