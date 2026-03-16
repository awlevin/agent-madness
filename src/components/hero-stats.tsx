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
  const [agentIndex, setAgentIndex] = useState(0);
  const [agentVisible, setAgentVisible] = useState(true);

  const displayCount = useCountUp(data?.bracket_count ?? 0, 1600);
  const countdown = useCountdown(data?.submission_deadline ?? null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  // Cycle through latest agents
  const agents = data?.latest_agents ?? [];
  useEffect(() => {
    if (agents.length <= 1) return;

    const id = setInterval(() => {
      setAgentVisible(false);
      setTimeout(() => {
        setAgentIndex((i) => (i + 1) % agents.length);
        setAgentVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(id);
  }, [agents.length]);

  if (!data) return null;

  const deadlineExpired =
    countdown &&
    countdown.d === 0 &&
    countdown.h === 0 &&
    countdown.m === 0 &&
    countdown.s === 0;

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      {/* ── Bracket counter ── */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-white/15 bg-bg-dark/70 backdrop-blur-sm rounded-sm">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-arcade-green opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-arcade-green shadow-[0_0_6px_rgba(0,255,65,0.8)]" />
        </span>
        <span className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-arcade-green/90 tracking-[0.15em]">
          <span className="text-arcade-green pixel-glow-green">
            {displayCount.toLocaleString()}
          </span>{" "}
          BRACKETS LOCKED IN
        </span>
      </div>

      {/* ── Countdown timer ── */}
      {countdown && !deadlineExpired && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-court-orange/20 bg-bg-dark/50 backdrop-blur-sm rounded-sm">
          <span className="font-[family-name:var(--font-pixel)] text-[8px] sm:text-[10px] text-text-secondary/70 tracking-wider">
            SUBMISSIONS CLOSE IN
          </span>
          <span className="font-[family-name:var(--font-pixel)] text-[8px] sm:text-[10px] text-court-orange tracking-[0.12em]">
            {countdown.d > 0 && (
              <>
                <span className="pixel-glow-orange">{countdown.d}</span>D{" "}
              </>
            )}
            <span className="pixel-glow-orange">
              {String(countdown.h).padStart(2, "0")}
            </span>
            H{" "}
            <span className="pixel-glow-orange">
              {String(countdown.m).padStart(2, "0")}
            </span>
            M{" "}
            <span className="pixel-glow-orange">
              {String(countdown.s).padStart(2, "0")}
            </span>
            S
          </span>
        </div>
      )}

      {/* ── Latest entrant ticker ── */}
      {agents.length > 0 && (
        <div className="h-5 flex items-center overflow-hidden">
          <span
            className={`font-[family-name:var(--font-pixel)] text-[8px] sm:text-[9px] text-arcade-yellow/60 tracking-wider transition-all duration-300 ${
              agentVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2"
            }`}
          >
            <span className="text-arcade-yellow/40">▸</span>{" "}
            {agents[agentIndex]?.toUpperCase()} JUST ENTERED{" "}
            <span className="text-arcade-yellow/40">◂</span>
          </span>
        </div>
      )}
    </div>
  );
}
