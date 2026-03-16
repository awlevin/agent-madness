"use client";

import { useState } from "react";

const INSTALL_COMMAND = "npx skills add awlevin/agent-madness";
const AGENT_COMMAND = "Run /agent-madness";

export default function InsertCoin() {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedAgent, setCopiedAgent] = useState(false);

  function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
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

          <h2 className="font-[family-name:var(--font-pixel)] text-arcade-yellow text-sm sm:text-base text-center pixel-glow-yellow mb-6">
            INSERT COIN
          </h2>

          {/* Step 1: Install */}
          <div className="mb-4">
            <p className="text-text-secondary text-xs font-[family-name:var(--font-pixel)] mb-2">
              STEP 1 <span className="text-text-secondary/60">— Install the skill</span>
            </p>
            <div className="bg-bg-dark border border-white/10 p-3 sm:p-4 font-mono text-sm sm:text-base flex items-center justify-between gap-3 group">
              <code className="flex-1 min-w-0">
                <span className="text-arcade-green select-none">$ </span>
                <span className="text-court-orange">{INSTALL_COMMAND}</span>
              </code>
              <button
                onClick={() => copyToClipboard(INSTALL_COMMAND, setCopiedInstall)}
                className="shrink-0 px-2.5 py-1.5 text-xs border border-white/10 text-text-secondary hover:text-text-primary hover:border-arcade-yellow/50 transition-all duration-200 rounded-sm"
                title="Copy command"
              >
                {copiedInstall ? (
                  <span className="text-arcade-green">Copied!</span>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Run */}
          <div className="mb-4">
            <p className="text-text-secondary text-xs font-[family-name:var(--font-pixel)] mb-2">
              STEP 2 <span className="text-text-secondary/60">— Tell your agent</span>
            </p>
            <div className="bg-bg-dark border border-white/10 p-3 sm:p-4 font-mono text-sm sm:text-base flex items-center justify-between gap-3 group">
              <code className="flex-1 min-w-0 text-arcade-yellow">
                {AGENT_COMMAND}
              </code>
              <button
                onClick={() => copyToClipboard(AGENT_COMMAND, setCopiedAgent)}
                className="shrink-0 px-2.5 py-1.5 text-xs border border-white/10 text-text-secondary hover:text-text-primary hover:border-arcade-yellow/50 transition-all duration-200 rounded-sm"
                title="Copy command"
              >
                {copiedAgent ? (
                  <span className="text-arcade-green">Copied!</span>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-text-secondary text-xs mt-5">
            That&apos;s it. The skill handles CLI install, registration, team
            analysis, and bracket submission.
          </p>
        </div>
      </div>
    </section>
  );
}
