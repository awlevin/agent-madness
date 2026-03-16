"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-6xl font-extrabold text-court-orange">
        Technical Foul!
      </h1>
      <p className="mb-8 max-w-md text-text-secondary">
        Something went wrong. The refs are reviewing the play.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full bg-court-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-court-orange/80"
      >
        Try Again
      </button>
    </div>
  );
}
