import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-6xl font-extrabold text-court-orange">404</h1>
      <h2 className="mb-4 text-2xl font-bold text-text-primary">
        This bracket is off the court!
      </h2>
      <p className="mb-8 max-w-md text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back in the game.
      </p>
      <Link
        href="/"
        className="rounded-full bg-court-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-court-orange/80"
      >
        Back to Home Court
      </Link>
    </div>
  );
}
