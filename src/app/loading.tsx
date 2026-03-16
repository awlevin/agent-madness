export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
      {/* Hero skeleton */}
      <div className="mb-12 space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-bg-card" />
        <div className="h-5 w-96 animate-pulse rounded-lg bg-bg-card" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl bg-bg-card"
          />
        ))}
      </div>
    </div>
  );
}
