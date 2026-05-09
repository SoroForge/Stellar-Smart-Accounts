//! # Session Keys Contract
//!
//! Allows a smart wallet owner to issue short-lived session keys — a limited
//! authority sub-key that can act on behalf of the wallet without exposing the
//! main signing key.
//!
//! ## Use cases
//!
//! - dApp logins that don't require wallet-signing every action
//! - Automated bots with scoped permissions
//! - Game sessions with pre-approved in-game transaction budget
//!
//! ## Session key attributes
//!
//! | Attribute       | Description                                           |
//! |-----------------|-------------------------------------------------------|
//! | `key`           | The temporary public key                              |
//! | `expires_at`    | Ledger sequence after which the key is invalid        |
//! | `max_fee`       | Maximum XLM fee the session key may authorise         |
//! | `allowed_ops`   | Whitelist of operation types (e.g. payment only)      |

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec};

#[contracttype]
#[derive(Clone, Debug)]
pub struct SessionKey {
    pub key: Address,
    pub expires_at: u32,
    pub max_fee: i64,
}

#[contracttype]
pub enum DataKey {
    Session(Address),
    WalletContract,
}

#[contract]
pub struct SessionKeysContract;

#[contractimpl]
impl SessionKeysContract {
    /// Link this contract to its parent smart wallet.
    pub fn initialize(env: Env, wallet_contract: Address) {
        let _ = (env, wallet_contract);
        panic!("not implemented")
    }

    /// Issue a new session key. Only callable by the wallet owner.
    pub fn issue(env: Env, session: SessionKey) {
        let _ = (env, session);
        panic!("not implemented")
    }

    /// Revoke a session key before it expires.
    pub fn revoke(env: Env, key: Address) {
        let _ = (env, key);
        panic!("not implemented")
    }

    /// Return all active (non-expired) session keys.
    pub fn active_sessions(env: Env) -> Vec<SessionKey> {
        let _ = env;
        panic!("not implemented")
    }

    /// Return true if `key` is currently valid.
    pub fn is_valid(env: Env, key: Address) -> bool {
        let _ = (env, key);
        panic!("not implemented")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn placeholder() {
        let _env = Env::default();
    }
}
