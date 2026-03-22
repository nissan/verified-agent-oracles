"use client";

import { useState } from "react";

interface Slide {
  id: number;
  title: string;
  bullets: string[];
  callout: string;
  note?: string;
}

const slides: Slide[] = [
  {
    "id": 1,
    "title": "OgmaScore: TEE-Attested AI Judgment as a Payment Primitive",
    "bullets": [
      "Built on MagicBlock Private Ephemeral Rollups \u2014 Solana devnet",
      "Hardware-attested AI scoring that unlocks on-chain payments atomically",
      "From hackathon primitive to the trust layer for the agent economy"
    ],
    "callout": "What if an AI's judgment could be trusted the same way a hardware signature is trusted?",
    "note": "Open with the question, not the product. Let the room sit with it for two seconds."
  },
  {
    "id": 2,
    "title": "The Problem: AI Agents Can't Pay Each Other Trustlessly",
    "bullets": [
      "The AI agent economy is projected to exceed $47B by 2030 \u2014 but agent-to-agent payments still rely on human intermediaries or centralized oracles",
      "Every payment condition based on AI output inherits the oracle problem: who attests that the score is real, unmodified, and unexposed?",
      "Current solutions paper over the trust gap \u2014 the AI runs somewhere, produces a number, and you're asked to believe it",
      "No existing payment primitive treats AI judgment as a first-class, verifiable input to a smart contract"
    ],
    "callout": "The oracle problem didn't go away when agents got smarter. It got worse.",
    "note": "Hit the market number early \u2014 investors need scale before they'll care about the mechanism."
  },
  {
    "id": 3,
    "title": "The Insight: The Scoring IS the Attestation",
    "bullets": [
      "TEE (Trusted Execution Environment) isn't just for privacy \u2014 it's proof that computation ran exactly as specified, on isolated hardware, with no external tampering",
      "If the AI scores inside a TEE, the score carries a hardware signature. That signature becomes the payment condition.",
      "This flips the architecture: instead of 'trust the oracle,' you verify the attestation on-chain and release funds atomically",
      "OgmaScore is the first system to treat TEE-attested AI judgment as a payment primitive \u2014 not a privacy feature"
    ],
    "callout": "Privacy was the first use case for TEE. Trustless commerce is the second.",
    "note": "Slow down on 'payment condition' \u2014 this is the conceptual shift the whole project hinges on."
  },
  {
    "id": 4,
    "title": "How It Works: Three Steps, One Atomic Loop",
    "bullets": [
      "Step 1 \u2014 Anansi (the requester agent) deposits funds into an Anchor escrow smart contract on Solana. Payment is locked, not promised.",
      "Step 2 \u2014 Ogma (the scoring agent) receives the story inside a MagicBlock Private Ephemeral Rollup with TEE isolation. Venice AI runs inference with zero data retention. A score is produced and attested.",
      "Step 3 \u2014 The smart contract receives the attested score, validates it on-chain, and releases payment atomically. No human in the loop. No trust assumption."
    ],
    "callout": "Deposit \u2192 Score (inside TEE) \u2192 Release. Six on-chain transactions. Fully atomic.",
    "note": "If you have the diagram on screen, walk it left to right. The escrow is the key trust anchor \u2014 make sure it lands."
  },
  {
    "id": 5,
    "title": "The Tech: Real Stack, Real Transactions",
    "bullets": [
      "MagicBlock Private Ephemeral Rollups \u2014 ephemeral compute with on-chain finality; the PER is where Ogma lives and scores",
      "Anchor 0.32.1 \u2014 battle-tested Solana smart contract framework; escrow, scoring logic, and atomic release all on-chain",
      "Venice AI \u2014 privacy-first inference with zero data retention; no model provider can extract the story or the score",
      "6 confirmed on-chain transactions on Solana devnet \u2014 deposit, lock, score submission, attestation, validation, release"
    ],
    "callout": "This isn't a proof of concept on a whiteboard. Six transactions fired. Check the explorer.",
    "note": "Have the Solana Explorer link ready. Show the txn hashes if the audience is technical."
  },
  {
    "id": 6,
    "title": "Why Now: Every Major Payment Player Just Inherited the Oracle Problem",
    "bullets": [
      "Stripe launched Model-to-Model Payment Protocol (MPP) for AI agents \u2014 March 2026. Payments work. Trust in the scoring condition does not.",
      "Visa, Coinbase x402, and Mastercard BVNK all shipped AI agent payment infrastructure within the same two-week window",
      "Every one of these systems assumes the AI output triggering payment is correct. None of them verify it.",
      "OgmaScore is the attestation layer these protocols are missing \u2014 and it's already running"
    ],
    "callout": "Four of the biggest names in payments shipped agent rails in two weeks. Zero of them solved the oracle problem.",
    "note": "This slide is the market timing argument. Don't rush it \u2014 the convergence of these launches in the same window is genuinely remarkable."
  },
  {
    "id": 7,
    "title": "Why MagicBlock: TEE Is Load-Bearing Here, Not Decorative",
    "bullets": [
      "MagicBlock lists Private AI as a target vertical on their homepage \u2014 OgmaScore is exactly that use case, live",
      "Private Ephemeral Rollups give ephemeral compute with on-chain settlement finality \u2014 the right architecture for stateless AI scoring that needs permanent proof",
      "The TEE in this system isn't a privacy checkbox. It's the mechanism that makes the payment condition verifiable. Remove it, and the whole trust guarantee collapses.",
      "OgmaScore demonstrates that MagicBlock's PER infrastructure can power trustless agent commerce at the primitive level"
    ],
    "callout": "PER isn't just faster Solana. It's isolated, attested compute with on-chain proof. That's what makes OgmaScore possible.",
    "note": "For MagicBlock judges specifically: this slide shows you built FOR the platform, not ON TOP of it. The distinction matters."
  },
  {
    "id": 8,
    "title": "See It Live: ogmascore.vercel.app/blitz",
    "bullets": [
      "Paste any short story into the blitz interface \u2014 Ogma scores it inside the TEE pipeline in real time",
      "Watch all 6 transactions fire: escrow deposit, score submission, attestation, validation, and atomic release \u2014 all visible on Solana Explorer",
      "Full source code is open and public \u2014 inspect the Anchor program, the Venice AI integration, and the MagicBlock PER setup",
      "No wallet required to demo. No signup. Just paste and watch the pipeline run."
    ],
    "callout": "Live demo. Open source. Six transactions you can verify right now.",
    "note": "If presenting live, have the demo loaded and a story ready to paste. The six-tx pipeline is the moment \u2014 don't let it get buried under narration."
  },
  {
    "id": 9,
    "title": "Roadmap: From Primitive to Protocol",
    "bullets": [
      "Phase 1 (Done) \u2014 Core primitive: Anansi\u2192Ogma\u2192Escrow pipeline. TEE attestation. 6 on-chain transactions confirmed.",
      "Phase 2 \u2014 Multi-agent scoring DAGs: multiple Ogma nodes, consensus scoring, dispute resolution on-chain. Payment only releases on quorum.",
      "Phase 3 \u2014 Mainnet deployment + real Anansi story generation: AI-generated content scored and paid for autonomously, end to end.",
      "Phase 4 \u2014 Agent marketplace with trustless payment rails: any agent can list a service, accept TEE-attested scoring as payment condition, settle on Solana"
    ],
    "callout": "The primitive is done. The protocol is the roadmap.",
    "note": "Phase 4 is the long vision \u2014 don't oversell the timeline. The point is that the primitive you've built is the foundation, not the ceiling."
  },
  {
    "id": 10,
    "title": "Get Involved: The Base Layer of Trustless Agent Commerce",
    "bullets": [
      "Live demo: ogmascore.vercel.app/blitz \u2014 run the full 6-tx pipeline in your browser right now",
      "Open source: full Anchor program, Venice AI integration, and MagicBlock PER setup available on GitHub",
      "Built for builders: if you're shipping agent-to-agent payment systems, OgmaScore is the attestation primitive your trust model is missing",
      "Looking for: MagicBlock ecosystem partners, AI agent framework integrations, and early protocol collaborators"
    ],
    "callout": "\"OgmaScore: the base layer of trustless agent commerce.\"",
    "note": "End on the vision, not the ask. Let the demo do the selling \u2014 close with the one-liner and the URL on screen."
  }
];

export default function DeckPage() {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];
  const isFirst = current === 0;
  const isLast = current === slides.length - 1;

  const bold = (text: string) =>
    text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');

  return (
    <main className="min-h-screen bg-[#0a0a14] text-white font-mono flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800/60">
        <a href="/" className="text-purple-400 font-bold text-sm hover:text-purple-300 transition-colors">
          OgmaScore
        </a>
        <span className="text-xs text-gray-600 uppercase tracking-widest">Investor Deck</span>
        <a href="/blitz" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
          Try Demo →
        </a>
      </div>

      {/* Progress */}
      <div className="w-full h-0.5 bg-gray-900">
        <div
          className="h-0.5 bg-purple-500 transition-all duration-500"
          style={{ width: `${((current + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Slide */}
      <div className="flex-1 flex flex-col justify-center px-8 py-10 max-w-4xl mx-auto w-full">
        <div className="space-y-8">
          <div className="text-xs text-gray-600 uppercase tracking-widest font-mono">
            {current + 1} / {slides.length}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-purple-300 leading-tight">
            {slide.title}
          </h1>

          <ul className="space-y-4">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-base md:text-lg text-gray-300 leading-relaxed">
                <span className="text-purple-500 mt-1.5 shrink-0 text-sm">▸</span>
                <span dangerouslySetInnerHTML={{ __html: bold(b) }} />
              </li>
            ))}
          </ul>

          {slide.callout && (
            <blockquote className="border-l-4 border-purple-500 pl-5 py-1 mt-2">
              <p className="text-lg md:text-xl text-purple-200 italic leading-snug">
                {slide.callout}
              </p>
            </blockquote>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-800/60 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={isFirst}
          className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-20 disabled:cursor-not-allowed text-sm transition-colors"
        >
          ← Prev
        </button>

        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? "w-5 h-2 bg-purple-400"
                  : "w-2 h-2 bg-gray-700 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>

        {isLast ? (
          <a
            href="/blitz"
            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-bold transition-colors"
          >
            Try Demo →
          </a>
        ) : (
          <button
            onClick={() => setCurrent(c => Math.min(slides.length - 1, c + 1))}
            className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
          >
            Next →
          </button>
        )}
      </div>
    </main>
  );
}
