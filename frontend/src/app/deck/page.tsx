"use client";

import { useState } from "react";

// Slide content — will be populated once Sara returns JSON
// Placeholder structure until content arrives
const slides: Slide[] = [];

interface Slide {
  id: number;
  title: string;
  bullets: string[];
  callout: string;
  note?: string;
}

export default function DeckPage() {
  const [current, setCurrent] = useState(0);

  if (slides.length === 0) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center font-mono">
        <p className="text-gray-500">Deck loading...</p>
      </main>
    );
  }

  const slide = slides[current];
  const isFirst = current === 0;
  const isLast = current === slides.length - 1;

  return (
    <main className="min-h-screen bg-[#0a0a14] text-white font-mono flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-900">
        <div
          className="h-1 bg-purple-500 transition-all duration-300"
          style={{ width: `${((current + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Slide */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 max-w-4xl mx-auto w-full">
        <div className="w-full space-y-8">
          {/* Slide number */}
          <div className="text-xs text-gray-600 uppercase tracking-widest">
            {current + 1} / {slides.length}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-purple-300 leading-tight">
            {slide.title}
          </h1>

          {/* Bullets */}
          <ul className="space-y-4">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-lg text-gray-300">
                <span className="text-purple-500 mt-1.5 shrink-0">▸</span>
                <span dangerouslySetInnerHTML={{ __html: b.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
              </li>
            ))}
          </ul>

          {/* Callout */}
          {slide.callout && (
            <blockquote className="border-l-4 border-purple-500 pl-6 py-2">
              <p className="text-xl text-purple-200 italic">{slide.callout}</p>
            </blockquote>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-800 px-8 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={isFirst}
          className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
        >
          ← Prev
        </button>

        {/* Dot nav */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-purple-400" : "bg-gray-700 hover:bg-gray-500"}`}
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
