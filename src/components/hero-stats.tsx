"use client";

import { useState, useEffect, useRef } from "react";

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

export default function HeroStats() {
  const [bracketCount, setBracketCount] = useState<number | null>(null);
  const displayCount = useCountUp(bracketCount ?? 0, 1400);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setBracketCount(data.bracket_count))
      .catch(() => {});
  }, []);

  if (bracketCount === null) return null;

  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-arcade-green opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-arcade-green shadow-[0_0_6px_rgba(0,255,65,0.8)]" />
      </span>
      <span className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-arcade-green/90 tracking-[0.15em]">
        <span className="text-arcade-green pixel-glow-green">
          {displayCount}
        </span>{" "}
        BRACKET{bracketCount === 1 ? "" : "S"} LOCKED IN
      </span>
    </div>
  );
}
