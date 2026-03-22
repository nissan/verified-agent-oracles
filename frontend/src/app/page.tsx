"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const EXPLORER = (sig: string) =>
  `https://explorer.solana.com/tx/${sig}?cluster=devnet`;

const TRANSACTIONS = [
  {
    label: "Escrow Init",
    sig: "KY4eVoigSmCATFvSqCM61CUCiVKYAVgzE8TZCDf3ALtHR1qQFNNd8tytCKga5obaCPFZJQ4Mk9iWNBFEUaYaVPZ",
    tee: false,
  },
  {
    label: "Score Init",
    sig: "z5doYTjftJjXe1SbE6GySYKahQPnXj5rQkK6ztsjdB396XW8q2TSZy4NbUmBstXSHE67Mufe5dYBs7ezSbsgKwB",
    tee: false,
  },
  {
    label: "TEE Delegate",
    sig: "i9R78jU2Szx1Qpzy6NZuzoTVwMqYRwewQikVYRd32tTdANFutiGioSSJwN82KwmbMu5onpxrYmWoewgvukndXEA",
    tee: false,
  },
  {
    label: "Submit Score",
    sig: "4jXQDH57zqqat5iqGnLw3XTKaL8eqRxg5KVHqqmQv5BSCu1s1ij4sC9EDMvrZ86vHG5A5Q8VQp2gD9uBzzxP32qt",
    tee: true,
  },
  {
    label: "Undelegate",
    sig: "3hCytTu4f3cH4yZJWWqXc88pQchLZarEC2zN9UvkSCaVvENg25qYvPvYsMe3mFzuFN5nsgnuknCqzME9dFbAS9Mi",
    tee: false,
  },
  {
    label: "Release",
    sig: "4ZY1v5wGvbfA6WadJjdNax8SXP33uTM77SYBaDciMaq5i2wY2ivu2UKGYDmmmBrXemMcjPtEegReRyrsdAG7H2wi",
    tee: false,
  },
];

function ScoreCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = () => {
      start++;
      setCount(start);
      if (start < target) {
        setTimeout(step, 150);
      }
    };
    setTimeout(step, 400);
  }, [inView, target]);

  return (
    <div ref={ref} className="text-7xl font-bold text-blue-400 tabular-nums">
      {count}
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0D0D1A] text-white font-mono">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-teal-900/20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-10 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🕷️</span>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-violet-300 to-teal-400 bg-clip-text text-transparent">
                Verified Agent Oracles
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              <span className="text-purple-300">Anansi</span> ×{" "}
              <span className="text-teal-300">Ogma</span>
              &nbsp;|&nbsp;
              <span className="text-blue-300">MagicBlock TEE</span>
              &nbsp;|&nbsp;
              <span className="text-yellow-300">Solana Devnet</span>
            </p>
            <p className="text-gray-500 text-sm mt-3 max-w-2xl">
              TEE-attested AI judgment as a payment primitive. Anansi locks SOL
              in escrow. Ogma scores inside an Intel TDX enclave. The
              attestation commits to Solana L1. The escrow pays out on proof.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <a
                href="/blitz"
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors"
              >
                🎮 Try Demo →
              </a>
              <a
                href="/deck"
                className="px-4 py-2 text-sm border border-purple-600 text-purple-400 rounded hover:bg-purple-900/30 transition-colors"
              >
                📋 Investor Deck →
              </a>
              <a
                href="/slides"
                className="px-4 py-2 text-sm border border-gray-700 text-gray-400 rounded hover:bg-gray-800/30 transition-colors"
              >
                📊 Tech Slides →
              </a>
              <a
                href="https://github.com/nissan/verified-agent-oracles"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm border border-gray-700 text-gray-400 rounded hover:bg-gray-800/30 transition-colors"
              >
                ↗ GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Step Cards */}
      <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 gap-8">
        {/* Step 1 — The Story */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative rounded-2xl border border-green-500/50 bg-green-950/10 p-8 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-emerald-400 rounded-t-2xl" />
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">📜</span>
            <div>
              <div className="text-xs text-green-400 uppercase tracking-widest">
                Step 1
              </div>
              <h2 className="text-xl font-bold text-green-300">The Story</h2>
            </div>
            <span className="ml-auto text-xs bg-green-900/50 text-green-300 border border-green-600/40 px-3 py-1 rounded-full">
              ✅ Escrow Init
            </span>
          </div>

          <blockquote className="text-gray-300 text-base leading-relaxed border-l-2 border-green-500/50 pl-5 mb-6 italic">
            &quot;Anansi, the spider trickster, wove a tale for the children of
            the village. He stole fire from the sky god and gave it to the
            people, demanding only that they remember the old ways. The elders
            wept with recognition.&quot;
          </blockquote>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-3 flex-wrap">
              <span className="text-xs bg-yellow-900/40 text-yellow-300 border border-yellow-600/40 px-3 py-1 rounded-full">
                🕷️ Anansi deposits 0.001 SOL
              </span>
              <span className="text-xs bg-purple-900/40 text-purple-300 border border-purple-600/40 px-3 py-1 rounded-full">
                Threshold ≥ 7
              </span>
            </div>
            <a
              href={EXPLORER(TRANSACTIONS[0].sig)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-400 hover:text-green-300 border border-green-600/40 px-4 py-2 rounded-lg hover:bg-green-900/20 transition-colors flex items-center gap-2"
            >
              View Escrow ↗
            </a>
          </div>

          <div className="mt-4 text-xs text-gray-600 font-mono">
            Program: GyT8wyGD3dG3sVQ986SGwKxF23iWNjdbSe4oCuBrkMdd
          </div>
        </motion.div>

        {/* Step 2 — TEE Scoring */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative rounded-2xl border border-blue-500/50 bg-blue-950/10 p-8 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-t-2xl" />
          {/* Pulse ring on the shield */}
          <div className="flex items-start gap-6 mb-6">
            <div className="relative flex-shrink-0 mt-1">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-blue-500/20 rounded-full"
              />
              <div className="relative text-5xl">🛡️</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-xs text-blue-400 uppercase tracking-widest">
                  Step 2
                </div>
                <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-600/40 px-3 py-1 rounded-full">
                  🔵 TEE Active
                </span>
              </div>
              <h2 className="text-xl font-bold text-blue-300 mb-3">
                TEE Scoring
              </h2>

              <div className="flex items-end gap-3 mb-4">
                <ScoreCounter target={8} />
                <div className="text-3xl text-gray-500 mb-2">/ 10</div>
                <div className="mb-2 text-green-400 text-xl font-bold">
                  ✓ Threshold Met
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4">
                Scored inside{" "}
                <span className="text-blue-300 font-semibold">
                  Intel TDX hardware
                </span>{" "}
                | Zero-knowledge to outside observers
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="text-xs bg-indigo-900/40 text-indigo-300 border border-indigo-600/40 px-3 py-1 rounded-full">
                  ⚡ MagicBlock PER
                </span>
                <span className="text-xs bg-gray-800/60 text-gray-400 border border-gray-700/40 px-3 py-1 rounded-full">
                  Private Ephemeral Rollup
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Attestation committed to Solana L1 before payment released
            </div>
            <a
              href={EXPLORER(TRANSACTIONS[3].sig)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 border border-blue-600/40 px-4 py-2 rounded-lg hover:bg-blue-900/20 transition-colors flex items-center gap-2"
            >
              View TEE Tx ↗
            </a>
          </div>
        </motion.div>

        {/* Step 3 — Payment Released */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative rounded-2xl border border-yellow-500/50 bg-yellow-950/10 p-8 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-amber-300 rounded-t-2xl" />
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-xs text-yellow-400 uppercase tracking-widest">
                Step 3
              </div>
              <h2 className="text-xl font-bold text-yellow-300">
                Payment Released
              </h2>
            </div>
            <span className="ml-auto text-xs bg-green-900/50 text-green-300 border border-green-600/40 px-3 py-1 rounded-full">
              escrow.paid = true
            </span>
          </div>

          {/* SOL transfer visual */}
          <div className="flex items-center gap-4 mb-6 bg-black/30 rounded-xl p-4 border border-yellow-900/30">
            <div className="text-center">
              <div className="text-3xl mb-1">🕷️</div>
              <div className="text-xs text-purple-300 font-semibold">Anansi</div>
              <div className="text-xs text-gray-500">depositor</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-2xl"
              >
                →
              </motion.div>
              <div className="mt-1 text-yellow-400 font-bold text-lg">
                0.001 SOL
              </div>
              <div className="text-xs text-gray-500">via escrow</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">📜</div>
              <div className="text-xs text-teal-300 font-semibold">Ogma</div>
              <div className="text-xs text-gray-500">scorer</div>
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-5">
            Score met threshold. Attestation proved. SOL unlocked.
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-green-900/40 text-green-300 border border-green-600/40 px-3 py-1 rounded-full">
                ✅ Proof verified on L1
              </span>
              <span className="text-xs bg-yellow-900/40 text-yellow-300 border border-yellow-600/40 px-3 py-1 rounded-full">
                🔒 Trustless
              </span>
            </div>
            <a
              href={EXPLORER(TRANSACTIONS[5].sig)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-yellow-400 hover:text-yellow-300 border border-yellow-600/40 px-4 py-2 rounded-lg hover:bg-yellow-900/20 transition-colors flex items-center gap-2"
            >
              View Release ↗
            </a>
          </div>
        </motion.div>
      </div>

      {/* Transaction Panel */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="text-lg">⛓️</span>
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">
              On-Chain Proof Trail
            </h3>
            <span className="text-xs text-gray-600 ml-auto">Solana Devnet</span>
          </div>

          <div className="space-y-2">
            {TRANSACTIONS.map((tx, i) => (
              <div
                key={tx.sig}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-800/40 transition-colors group"
              >
                <span className="text-xs text-gray-600 w-4">{i + 1}.</span>
                <span className="text-xs text-gray-400 w-28 flex-shrink-0">
                  {tx.label}
                </span>
                {tx.tee && (
                  <span className="text-xs bg-blue-900/60 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded-full flex-shrink-0">
                    🛡️ TEE
                  </span>
                )}
                <span className="text-xs text-gray-600 font-mono flex-1 truncate">
                  {tx.sig.slice(0, 8)}...{tx.sig.slice(-6)}
                </span>
                <a
                  href={EXPLORER(tx.sig)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 flex items-center gap-1"
                >
                  ↗ Explorer
                </a>
                <a
                  href={EXPLORER(tx.sig)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 flex-shrink-0 flex items-center gap-1 sm:hidden"
                >
                  ↗
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>
            Built at{" "}
            <span className="text-purple-400">MagicBlock Solana Blitz v2</span>{" "}
            | Verified Agent Oracles
          </span>
          <a
            href="https://github.com/nissan/verified-agent-oracles"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-400 transition-colors"
          >
            reddinft/verified-agent-oracles ↗
          </a>
        </div>
      </footer>
    </main>
  );
}
