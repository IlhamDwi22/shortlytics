# Shortlytics — URL Shortener with Analytics

Portfolio app. Requirements and target architecture live in the sibling spec docs
(`../docs/PRD-Shortlytics.md`, `../docs/TechSpec-Shortlytics.md`) — the TechSpec is
written explicitly as context for AI-driven development and defines the Prisma schema,
API design, security (anti-loop, rate limiting), and real-time analytics (SSE). Read it
before implementing features.

## Current state (important)

- Only the landing page is implemented (`app/page.tsx`, `app/layout.tsx`).
- `lib/db.ts` (Prisma singleton) and `prisma/schema.prisma` are staged but have **no
  Prisma migrations yet**. Auth, links API, redirect handler, analytics, SSE, and rate
  limiting are all **not built** — do not assume they exist.

## Toolchain facts

- `Next.js 16.3.3` (very new, breaking changes) + `React 19.2.8` + `Prisma 6.19.3`
  (provider `prisma-client-js`, PostgreSQL). See the auto-generated block above.
- npm. Scripts: `npm run dev | build | start | lint`. `lint` is ESLint
  (`eslint-config-next` core-web-vitals + typescript).
- **No test runner is configured.** Verify work via `npm run lint` and `npm run build`;
  don't invent a test command.
- Path alias `@/*` resolves to the `shortlytics/` root, **not** the monorepo parent
  `D:\Projects\1 - URL Shortener` (docs live outside this package under `../docs/`).
  shadcn aliases: `@/components/ui`, `@/lib/utils`.
- Styling: shadcn `base-nova` style backed by `@base-ui/react` (not Radix) — this is a
  non-default shadcn setup. Tailwind v4 via `@tailwindcss/postcss`.
- Prisma: `DATABASE_URL` comes from `.env` (see `.env.example`). Generate the client
  and run a migration before any DB query; schema has unique `shortCode` and
  `onDelete: Cascade` relations.
