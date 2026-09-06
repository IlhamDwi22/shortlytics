# Shortlytics — URL Shortener with Analytics

Portfolio app. Requirements and target architecture live in the sibling spec docs
(`../docs/PRD-Shortlytics.md`, `../docs/TechSpec-Shortlytics.md`) — the TechSpec is
written explicitly as context for AI-driven development and defines the Prisma schema,
API design, security (anti-loop, rate limiting), and real-time analytics (SSE). Read it
before implementing features.

## Current state (important)

- The full app is implemented: landing page, auth (register/login, NextAuth JWT with
  15-day idle timeout + account lockout), links CRUD, redirect handler with async
  click logging (`after()`), analytics, SSE real-time stream, and rate limiting.
- Design is v2 *"Data Instrument"*: forced-dark landing shell; dashboard/auth follow
  system light/dark. **Design tokens live EXCLUSIVELY in `app/globals.css`
  (`@theme inline` + `:root`/`.dark`)** — `tailwind.config.ts` is only for shadcn
  metadata/IDE tooling and must NOT redefine color scales.
- Schema is synced to the live Supabase/Postgres DB via `npx prisma db push`
  (no migration files in repo). After editing `prisma/schema.prisma`, re-run it:
  `npx prisma db push` (auto-generates the client).
- `Click.ipAddress` stores a **masked** IP only (`maskIp()`); raw IP is used solely for
  the in-flight geolocation lookup and is never persisted.

## Toolchain facts

- `Next.js 16.3.3` (very new, breaking changes) + `React 19.2.8` + `Prisma 7.10.0`
  (provider `prisma-client-js`, adapter-pg, PostgreSQL). The `middleware` convention is
  deprecated in favor of `proxy` in Next 16 (still works; warning at build).
- npm. Scripts: `npm run dev | build | start | lint`. `lint` is ESLint
  (`eslint-config-next` core-web-vitals + typescript).
- **No test runner configured**, but standalone verification scripts exist under
  `scripts/`. Run in order after changes:
  1. `npm run lint`
  2. `npm run build`
  3. `npx tsx scripts/test-core-security.ts`
  4. `npx tsx scripts/test-fase5-engine.ts`
  5. `npx tsx scripts/test-fase6-analytics.ts`
  6. `npx tsx scripts/test-phase8-security.ts` (needs `npm run dev` on :3000; its #1–3
     expect unauthenticated 400s but the API requires auth first → known false failures)
- Path alias `@/*` resolves to the `shortlytics/` root, **not** the monorepo parent
  `D:\Projects\1 - URL Shortener` (docs live outside this package under `../docs/`).
  shadcn aliases: `@/components/ui`, `@/lib/utils`.
- Styling: shadcn `base-nova` style backed by `@base-ui/react` (not Radix) — this is a
  non-default shadcn setup. Tailwind v4 via `@tailwindcss/postcss`.
- Prisma: `DATABASE_URL` comes from `.env` (see `.env.example`); `NEXTAUTH_SECRET`
  likewise. Never commit real secrets.

## Key implementation notes

- Authenticated API routes use `requireUser()` (`lib/auth.ts`) — one helper that
  returns `Promise<string | null>` from the session. Do NOT call
  `getServerSession`/`authOptions` directly in route handlers.
- Ownership is enforced atomically (scoped `where: { id, userId }`) in
  `app/api/links/[id]/route.ts`, `[id]/analytics/route.ts`, and
  `[id]/stream/route.ts` — returns 404 for other users' links (no IDOR leak),
  never a separate 403 ownership check.
- Client fetches go through `fetchJson<T>` (`lib/api-types.ts`): throws `ApiError`
  on non-2xx (with the server's `message`/`error` code), never implicitly-typed
  `res.json()`. Canonical API response shapes (`.ApiLink`, `ListLinksResponse`,
  `AnalyticsResponse`, etc.) live there and mirror the `app/api/` JSON contracts.
- Clipboard copy is centralized in `hooks/useCopy.ts` (returns `{ copied, copy }`);
  do not inline `navigator.clipboard` per-component.
- Password minimum length is a single shared constant (`MIN_PASSWORD_LENGTH` in
  `lib/validators.ts`) used by both the register page and `register/route.ts`.
- Domain for client-side display is `process.env.NEXT_PUBLIC_APP_DOMAIN`
  (inlined at build; landing page demo). Server-side URLs use
  `getAppDomain()`/`getBaseUrl()` in `lib/request.ts` (`APP_DOMAIN` is
  server-only and must not be imported by client components).
- Short codes: CSPRNG base62 via rejection sampling (`lib/shortener.ts`) + up to 3
  retries on Prisma `P2002` collision (`app/api/links/route.ts`).
- Client IP: `extractClientIp` trusts only the rightmost public address in
  `x-forwarded-for` and never returns private/reserved addresses
  (`lib/privacy.ts`); `isPrivateIp` also guards geolocation (`lib/geolocation.ts`).
- Redirect handler (`app/[shortCode]/route.ts`) uses `notFound()` for missing links;
  the catch block must rethrow the `NEXT_HTTP_ERROR_FALLBACK;404` digest.