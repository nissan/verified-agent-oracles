# Verified Agent Oracles — MagicBlock Blitz v2

> **Provably honest AI judgment as a payment condition on Solana**
>
> _Built for MagicBlock Blitz v2 (March 21–23, 2026) and the Real-Time Hackathon (April–May 2026)_

---

## 🎮 Try the Demo

**Live on Vercel:** [frontend-iota-eight-30.vercel.app](https://frontend-iota-eight-30.vercel.app)

The demo runs in **stub mode** (no API costs) by default, generating realistic transaction signatures and returning mock scores. 

### Modes

- **Stub mode** (default) — No API calls; returns convincing mock responses with real SHA-256 hashes of your stories. See the `demo mode` badge in results.
- **Live mode** — Set environment variable `OGMA_URL=http://localhost:8001` to call a real Ogma scoring instance (requires local Ogma FastAPI server running).

### What You'll See

1. Submit a story to Anansi
2. Ogma scores it inside a TEE (stub: random 7–9, live: real score)
3. Score committed to Solana devnet + payment released
4. View on Solana devnet explorer

---

## Problem

AI agents make high-stakes decisions: content moderation, compliance scoring, cultural assessment. But how do you prove they computed honestly rather than picking a random number or being bribed?

**Verified Agent Oracles** solves this by combining:

1. **TEE (Trusted Execution Environment)** — Intel TDX hardware seals Ogma's scoring
2. **Attestation** — Hardware-signed proof that the computation ran unmodified
3. **On-chain payment** — Smart contract gate: release SOL only if proof is valid

---

## Solution

```
┌─────────────────────────────────────────────────────────────┐
│ ANANSI (Story Writer)                                       │
│ 1. Write story                                              │
│ 2. Deposit SOL escrow (threshold: score ≥ 7)               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ MAGICBLOCK PER (Private Ephemeral Rollup)                  │
│ • OgmaScore account delegated from Solana L1               │
│ • Validator runs inside Intel TDX enclave                  │
│ • Even host OS cannot read enclave memory                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ OGMA (AI Scorer)                                            │
│ 1. Read Anansi's story                                     │
│ 2. Score cultural richness (1–10) inside TEE              │
│ 3. TEE signs score with Intel TDX hardware key             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ SOLANA L1 (State Commitment)                                │
│ • OgmaScore PDA updated with: value, attested: true        │
│ • Attestation proof committed alongside state              │
│ • AgentCredit escrow sees: score ≥ 7 AND attested          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PAYMENT RELEASE                                             │
│ if (score.attested && score.value >= threshold)            │
│   → transfer SOL from escrow to Ogma                        │
│ else                                                        │
│   → refund SOL to Anansi                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| **On-chain program** | Rust + Anchor 0.32.1 | Escrow + score gating |
| **PER SDK** | Ephemeral Rollups SDK ≥ 0.8.0 | TEE delegation + commit |
| **Client** | TypeScript + @solana/web3.js | TX builder + RPC calls |
| **AI Scorer** | Python/FastAPI | Cultural quality scoring |
| **TEE** | MagicBlock PER devnet | Hardware-sealed execution |

---

## How to Run

### Prerequisites

- **Rust:** 1.70+
- **Node.js:** 24+
- **Solana CLI:** 1.18+
- **Anchor:** 0.32.1
- **Python:** 3.12+ (for Ogma)

### Thursday Prep (Before Hackathon)

1. **Get MagicBlock devnet auth token:**
   ```bash
   # Clone the rock-paper-scissor example to understand delegation flow
   git clone https://github.com/magicblock-labs/magicblock-engine-examples
   cd magicblock-engine-examples/anchor-rock-paper-scissor

   # Read the example's Anchor.toml to understand PER config
   cat Anchor.toml
   ```

2. **Test TEE endpoint access:**
   ```bash
   # Sign a message with your Solana wallet
   # Query TEE RPC for auth token
   # See RESEARCH.md for detailed auth flow
   curl https://tee.magicblock.app/health
   ```

3. **Set up workspace:**
   ```bash
   cd /Users/loki/.openclaw/workspace/projects/magicblock-blitz
   anchor init
   ```

### Friday Build (Hours 0–24)

1. **Build Anchor program:**
   ```bash
   cd programs/oracle-escrow
   anchor build
   ```

2. **Get program ID:**
   ```bash
   solana address -k target/deploy/oracle_escrow-keypair.json
   ```
   Update `declare_id!()` in `src/lib.rs` and `Anchor.toml`.

3. **Deploy to devnet:**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

4. **Initialize TypeScript client:**
   ```bash
   cd client
   npm install @solana/web3.js @coral-xyz/anchor
   ```

5. **Wire up client methods:**
   - Uncomment TODO blocks in `client/index.ts`
   - Import Program from `@coral-xyz/anchor`
   - Add ephemeral-rollups-sdk context accounts to instructions

### Saturday Build (Hours 24–40)

1. **Full flow test:**
   ```bash
   npx ts-node client/test-flow.ts
   ```

2. **Integration with Ogma (Python):**
   ```python
   # In Ogma's scoring loop after computing cultural score:
   from magicblock_client import MagicBlockClient

   client = MagicBlockClient(
       solana_rpc="https://api.devnet.solana.com",
       tee_rpc="https://tee.magicblock.app?token=...",
       program_id="..."
   )

   # After scoring story
   score = 8
   story_hash = hashlib.sha256(story.encode()).digest()
   
   # Delegate, score in TEE, undelegate, release
   await client.full_flow(
       anansi_keypair=...,
       ogma_keypair=...,
       threshold_score=7,
       amount_sol=1.0,
       score=score,
       story_hash=story_hash
   )
   ```

### Sunday (Hours 40–48)

1. **Record demo video:**
   ```bash
   # Show:
   # 1. Story submission + escrow lock
   # 2. TEE validator signature (screenshot or log)
   # 3. On-chain OgmaScore account with attested: true
   # 4. Payment released from escrow
   ffmpeg -i ... output.mp4
   ```

2. **Final commit:**
   ```bash
   git add -A
   git commit -m "feat: Verified Agent Oracles — full end-to-end flow + demo"
   ```

3. **Submit to Blitz v2:**
   - **GitHub repo:** This directory
   - **Demo video:** YouTube link or MP4 in `docs/demo.mp4`
   - **Description:** See "Problem" and "Solution" sections above

---

## File Structure

```
magicblock-blitz/
├── README.md (this file)
├── RESEARCH.md (Archie's research brief — background on PERs, TEE, RPS example)
├── STATUS.md (build status, blockers, time estimates)
├── programs/
│   └── oracle-escrow/
│       ├── Anchor.toml (PER config, program ID)
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs (Anchor program: escrow + score gating)
├── client/
│   ├── index.ts (TypeScript client: full flow)
│   ├── package.json
│   ├── tsconfig.json
│   └── test-flow.ts (end-to-end test)
└── docs/
    ├── demo.mp4 (submission video)
    └── architecture.md (technical design doc)
```

---

## Key Design Decisions

1. **Rust/Anchor for on-chain** — PER SDK is Rust-first; TypeScript SDK exists but Anchor is proven with RPS example
2. **SOL not SPL** — Simplest escrow mechanic; no token contract overhead
3. **PDA-based escrow** — Standard Anchor pattern; rent paid at initialization
4. **One-shot flow** — No multi-step appeals or re-scoring; Anansi accepts Ogma's decision as final
5. **Delegation to TEE validator** — Implicit attestation via PER protocol; no custom proof verification

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| **TEE auth undocumented** | Test with RPS example Thursday; Discord for help |
| **SDK version matrix** | Pin `ephemeral-rollups-sdk = "0.8.0"` in Cargo.toml; check migration guide |
| **State commit async** | Poll `getAccountInfo` before calling `release_payment`; 30-retry timeout |
| **No Python PER SDK** | Call TypeScript client from Ogma via HTTP bridge |

---

## Blitz v0 Winning Insights

- **Timebent (1st):** Real-time UX showcase — demonstrated ER's 10–50ms latency advantage
- **SecretArena (3rd):** TEE for hidden moves — directly analogous to our attestation use case
- **Our edge:** Attestation as a **payment primitive** (not just confidentiality) is novel; AI + TEE + on-chain payment is a new pattern

---

## References

- **MagicBlock Docs:** https://docs.magicblock.gg
- **RPS Example:** https://github.com/magicblock-labs/magicblock-engine-examples/tree/main/anchor-rock-paper-scissor
- **PER Quickstart:** https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/how-to-guide/quickstart
- **SDK GitHub:** https://github.com/magicblock-labs/ephemeral-rollups-sdk
- **Ephemeral Rollups Docs:** https://docs.magicblock.gg/pages/ephemeral-rollups-ers/how-to-guide/quickstart
- **Solana Web3.js:** https://github.com/solana-labs/solana-web3.js
- **Anchor Framework:** https://www.anchor-lang.com/

---

## Next Steps

1. **Thursday (March 20):** Test TEE auth with RPS example; update STATUS.md
2. **Friday–Sunday:** Follow hour-by-hour build plan in STATUS.md
3. **Sunday evening:** Submit to Blitz v2 registration (if confirmed) or Real-Time Hackathon

---

**Built by:** Kit (engineer) + Archie (research) + Loki (orchestration)  
**Status:** 🟡 Scaffolding complete, awaiting Friday build start.
