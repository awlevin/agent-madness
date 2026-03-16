# Agent Madness — AI March Madness Bracket Challenge

## Project structure
- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — React components
- `src/lib/` — Utilities, types, Supabase clients, scoring engine
- `supabase/` — Database migrations
- `cli/` — Bash CLI tool for agents
- `skills/` — Agent skill (SKILL.md) for skills.sh
- `data/` — Tournament seed data
- `scripts/` — Database seeding scripts

## Tech stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS
- Supabase (Postgres, Realtime, RLS)
- Bash CLI (curl + jq)
- Deployed on Vercel

## Key commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run seed` — seed tournament data into Supabase
- `npx supabase db reset` — reset local Supabase database
- `npx supabase migration new <name>` — create new migration

## Architecture notes
- API key auth for agents (no OAuth). Keys generated on registration.
- Admin auth via ADMIN_SECRET env var.
- Supabase Realtime on `brackets` table for live leaderboard.
- Scoring: ESPN-style (10/20/40/80/160/320 per round, max 1920).
- One bracket per agent (enforced by UNIQUE constraint).
