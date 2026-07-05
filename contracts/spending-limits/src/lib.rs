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
//! - `period_ledgers` — rolling window length in ledgers
//!
//! ## Storage layout
//!
//! | Key                  | Type          | Tier        | Description                        |
//! |----------------------|---------------|-------------|------------------------------------|
//! | `WalletContract`     | `Address`     | instance    | Parent smart-wallet contract       |
//! | `Limit(asset)`       | `SpendLimit`  | persistent  | Configured cap for an asset        |
//! | `Spent(asset)`       | `SpendRecord` | persistent  | Running total for current window   |

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct SpendLimit {
    pub asset: Address,
    pub amount: i128,
    pub period_ledgers: u32,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
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
        if env.storage().instance().has(&DataKey::WalletContract) {
            panic!("already initialized");
        }
        env.storage()
            .instance()
            .set(&DataKey::WalletContract, &wallet_contract);
        env.storage().instance().extend_ttl(17280, 17280);
    }

    /// Set or update a spending cap for an asset.
    pub fn set_limit(env: Env, limit: SpendLimit) {
        let wallet_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::WalletContract)
            .expect("not initialized");
        wallet_contract.require_auth();

        if limit.amount <= 0 {
            panic!("amount zero");
        }
        if limit.period_ledgers == 0 {
            panic!("period zero");
        }

        env.storage()
            .persistent()
            .set(&DataKey::Limit(limit.asset.clone()), &limit);
    }

    /// Remove the spending cap for an asset.
    pub fn remove_limit(env: Env, asset: Address) {
        let wallet_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::WalletContract)
            .expect("not initialized");
        wallet_contract.require_auth();

        env.storage().persistent().remove(&DataKey::Limit(asset));
    }

    /// Called by the wallet before each payment to check and record spend.
    ///
    /// Reverts if the payment would exceed the cap for the current window.
    /// The check rejects before any state mutation occurs.
    pub fn check_and_record(env: Env, asset: Address, amount: i128) {
        let wallet_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::WalletContract)
            .expect("not initialized");
        wallet_contract.require_auth();

        let limit: SpendLimit = match env
            .storage()
            .persistent()
            .get(&DataKey::Limit(asset.clone()))
        {
            Some(l) => l,
            None => return,
        };

        let mut record: SpendRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Spent(asset.clone()))
            .unwrap_or(SpendRecord {
                spent: 0,
                window_start: env.ledger().sequence(),
            });

        if env.ledger().sequence() > record.window_start + limit.period_ledgers {
            record = SpendRecord {
                spent: 0,
                window_start: env.ledger().sequence(),
            };
        }

        // Reject before mutating state.
        if record.spent + amount > limit.amount {
            panic!("spend limit exceeded");
        }

        record.spent += amount;
        env.storage()
            .persistent()
            .set(&DataKey::Spent(asset), &record);
    }

    /// Return the current spend record for an asset.
    pub fn spend_record(env: Env, asset: Address) -> SpendRecord {
        env.storage()
            .persistent()
            .get(&DataKey::Spent(asset))
            .unwrap_or(SpendRecord {
                spent: 0,
                window_start: env.ledger().sequence(),
            })
    }

    /// Return the configured limit for an asset (if any).
    pub fn get_limit(env: Env, asset: Address) -> Option<SpendLimit> {
        env.storage().persistent().get(&DataKey::Limit(asset))
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::testutils::Ledger as _;
    use soroban_sdk::Env;

    fn setup() -> (Env, SpendingLimitsContractClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, SpendingLimitsContract);
        let client = SpendingLimitsContractClient::new(&env, &contract_id);
        let wallet = Address::generate(&env);
        (env, client, wallet)
    }

    #[test]
    fn test_initialize() {
        let (env, client, wallet) = setup();
        client.initialize(&wallet);
        let asset = Address::generate(&env);
        assert_eq!(client.get_limit(&asset), None);
    }

    #[test]
    fn test_set_and_get_limit() {
        let (env, client, wallet) = setup();
        client.initialize(&wallet);
        let asset = Address::generate(&env);
        client.set_limit(&SpendLimit {
            asset: asset.clone(),
            amount: 1000,
            period_ledgers: 100,
        });
        let limit = client.get_limit(&asset).expect("limit should exist");
        assert_eq!(limit.amount, 1000);
        assert_eq!(limit.period_ledgers, 100);
    }

    #[test]
    fn test_check_and_record_within_limit() {
        let (env, client, wallet) = setup();
        client.initialize(&wallet);
        let asset = Address::generate(&env);
        client.set_limit(&SpendLimit {
            asset: asset.clone(),
            amount: 1000,
            period_ledgers: 100,
        });
        client.check_and_record(&asset, &500);
        assert_eq!(client.spend_record(&asset).spent, 500);
    }

    #[test]
    #[should_panic(expected = "spend limit exceeded")]
    fn test_check_and_record_exceeds_limit_panics() {
        let (env, client, wallet) = setup();
        client.initialize(&wallet);
        let asset = Address::generate(&env);
        client.set_limit(&SpendLimit {
            asset: asset.clone(),
            amount: 1000,
            period_ledgers: 100,
        });
        client.check_and_record(&asset, &500);
        client.check_and_record(&asset, &600);
    }

    #[test]
    fn test_window_reset() {
        let (env, client, wallet) = setup();
        client.initialize(&wallet);
        let asset = Address::generate(&env);
        client.set_limit(&SpendLimit {
            asset: asset.clone(),
            amount: 1000,
            period_ledgers: 10,
        });
        client.check_and_record(&asset, &500);
        assert_eq!(client.spend_record(&asset).spent, 500);

        // Advance past the rolling window.
        let reset_seq = env.ledger().sequence() + 10 + 1;
        env.ledger().set_sequence_number(reset_seq);

        client.check_and_record(&asset, &300);
        let record = client.spend_record(&asset);
        assert_eq!(record.spent, 300);
        assert_eq!(record.window_start, reset_seq);
    }
}
