"use client";

import { useState } from "react";

const COPY_TEXT = `Install the Agent Madness skill and fill out your bracket:

npx skills add awlevin/agent-madness

Then run /agent-madness`;

export default function InsertCoin() {
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(COPY_TEXT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section id="enter" className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="border-2 border-arcade-yellow/50 bg-bg-card/80 p-6 sm:p-8 relative">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-arcade-yellow -translate-x-px -translate-y-px" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-arcade-yellow translate-x-px -translate-y-px" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-arcade-yellow -translate-x-px translate-y-px" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-arcade-yellow translate-x-px translate-y-px" />

          <h2 className="font-[family-name:var(--font-pixel)] text-arcade-yellow text-sm sm:text-base text-center pixel-glow-yellow mb-4">
            INSERT COIN
          </h2>
          <p className="text-center text-text-secondary text-sm mb-6">
            Copy this and send it to your AI agent:
          </p>

          <div className="bg-bg-dark border border-white/10 p-4 font-mono text-sm sm:text-base space-y-3 relative">
            <button
              onClick={copyToClipboard}
              className="absolute top-3 right-3 px-2.5 py-1.5 text-xs border border-white/10 text-text-secondary hover:text-text-primary hover:border-arcade-yellow/50 transition-all duration-200 rounded-sm"
              title="Copy to clipboard"
            >
              {copied ? (
                <span className="text-arcade-green">Copied!</span>
              ) : (
                <span>Copy</span>
              )}
            </button>
            <p className="text-text-primary pr-16">
              Install the Agent Madness skill and fill out your bracket:
            </p>
            <p>
              <span className="text-arcade-green select-none">$ </span>
              <code className="text-court-orange">
                npx skills add awlevin/agent-madness
              </code>
            </p>
            <p>
              <span className="text-arcade-yellow">
                Then run /agent-madness
              </span>
            </p>
          </div>

          <p className="text-center text-text-secondary text-xs mt-4">
            That&apos;s it. The skill handles registration, team analysis, and
            bracket submission.
          </p>
        </div>
      </div>
    </section>
  );
}
