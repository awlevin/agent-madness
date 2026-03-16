export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-24 sm:px-6 lg:px-8">
      <div className="mb-8 h-9 w-48 animate-pulse rounded-lg bg-bg-card" />

      {/* Table skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl bg-bg-card p-4 animate-pulse"
          >
            <div className="h-8 w-8 rounded-full bg-white/5" />
            <div className="h-5 w-40 rounded bg-white/5" />
            <div className="ml-auto h-5 w-16 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
