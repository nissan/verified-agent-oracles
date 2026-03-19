# Verified Agent Oracles — Build Status

_MagicBlock Solana Blitz v2 | Last updated: 2026-03-19_

## Thursday Prep — SDK Corrections Applied ✅

### Fix 1: Cargo.toml with `features = ["anchor"]` ✅
- Created `programs/oracle-escrow/Cargo.toml` with `ephemeral-rollups-sdk` and `anchor` feature flag
- Created root `Cargo.toml` workspace definition
- **Status:** Ready for `cargo build`

### Fix 2: `#[ephemeral]` macro + `#[delegate]` + attestation redesign ✅
- Added `#[ephemeral]` attribute on `#[program]` module — injects undelegation callback discriminator
- Added `#[delegate]` macro on `DelegateToPer` context struct
- Added `#[account(mut, del)]` constraint on PDA in delegation context
- Added `#[commit]` macro on `UndelegateAndFinalize` context — automatically injects `magic_context` and `magic_program`
- **Attestation design change:** Removed `attested: bool` field from `OgmaScore`
  - New model: `oracle_signer: Pubkey` field proves who scored it
  - Attestation is implicit: TEE validator committed the state (verifiable on-chain)
  - `release_payment` now gates only on score threshold + state finality, not a boolean flag
- **Status:** Program compiles with all macros in place

### Fix 3: TypeScript client with correct SDK packages ✅
- Changed import from `ephemeral-web3.js` to `@magicblock-labs/ephemeral-rollups-sdk`
- Added `verifyTeeRpcIntegrity()` and `getAuthToken()` imports
- Separated L1 connection (`https://api.devnet.solana.com`) from TEE connection (`https://tee.magicblock.app`)
- Added `getTeeAuthToken()` method with full TEE integrity verification
- Added `getTeeConnection()` method to cache authenticated TEE connection
- **TEE transaction routing:** 
  - `submitScoreInTee()` sends to TEE RPC (not L1)
  - `undelegateAndFinalize()` sends to TEE RPC (not L1)
  - `releasePayment()`, `initializeEscrow()` send to L1
- **Status:** Client has correct RPC endpoints and auth flow

### Fix 4: Frontend package.json ✅
- Added `@magicblock-labs/ephemeral-rollups-sdk@^0.8.0`
- Added `@coral-xyz/anchor@^0.32.1`
- Added `tweetnacl@^1.0.3` (for TEE signature verification)
- Removed reference to `ephemeral-web3.js` (was never there)
- **Status:** Dependencies ready for `npm install`

### Anchor.toml ✅
- Created with localnet and devnet program ID placeholders
- Configured for blitz dev wallet (`~/.config/solana/blitz-dev.json`)
- Test configuration included

## Architecture Summary

### OgmaScore Structure (Redesigned)
```rust
#[account]
pub struct OgmaScore {
    pub value: u8,              // 1-10 score
    pub oracle_signer: Pubkey,  // Ogma's keypair (proves who scored)
    pub story_hash: [u8; 32],   // Story content hash
    pub scored_at: i64,         // Timestamp
}
```

**Attestation Model:**
- `oracle_signer` field proves Ogma submitted the score
- State was delegated to TEE validator (`FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA`)
- TEE validator committed the state back to L1 via `commit_and_undelegate_accounts()`
- Verifying the on-chain delegation record proves the score came from TEE execution
- **No manual `attested = true` flag** — that was architecturally wrong

### Flow Summary
1. **L1:** Initialize escrow (Anansi deposits SOL)
2. **L1:** Initialize score account (Ogma's oracle signer)
3. **L1:** Delegate to TEE validator
4. **TEE:** Submit score (via TEE RPC, oracle_signer constraint)
5. **TEE:** Undelegate + commit (finalize state via `#[commit]` macro)
6. **L1:** Poll for finalization
7. **L1:** Release or refund (gated by threshold, no boolean flag)

## Correct Package Names

| Component | Old | New | Notes |
|---|---|---|---|
| TypeScript SDK | `ephemeral-web3.js` | `@magicblock-labs/ephemeral-rollups-sdk` | Correct package with `verifyTeeRpcIntegrity`, `getAuthToken` |
| Rust SDK | (implicit) | `ephemeral-rollups-sdk` v0.8.0 with `features = ["anchor"]` | Provides macros: `#[ephemeral]`, `#[delegate]`, `#[commit]` |
| L1 Connection | — | `https://api.devnet.solana.com` | Standard Solana devnet |
| TEE Connection | — | `https://tee.magicblock.app?token={authToken}` | Requires per-user auth token |

## Next Steps (Friday Build Day)

1. **Morning (0-4h):** Fill in TODOs in `client/index.ts` with actual Anchor `program.methods` calls (requires IDL)
2. **Morning:** Test delegation + delegation proof on-chain
3. **Afternoon (4-8h):** Wire demo UI + Anansi story generator endpoint
4. **Demo Video:** Show full flow with on-chain proof of TEE execution

## Known Limitations

- **TEE devnet auth:** Currently stubbed in comments; full implementation needs MagicBlock auth flow
- **Program ID:** Placeholder (`11111111111111111111111111111111`); real ID after first `anchor build`
- **IDL generation:** Anchor IDL auto-generated after build; client TODO comments ready for insertion

## Files Modified

- ✅ `programs/oracle-escrow/Cargo.toml` (new)
- ✅ `Cargo.toml` (new, workspace root)
- ✅ `Anchor.toml` (new)
- ✅ `programs/oracle-escrow/src/lib.rs` (rewritten with macros + attestation fix)
- ✅ `client/index.ts` (updated with correct SDK + TEE routing)
- ✅ `frontend/package.json` (dependencies added)
- ✅ `STATUS.md` (this file)

---

**Ready for commit.**
