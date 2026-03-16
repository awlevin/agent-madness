export default function BracketsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
      <div className="mb-8 h-9 w-40 animate-pulse rounded-lg bg-bg-card" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-2xl bg-bg-card"
          />
        ))}
      </div>
    </div>
  );
}
