# Shortlytics

Open-source URL shortener dengan analytics real-time. Buat link pendek, bagikan, dan pantau klik dari dashboard — perangkat, browser, referrer, dan lokasi yang dipakai pengunjung.

Dibangun dengan Next.js (App Router), NextAuth, PostgreSQL (Supabase) + Prisma ORM, dan di-deploy di Vercel.

## Fitur

- Shorten URL → link 7 karakter (base62, CSPRNG)
- Redirect + click tracking (device, browser, referrer, geolocation)
- Dashboard & detail analytics dengan chart, update real-time via SSE
- Auth: register/login, idle timeout, account lockout anti brute-force
- Anti-loop, rate limiting, privasi IP (masking)

## Tech Stack

Next.js 16 · TypeScript · Prisma 7 · PostgreSQL (Supabase) · NextAuth · Tailwind v4 + shadcn/ui · Recharts · Upstash Redis (rate limit) · Vercel

## Menjalankan di Lokal

Prasyarat: Node.js ≥ 20.9, PostgreSQL (lokal atau Supabase/Neon).

```bash
npm install
cp .env.example .env   # isi DATABASE_URL, NEXTAUTH_SECRET, dll.
npx prisma db push     # buat/update tabel + generate client
npm run dev
```

Buka http://localhost:3000.

## Verifikasi

```bash
npm run lint
npm run build
npx tsx scripts/test-core-security.ts
npx tsx scripts/test-fase5-engine.ts
npx tsx scripts/test-fase6-analytics.ts
```
