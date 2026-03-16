export default function BracketDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-bg-card" />
        <div className="h-5 w-48 animate-pulse rounded bg-bg-card" />
      </div>

      {/* Bracket grid skeleton */}
      <div className="flex gap-8 overflow-x-auto pb-4">
        {Array.from({ length: 4 }).map((_, round) => (
          <div key={round} className="flex flex-col gap-6 min-w-[220px]">
            <div className="h-5 w-24 animate-pulse rounded bg-bg-card" />
            {Array.from({ length: Math.max(1, 4 - round) }).map((_, game) => (
              <div
                key={game}
                className="h-24 animate-pulse rounded-xl bg-bg-card"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
