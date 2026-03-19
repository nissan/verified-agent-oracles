# Verified Agent Oracles — STATUS
_Last updated: 2026-03-19 19:00 AEST_

## RESUME FROM HERE
Thursday: Fund devnet wallet (browser faucets) + Kit runs RPS example + tests MagicBlock SDK

## Decisions Locked (2026-03-19)
1. **New standalone repo** — `reddinft/verified-agent-oracles` (isolated from celo-agent-demo)
2. **Ogma output includes story_hash** — SHA-256 of story text, returned alongside score as proof
3. **Frontend** — standalone Next.js app at `/frontend`, demo page at `/blitz` route

## Concept
Verified Agent Oracles — Ogma scores Anansi's story inside a TEE PER.
Score + story_hash + `attested: true` committed to Solana L1.
Payment (SOL escrow) releases only if `score ≥ threshold AND attested = true`.

Key innovation: the story_hash *binds* the score to this exact story text.
You cannot swap stories after scoring. Tamper-proof by construction.

## Stack
- Ogma scoring: `ogma-service/scorer.py` (FastAPI, returns score + story_hash)
- On-chain: Anchor (Rust) + TypeScript client  
- TEE: MagicBlock PER devnet `https://devnet.magicblock.app` (confirmed live, no auth required)
- Payment: score-gated SOL escrow (Anchor PDA)
- Frontend: Next.js at `/frontend/src/app/blitz/page.tsx`
- Deployment: Fly.dev (ogma-service) + Vercel (frontend)

## Repo
- GitHub: https://github.com/reddinft/verified-agent-oracles
- Local: ~/projects/verified-agent-oracles/
- nissan added as admin collaborator ✅

## Devnet Wallet
- Address: `d4ST3N4Vkio1Xsg2NaF6Zox7Xq8MdqWihvyip9AHioR`
- Keypair: `~/.config/solana/blitz-dev.json`
- Balance: 0 SOL — needs browser faucet funding

## Faucets (manual, Nissan's job)
1. https://faucet.solana.com → 2 SOL
2. https://faucet.quicknode.com/solana/devnet → 1 SOL / 12h
3. https://www.alchemy.com/faucets/solana-devnet → 1 SOL / day
Target: 5-10 devnet SOL before Friday

## MagicBlock Devnet Status (confirmed 2026-03-19)
- Endpoint: https://devnet.magicblock.app
- Health: ok ✅
- magicblock-core: 0.8.3
- No auth required — standard JSON-RPC

## Build Plan
### Thursday (today)
- [x] Repo created + scaffold committed
- [x] MagicBlock devnet confirmed live
- [ ] Fund devnet wallet (Nissan — browser faucets)
- [ ] Kit: clone + run RPS example end-to-end
- [ ] Kit: wire Venice AI into ogma-service/scorer.py (copy from celo-agent-demo)

### Friday (hackathon day 1)
- [ ] Anchor build: OgmaScore PDA + TEE delegation (4h)
- [ ] Anchor: score-gated escrow — deposit + conditional release (4h)
- [ ] Wire story_hash from scorer into on-chain account

### Saturday (hackathon day 2)
- [ ] TypeScript client: full pipeline (Anansi → Ogma → attest → release)
- [ ] Frontend API routes: /api/blitz/score, /api/blitz/attest, /api/blitz/release
- [ ] Deploy: ogma-service to fly.dev, frontend to Vercel
- [ ] Demo video (2-3 min)

## Blockers
- Devnet SOL needed (manual faucet — Nissan)
- Venice AI key for ogma-service — copy from celo-agent-demo env

## Key References
- Lessons from: github.com/reddinft/celo-agent-demo (TEE pattern, Venice AI integration, agent payment flow)
- RPS template: https://github.com/magicblock-labs/magicblock-engine-examples/tree/main/anchor-rock-paper-scissor
- Archie research: workspace/projects/magicblock-blitz/RESEARCH.md
- Kit brief: workspace/projects/magicblock-blitz/KIT-BRIEF.md
