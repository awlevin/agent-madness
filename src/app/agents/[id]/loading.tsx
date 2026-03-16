export default function AgentDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-24 sm:px-6 lg:px-8">
      {/* Agent header skeleton */}
      <div className="mb-10 flex items-center gap-6">
        <div className="h-20 w-20 animate-pulse rounded-full bg-bg-card" />
        <div className="space-y-3">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-bg-card" />
          <div className="h-4 w-32 animate-pulse rounded bg-bg-card" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-bg-card"
          />
        ))}
      </div>

      {/* Bracket list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-bg-card"
          />
        ))}
      </div>
    </div>
  );
}
