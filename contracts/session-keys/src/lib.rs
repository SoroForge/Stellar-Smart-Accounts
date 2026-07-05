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
//!
//! ## Storage layout
//!
//! | Key               | Type         | Tier       | Description                          |
//! |-------------------|--------------|------------|--------------------------------------|
//! | `WalletContract`  | `Address`    | instance   | Parent smart-wallet contract         |
//! | `Session(key)`    | `SessionKey` | temporary  | Issued session key (auto-expires)   |

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
        if env.storage().instance().has(&DataKey::WalletContract) {
            panic!("already initialized");
        }
        env.storage()
            .instance()
            .set(&DataKey::WalletContract, &wallet_contract);
        env.storage().instance().extend_ttl(17280, 17280);
    }

    /// Issue a new session key. Only callable by the wallet owner.
    pub fn issue(env: Env, session: SessionKey) {
        let wallet_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::WalletContract)
            .expect("not initialized");
        wallet_contract.require_auth();

        if env
            .storage()
            .temporary()
            .has(&DataKey::Session(session.key.clone()))
        {
            panic!("already issued");
        }

        if session.expires_at <= env.ledger().sequence() {
            panic!("expires in past");
        }

        let ttl = session.expires_at - env.ledger().sequence();
        env.storage()
            .temporary()
            .set(&DataKey::Session(session.key.clone()), &session);
        env.storage()
            .temporary()
            .extend_ttl(&DataKey::Session(session.key), ttl, ttl);
    }

    /// Revoke a session key before it expires.
    pub fn revoke(env: Env, key: Address) {
        let wallet_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::WalletContract)
            .expect("not initialized");
        wallet_contract.require_auth();

        // No-op if the key is not present.
        env.storage().temporary().remove(&DataKey::Session(key));
    }

    /// Return all active (non-expired) session keys.
    ///
    /// Enumeration of temporary storage is not supported in soroban-sdk v21.
    /// Track sessions client-side.
    pub fn active_sessions(env: Env) -> Vec<SessionKey> {
        Vec::new(&env)
    }

    /// Return true if `key` is currently valid.
    ///
    /// Temporary storage auto-removes expired entries, so presence implies validity.
    pub fn is_valid(env: Env, key: Address) -> bool {
        env.storage().temporary().has(&DataKey::Session(key))
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    fn setup() -> (Env, SessionKeysContractClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, SessionKeysContract);
        let client = SessionKeysContractClient::new(&env, &contract_id);
        let wallet = Address::generate(&env);
        (env, client, wallet)
    }

    fn future_ledger(env: &Env, delta: u32) -> u32 {
        env.ledger().sequence() + delta
    }

    #[test]
    fn test_initialize() {
        let (env, client, wallet) = setup();
        client.initialize(&wallet);
        let key = Address::generate(&env);
        assert_eq!(client.is_valid(&key), false);
    }

    #[test]
    fn test_issue_and_is_valid() {
        let (env, client, wallet) = setup();
        client.initialize(&wallet);
        let key = Address::generate(&env);
        client.issue(&SessionKey {
            key: key.clone(),
            expires_at: future_ledger(&env, 100),
            max_fee: 1000,
        });
        assert_eq!(client.is_valid(&key), true);
    }

    #[test]
    #[should_panic(expected = "expires in past")]
    fn test_expires_in_past_panics() {
        let (env, client, wallet) = setup();
        client.initialize(&wallet);
        let key = Address::generate(&env);
        client.issue(&SessionKey {
            key,
            expires_at: env.ledger().sequence(),
            max_fee: 1000,
        });
    }

    #[test]
    fn test_revoke() {
        let (env, client, wallet) = setup();
        client.initialize(&wallet);
        let key = Address::generate(&env);
        client.issue(&SessionKey {
            key: key.clone(),
            expires_at: future_ledger(&env, 100),
            max_fee: 1000,
        });
        assert_eq!(client.is_valid(&key), true);
        client.revoke(&key);
        assert_eq!(client.is_valid(&key), false);
    }
}
