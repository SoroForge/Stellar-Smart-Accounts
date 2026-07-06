# CI/CD Fixes Summary

## Issues Found and Fixed

### 1. **pnpm Version Mismatch** ❌ → ✅

**Problem:** Workflow action specified `pnpm@8` while `package.json` declared `pnpm@8.15.9`

- Error: "Multiple versions of pnpm specified"
- Impact: Immediate failure on all Node.js-dependent jobs (lint, typecheck, test, build)

**Solution:** Updated all workflow job definitions to use exact version `8.15.9`

- Files Modified: `.github/workflows/ci.yml` (4 jobs), `.github/workflows/release.yml` (1 job)
- Jobs Updated:
  - ✅ Lint & Format
  - ✅ Typecheck
  - ✅ Test (Node 22)
  - ✅ Build
  - ✅ Release/Publish

### 2. **stellar-cli Compilation Failure** ❌ → ✅

**Problem:** `cargo install --locked stellar-cli --features opt` was failing

- Error: "the package 'stellar-cli' does not contain this feature: opt"
- Impact: Test Soroban Contracts job failed after ~4 seconds

**Solution:** Removed problematic `--features opt` flag

```bash
# Before
cargo install --locked stellar-cli --features opt

# After
cargo install --locked stellar-cli
```

- Location: `.github/workflows/ci.yml` line 92
- The base tool is sufficient without optional features for CI environment

### 3. **License Updated** (Apache → MIT) ✅

**Changes:**

- Created `LICENSE` file with MIT license text
- Updated `README.md` to reference MIT instead of Apache 2.0
- Added `"license": "MIT"` to all `package.json` files:
  - Root `package.json`
  - `packages/sdk/package.json`
  - `packages/wallet-adapter/package.json`
- Updated `contracts/Cargo.toml` workspace config with `license = "MIT"`

### 4. **Node.js Version Consistency** ✅

**Status:** Already correct - all workflows configured for Node.js 22

- `.nvmrc` specifies `22`
- `package.json` engines: `"node": ">=22.0.0"`
- Workflow configurations:
  - Lint & Format: Node 22
  - Typecheck: Node 22
  - Test: Matrix with Node 22
  - Build: Node 22
  - Release: Node 22

### 5. **pnpm-lock.yaml** ✅

**Status:** Lock file exists and committed

- Size: 174KB
- Enables reproducible `--frozen-lockfile` installs in CI
- Graceful fallback: If missing, workflow performs normal install

## Verification

All changes verified:

```bash
✓ pnpm version: 8.15.9 (5/5 occurrences across workflows)
✓ Node.js: 22 (confirmed in matrix and hardcoded values)
✓ stellar-cli: --features opt removed
✓ License: MIT applied to all package metadata
✓ Lock file: pnpm-lock.yaml (174KB)
```

## Affected Workflows

### `.github/workflows/ci.yml`

- **4 jobs fixed:** lint, typecheck, test, build
- Updated pnpm version in all jobs
- Removed stellar-cli feature flag

### `.github/workflows/release.yml`

- **1 job fixed:** release/publish
- Updated pnpm version

### 6. **Typecheck Module Resolution** ❌ → ✅

**Problem:** Typecheck job failed with "Cannot find module @stellar-smart-accounts/sdk"

- Error: App and wallet-adapter couldn't resolve SDK module during typecheck
- Impact: Typecheck job failed, causing Build and Build Demo App jobs to be skipped
- Root Cause: Packages weren't built before typecheck, so `.d.ts` files didn't exist

**Solution:** Added build step before typecheck in CI workflow

```yaml
- name: Build packages (required for typecheck)
  run: pnpm build

- run: pnpm typecheck
```

- Location: `.github/workflows/ci.yml` line 52-53
- Ensures all packages are compiled with type definitions before typecheck runs
- Verified locally: `pnpm build && pnpm typecheck` both pass ✅

### 7. **Vercel Deployment Configuration** ❌ → ✅

**Problem:** Vercel deployment failed with "ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND"

- Error: Vercel couldn't find package.json in the expected location
- Impact: Demo app deployments failing
- Root Cause: Monorepo configuration wasn't properly set in root

**Solution:** Created root `vercel.json` with proper monorepo configuration

```json
{
  "buildCommand": "pnpm build --filter @stellar-smart-accounts/app",
  "outputDirectory": "app/dist",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "vite",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ./app ./packages"
}
```

- File: `vercel.json` (root)
- Properly scopes build to app package with dependencies
- Verified locally: `pnpm build --filter @stellar-smart-accounts/app` passes ✅

## Expected CI Status

All workflows should now pass:

- ✅ **Lint & Format** - Runs prettier/eslint checks
- ✅ **Typecheck** - TypeScript compilation check with build step
- ✅ **Test** - Unit tests with Node.js 22
- ✅ **Test Soroban Contracts** - Rust contract tests
- ✅ **Build** - Turbo build pipeline (runs after typecheck)
- ✅ **Build Demo App** - Vite build for demo app (runs after typecheck)
- ✅ **Release** - npm package publishing

## Commit History

### Initial Fixes (Commit: 0662756)

**Message:** `fix(ci): resolve all CI/CD workflow failures`

Changes:

- `.github/workflows/ci.yml` - 18 lines modified
- `.github/workflows/release.yml` - 4 lines modified
- LICENSE file created (MIT)
- pnpm-lock.yaml generated and committed

### Typecheck & Vercel Fix (Commit: f035591)

**Message:** `fix(ci): add build step before typecheck`

Changes:

- `.github/workflows/ci.yml` - Added build step before typecheck
- `vercel.json` - Created root configuration for monorepo deployment
- Verified locally: build and typecheck both pass

---

**Status:** ✅ **CI Ready** - All workflows configured correctly for passing builds **Deployment:**
✅ **Vercel Ready** - Monorepo configuration properly set

## Deployed Contracts (Testnet)

All contracts successfully deployed to Stellar testnet on July 6, 2026:

- **Smart Wallet:** `CBUEUWCNWF3Q5KCDA46SCBREGZUY5DVIF25T52D6MRYPKWWHJLLSWDP4`
- **Session Keys:** `CBMJ52UOFODPM2THFP7E4ZO73LTPROEXRUPJO7LCSB6UTVIP7AO4JGT3`
- **Spending Limits:** `CDVQB6HYHLBZRRA5SKO2M55HBVZ2PLEFCLDP6662WFK7QSKW6RJMVDA5`

Deployer: `GC6C5LTM55PL46YKOQR7M6PKECQ6TJ66D6ZSLAUC6MYRM5DAYPVJ26CN`
