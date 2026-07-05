# API Reference

> Auto-generated API docs will be added here via `typedoc` once the SDK stabilises. For now, refer
> to the inline JSDoc in each source file.

## `@stellar-smart-accounts/sdk`

### `SmartAccount`

| Method                                 | Description                   | Status       |
| -------------------------------------- | ----------------------------- | ------------ |
| `SmartAccount.deploy(config)`          | Deploy a new smart wallet     | ✅ Available |
| `SmartAccount.connect(id, config)`     | Connect to an existing wallet | ✅ Available |
| `wallet.addSigner(signer)`             | Add a new signer              | ✅ Available |
| `wallet.removeSigner(address)`         | Remove a signer               | ✅ Available |
| `wallet.getSigners()`                  | List current signers          | ✅ Available |
| `wallet.issueSessionKey(config)`       | Issue a scoped session key    | ✅ Available |
| `wallet.revokeSessionKey(address)`     | Revoke a session key          | ✅ Available |
| `wallet.configureRecovery(config)`     | Set up social recovery        | ✅ Available |
| `wallet.initiateRecovery(newOwner)`    | Start a recovery proposal     | ✅ Available |
| `wallet.approveRecovery(id, guardian)` | Guardian approves recovery    | ✅ Available |

## `@stellar-smart-accounts/wallet-adapter`

### `FreighterAdapter`

| Method                         | Description                     | Status       |
| ------------------------------ | ------------------------------- | ------------ |
| `adapter.isInstalled()`        | Check if Freighter is installed | ✅ Available |
| `adapter.connect()`            | Connect and get public key      | ✅ Available |
| `adapter.signTransaction(xdr)` | Sign a transaction XDR          | ✅ Available |
| `adapter.disconnect()`         | Clear session                   | ✅ Available |
