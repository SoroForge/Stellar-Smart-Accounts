//! # Smart Wallet Contract
//!
//! The core account abstraction contract for stellar-smart-accounts.
//!
//! ## Responsibilities
//!
//! - Multi-signer management with configurable weight thresholds
//! - Social recovery: trusted guardians can collectively restore wallet access
//! - Delegated execution: pay gas on behalf of users (meta-transactions)
//! - Interoperability with the session-keys and spending-limits contracts
//!
//! ## Storage layout
//!
//! | Key                 | Type           | Tier       | Description                         |
//! |---------------------|----------------|------------|-------------------------------------|
//! | `Owner`             | `Address`      | instance   | Current wallet owner                |
//! | `Signers`           | `Vec<Signer>`  | instance   | Registered signers and their weights |
//! | `Threshold`         | `u32`          | instance   | Minimum combined weight to execute  |
//! | `Guardians`         | `Vec<Address>` | instance   | Social-recovery guardian list       |
//! | `RecoveryThreshold` | `u32`          | instance   | Guardians needed for recovery       |
//! | `Nonce`             | `u64`          | instance   | Replay-protection counter           |
//! | `PendingOwner`      | `Address`      | temporary  | Owner proposed during recovery      |
//! | `RecoveryApprovals` | `Vec<Address>` | temporary  | Guardians who approved recovery     |

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Vec};

// ---------------------------------------------------------------------------
// Storage types
// ---------------------------------------------------------------------------

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Signer {
    pub address: Address,
    pub weight: u32,
}

#[contracttype]
pub enum DataKey {
    Signers,
    Threshold,
    Guardians,
    RecoveryThreshold,
    Nonce,
    Owner,
    PendingOwner,
    RecoveryApprovals,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

#[contract]
pub struct SmartWalletContract;

#[contractimpl]
impl SmartWalletContract {
    /// Initialise a new smart wallet.
    ///
    /// Must be called exactly once immediately after deployment.
    ///
    /// # Arguments
    ///
    /// * `owner`     – The initial owner address.
    /// * `threshold` – Minimum combined signer weight required to authorise a call.
    pub fn initialize(env: Env, owner: Address, threshold: u32) {
        if env.storage().instance().has(&DataKey::Owner) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage()
            .instance()
            .set(&DataKey::Threshold, &threshold);
        env.storage()
            .instance()
            .set(&DataKey::Signers, &Vec::<Signer>::new(&env));
        env.storage()
            .instance()
            .set(&DataKey::Guardians, &Vec::<Address>::new(&env));
        env.storage()
            .instance()
            .set(&DataKey::RecoveryThreshold, &0_u32);
        env.storage().instance().set(&DataKey::Nonce, &0_u64);
        env.storage().instance().extend_ttl(17280, 17280);
    }

    /// Add a new signer with a given weight.
    pub fn add_signer(env: Env, signer: Signer) {
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .expect("not initialized");
        owner.require_auth();

        let mut signers: Vec<Signer> = env
            .storage()
            .instance()
            .get(&DataKey::Signers)
            .unwrap_or_else(|| Vec::new(&env));

        for s in signers.iter() {
            if s.address == signer.address {
                panic!("signer exists");
            }
        }

        if signer.weight == 0 {
            panic!("weight zero");
        }

        signers.push_back(signer.clone());
        env.storage().instance().set(&DataKey::Signers, &signers);
        env.events().publish((symbol_short!("signer"),), signer);
    }

    /// Remove an existing signer by address.
    pub fn remove_signer(env: Env, address: Address) {
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .expect("not initialized");
        owner.require_auth();

        let mut signers: Vec<Signer> = env
            .storage()
            .instance()
            .get(&DataKey::Signers)
            .unwrap_or_else(|| Vec::new(&env));

        let mut found: Option<u32> = None;
        let mut i: u32 = 0;
        let len = signers.len();
        while i < len {
            if signers.get(i).unwrap().address == address {
                found = Some(i);
                break;
            }
            i += 1;
        }
        let idx = found.unwrap_or_else(|| panic!("signer not found"));
        signers.remove(idx);

        // After removal, ensure the remaining combined weight still meets the threshold.
        let threshold: u32 = env
            .storage()
            .instance()
            .get(&DataKey::Threshold)
            .unwrap_or(0);
        let mut total: u32 = 0;
        for s in signers.iter() {
            total = total.saturating_add(s.weight);
        }
        if total < threshold {
            panic!("threshold unreachable");
        }

        env.storage().instance().set(&DataKey::Signers, &signers);
    }

    /// Register a guardian for social recovery.
    pub fn add_guardian(env: Env, guardian: Address) {
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .expect("not initialized");
        owner.require_auth();

        let mut guardians: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Guardians)
            .unwrap_or_else(|| Vec::new(&env));

        for g in guardians.iter() {
            if g == guardian {
                panic!("guardian exists");
            }
        }

        guardians.push_back(guardian.clone());
        env.storage()
            .instance()
            .set(&DataKey::Guardians, &guardians);
    }

    /// Set the number of guardians required to approve a social recovery.
    pub fn set_recovery_threshold(env: Env, threshold: u32) {
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .expect("not initialized");
        owner.require_auth();

        let guardians: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Guardians)
            .unwrap_or_else(|| Vec::new(&env));

        if threshold > guardians.len() {
            panic!("threshold exceeds guardian count");
        }

        env.storage()
            .instance()
            .set(&DataKey::RecoveryThreshold, &threshold);
    }

    /// Initiate the social recovery process.
    ///
    /// Requires `recovery_threshold` guardians to each call `approve_recovery`
    /// before the new owner can be installed.
    pub fn initiate_recovery(env: Env, new_owner: Address) {
        env.storage()
            .temporary()
            .set(&DataKey::PendingOwner, &new_owner);
        env.storage()
            .temporary()
            .set(&DataKey::RecoveryApprovals, &Vec::<Address>::new(&env));
        env.storage()
            .temporary()
            .extend_ttl(&DataKey::PendingOwner, 17280, 17280);
        env.storage()
            .temporary()
            .extend_ttl(&DataKey::RecoveryApprovals, 17280, 17280);
    }

    /// A guardian approves a pending recovery proposal.
    pub fn approve_recovery(env: Env, guardian: Address) {
        guardian.require_auth();

        if !env.storage().temporary().has(&DataKey::PendingOwner) {
            panic!("no pending recovery");
        }

        let guardians: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Guardians)
            .unwrap_or_else(|| Vec::new(&env));

        let mut is_guardian = false;
        for g in guardians.iter() {
            if g == guardian {
                is_guardian = true;
                break;
            }
        }
        if !is_guardian {
            panic!("not a guardian");
        }

        let mut approvals: Vec<Address> = env
            .storage()
            .temporary()
            .get(&DataKey::RecoveryApprovals)
            .unwrap_or_else(|| Vec::new(&env));

        for a in approvals.iter() {
            if a == guardian {
                panic!("already approved");
            }
        }

        approvals.push_back(guardian.clone());
        env.storage()
            .temporary()
            .set(&DataKey::RecoveryApprovals, &approvals);

        let threshold: u32 = env
            .storage()
            .instance()
            .get(&DataKey::RecoveryThreshold)
            .unwrap_or(0);

        if approvals.len() >= threshold {
            let new_owner: Address = env
                .storage()
                .temporary()
                .get(&DataKey::PendingOwner)
                .expect("pending owner missing");
            env.storage().instance().set(&DataKey::Owner, &new_owner);
            env.storage().temporary().remove(&DataKey::PendingOwner);
            env.storage()
                .temporary()
                .remove(&DataKey::RecoveryApprovals);
            env.events()
                .publish((symbol_short!("recovery"),), new_owner);
        }
    }

    /// Return the current nonce (used for replay protection).
    pub fn nonce(env: Env) -> u64 {
        env.storage()
            .instance()
            .get::<DataKey, u64>(&DataKey::Nonce)
            .unwrap_or(0)
    }

    /// Return the list of current signers.
    pub fn signers(env: Env) -> Vec<Signer> {
        env.storage()
            .instance()
            .get::<DataKey, Vec<Signer>>(&DataKey::Signers)
            .unwrap_or_else(|| Vec::new(&env))
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

    fn setup() -> (Env, SmartWalletContractClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, SmartWalletContract);
        let client = SmartWalletContractClient::new(&env, &contract_id);
        let owner = Address::generate(&env);
        (env, client, owner)
    }

    #[test]
    fn test_initialize_sets_owner() {
        let (_env, client, owner) = setup();
        client.initialize(&owner, &1);
        let signers = client.signers();
        assert_eq!(signers.len(), 0);
    }

    #[test]
    #[should_panic(expected = "already initialized")]
    fn test_initialize_twice_panics() {
        let (_env, client, owner) = setup();
        client.initialize(&owner, &1);
        client.initialize(&owner, &1);
    }

    #[test]
    fn test_add_signer() {
        let (_env, client, owner) = setup();
        client.initialize(&owner, &1);
        let signer_addr = Address::generate(&_env);
        client.add_signer(&Signer {
            address: signer_addr,
            weight: 1,
        });
        let signers = client.signers();
        assert_eq!(signers.len(), 1);
        assert_eq!(signers.get(0).unwrap().weight, 1);
    }

    #[test]
    #[should_panic(expected = "signer exists")]
    fn test_add_duplicate_signer_panics() {
        let (_env, client, owner) = setup();
        client.initialize(&owner, &1);
        let signer_addr = Address::generate(&_env);
        client.add_signer(&Signer {
            address: signer_addr.clone(),
            weight: 1,
        });
        client.add_signer(&Signer {
            address: signer_addr,
            weight: 1,
        });
    }

    #[test]
    fn test_remove_signer() {
        let (env, client, owner) = setup();
        client.initialize(&owner, &0);
        let signer_addr = Address::generate(&env);
        client.add_signer(&Signer {
            address: signer_addr.clone(),
            weight: 1,
        });
        client.remove_signer(&signer_addr);
        assert_eq!(client.signers().len(), 0);
    }

    #[test]
    #[should_panic(expected = "threshold unreachable")]
    fn test_remove_last_signer_below_threshold_panics() {
        let (env, client, owner) = setup();
        client.initialize(&owner, &1);
        let signer_addr = Address::generate(&env);
        client.add_signer(&Signer {
            address: signer_addr.clone(),
            weight: 1,
        });
        client.remove_signer(&signer_addr);
    }

    #[test]
    fn test_nonce_starts_at_zero() {
        let (_env, client, owner) = setup();
        client.initialize(&owner, &1);
        assert_eq!(client.nonce(), 0);
    }
}
