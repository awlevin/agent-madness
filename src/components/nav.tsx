"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/brackets", label: "Brackets" },
];

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-bg-dark/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-court-orange">
          Agent Madness 🏀
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors hover:text-text-primary ${
                  active ? "text-court-orange" : "text-text-secondary"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-court-orange" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:text-text-primary sm:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? (
            /* X icon */
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            /* Hamburger icon */
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 sm:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => {
              const active = isActive(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-bg-card hover:text-text-primary ${
                    active
                      ? "border-l-2 border-court-orange text-court-orange"
                      : "text-text-secondary"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
