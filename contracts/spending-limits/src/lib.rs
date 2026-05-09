//! # Spending Limits Contract
//!
//! Enforces per-asset, per-period outflow caps on a smart wallet.
//! Even a fully-authorised signer cannot drain the wallet beyond the
//! configured limit within a rolling time window.
//!
//! ## Limit model
//!
//! Each limit is defined by:
//! - `asset`       — the Stellar asset address being capped
//! - `amount`      — the maximum amount spendable within one `period`
//! - `period`      — rolling window length in ledgers
//!
//! ## Storage keys
//!
//! | Key                  | Type          | Description                        |
//! |----------------------|---------------|------------------------------------|
//! | `Limit(asset)`       | `SpendLimit`  | Configured cap for an asset        |
//! | `Spent(asset)`       | `SpendRecord` | Running total for current window   |
//! | `WalletContract`     | `Address`     | Parent smart-wallet contract       |

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[contracttype]
#[derive(Clone, Debug)]
pub struct SpendLimit {
    pub asset: Address,
    pub amount: i128,
    pub period_ledgers: u32,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct SpendRecord {
    pub spent: i128,
    pub window_start: u32,
}

#[contracttype]
pub enum DataKey {
    Limit(Address),
    Spent(Address),
    WalletContract,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

#[contract]
pub struct SpendingLimitsContract;

#[contractimpl]
impl SpendingLimitsContract {
    /// Link to the parent smart-wallet contract.
    pub fn initialize(env: Env, wallet_contract: Address) {
        let _ = (env, wallet_contract);
        panic!("not implemented")
    }

    /// Set or update a spending cap for an asset.
    pub fn set_limit(env: Env, limit: SpendLimit) {
        let _ = (env, limit);
        panic!("not implemented")
    }

    /// Remove the spending cap for an asset.
    pub fn remove_limit(env: Env, asset: Address) {
        let _ = (env, asset);
        panic!("not implemented")
    }

    /// Called by the wallet before each payment to check and record spend.
    ///
    /// Reverts if the payment would exceed the cap for the current window.
    pub fn check_and_record(env: Env, asset: Address, amount: i128) {
        let _ = (env, asset, amount);
        panic!("not implemented")
    }

    /// Return the current spend record for an asset.
    pub fn spend_record(env: Env, asset: Address) -> SpendRecord {
        let _ = (env, asset);
        panic!("not implemented")
    }

    /// Return the configured limit for an asset (if any).
    pub fn get_limit(env: Env, asset: Address) -> Option<SpendLimit> {
        let _ = (env, asset);
        panic!("not implemented")
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn placeholder() {
        let _env = Env::default();
    }
}
