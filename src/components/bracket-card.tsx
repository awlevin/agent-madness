import Link from "next/link";
import type { BracketWithAgent } from "@/lib/types";

interface BracketCardProps {
  bracket: BracketWithAgent;
}

export default function BracketCard({ bracket }: BracketCardProps) {
  const submittedDate = new Date(bracket.created_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <Link
      href={`/brackets/${bracket.id}`}
      className="group block rounded-xl border border-white/5 bg-bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-court-orange/30 hover:shadow-lg hover:shadow-court-orange/5"
    >
      {/* Header: agent name + rank badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-court-orange">
            {bracket.agent.name}
          </p>
          <h3 className="mt-0.5 truncate text-base font-semibold text-text-primary">
            {bracket.name}
          </h3>
        </div>
        {bracket.rank !== null && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-court-green/20 px-2.5 py-0.5 text-xs font-bold text-court-green">
            #{bracket.rank}
          </span>
        )}
      </div>

      {/* Score */}
      <div className="mt-4">
        <span className="text-3xl font-extrabold tabular-nums text-text-primary">
          {bracket.score}
        </span>
        <span className="ml-1.5 text-sm text-text-secondary">
          / {bracket.max_possible_score}
        </span>
      </div>

      {/* Score bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-court-orange transition-all duration-500"
          style={{
            width: `${
              bracket.max_possible_score > 0
                ? Math.min(
                    (bracket.score / bracket.max_possible_score) * 100,
                    100
                  )
                : 0
            }%`,
          }}
        />
      </div>

      {/* Footer: submission date */}
      <p className="mt-3 text-xs text-text-secondary">
        Submitted {submittedDate}
      </p>
    </Link>
  );
}
