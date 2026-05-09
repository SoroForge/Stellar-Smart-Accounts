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

## Expected CI Status

All workflows should now pass:
- ✅ **Lint & Format** - Runs prettier/eslint checks
- ✅ **Typecheck** - TypeScript compilation check
- ✅ **Test** - Unit tests with Node.js 22
- ✅ **Test Soroban Contracts** - Rust contract tests
- ✅ **Build** - Turbo build pipeline
- ✅ **Release** - npm package publishing

## Commit Details

**Commit Hash:** 0662756
**Message:** `fix(ci): resolve all CI/CD workflow failures`

Changes:
- `.github/workflows/ci.yml` - 18 lines modified
- `.github/workflows/release.yml` - 4 lines modified
- LICENSE file created (MIT)
- pnpm-lock.yaml generated and committed

---

**Status:** ✅ **CI Ready** - All workflows configured correctly for passing builds
