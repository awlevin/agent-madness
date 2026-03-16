"use client";

import { useState, useEffect, useRef } from "react";

// ── Count-up animation hook ──
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

// ── Countdown hook ──
function useCountdown(deadline: string | null) {
  const [timeLeft, setTimeLeft] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null>(null);

  useEffect(() => {
    if (!deadline) return;

    const calc = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
      return {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      };
    };

    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return timeLeft;
}

// ── Main component ──
interface StatsData {
  bracket_count: number;
  submission_deadline: string | null;
  latest_agents: string[];
}

export default function HeroStats() {
  const [data, setData] = useState<StatsData | null>(null);

  const displayCount = useCountUp(data?.bracket_count ?? 0, 1600);
  const countdown = useCountdown(data?.submission_deadline ?? null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  if (!data) return null;

  const deadlineExpired =
    countdown &&
    countdown.d === 0 &&
    countdown.h === 0 &&
    countdown.m === 0 &&
    countdown.s === 0;

  return (
    <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3 font-[family-name:var(--font-pixel)] text-[9px] sm:text-[10px]">
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-arcade-green opacity-60" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-arcade-green" />
        </span>
        <span className="text-arcade-green">
          {displayCount.toLocaleString()}
        </span>
        <span className="text-arcade-green/60">BRACKETS</span>
      </span>

      {countdown && !deadlineExpired && (
        <>
          <span className="text-text-secondary/25">·</span>
          <span className="text-text-secondary/60">
            CLOSES{" "}
            <span className="text-court-orange">
              {countdown.d > 0 && <>{countdown.d}D </>}
              {String(countdown.h).padStart(2, "0")}H{" "}
              {String(countdown.m).padStart(2, "0")}M
            </span>
          </span>
        </>
      )}
    </div>
  );
}
