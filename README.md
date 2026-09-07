# Shortlytics 🔗 — URL Shortener with Analytics

Shortlytics adalah aplikasi **URL shortener** yang tidak hanya mempersingkat
tautan, tapi juga memberi insight mendalam tentang performanya: siapa yang
mengklik, kapan, dari perangkat & browser apa, dan dari mana asalnya — dengan
update **real-time** saat terjadi klik baru.

Project ini adalah portfolio fullstack (auth → database → API → visualisasi
data → deployment) dan open-source. Dibangun dengan **Next.js (App Router)**,
**PostgreSQL + Prisma**, dan di-deploy di **Vercel**.

> Dokumentasi lengkap (PRD, Tech Spec, panduan desain & deploy) tersedia di
> direktori `../docs/dev-docs/` dan dirujuk di bawah.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
| --- | --- |
| 🔗 **Shorten URL** | Ubah URL panjang menjadi short link 7 karakter (base62, CSPRNG) secara instan |
| ↪️ **Redirect** | Pengunjung diarahkan otomatis (302) ke URL asli |
| 📈 **Click Tracking** | Setiap klik tercatat: timestamp, device, browser, referrer, negara/kota |
| 🔐 **Auth** | Register/login dengan NextAuth (JWT, idle timeout 15 hari, account lockout anti brute-force) |
| 📊 **Dashboard** | Semua link milik user + ringkasan jumlah klik & pencarian |
| 🧭 **Detail Analytics** | Grafik klik per hari, breakdown device/browser/referrer/negara |
| ⚡ **Real-time (SSE)** | Dashboard update otomatis saat ada klik baru tanpa refresh |
| 🗑️ **Delete Link** | Hapus link beserta seluruh data kliknya (cascade) |

Non-goals v1 (tidak dikerjakan): custom alias/domain, QR code, kolaborasi
tim, monetisasi — detail di [PRD](PRD §4).

---

## 🏗️ Tech Stack

| Layer | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router + Route Handlers) |
| Bahasa | TypeScript (strict) |
| Database | PostgreSQL (Supabase/Neon, free tier) |
| ORM | Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`) |
| Auth | NextAuth.js (credentials, strategi JWT) |
| Styling | Tailwind CSS v4 + shadcn/ui (`base-nova` style, `@base-ui/react`) |
| Chart | Recharts |
| Rate Limiting | Upstash Redis + `@upstash/ratelimit` (fallback in-memory untuk dev) |
| Real-time | Server-Sent Events (SSE) via Route Handler |
| Geolocation | ipinfo.io / ip-api (free tier) |
| Deployment | Vercel |

Dasar keputusan stack ini dijelaskan di [TechSpec §2](TechSpec).

---

## 📁 Struktur Project

```
shortlytics/
├── app/
│   ├── (auth)/login|register/page.tsx      # halaman login & register
│   ├── (dashboard)/dashboard/page.tsx       # list semua link milik user
│   ├── (dashboard)/links/[id]/page.tsx      # detail analytics per link
│   ├── api/auth/[...nextauth]/route.ts      # NextAuth handler
│   ├── api/auth/register/route.ts           # registrasi user
│   ├── api/links/route.ts                   # POST create, GET list
│   ├── api/links/[id]/route.ts              # GET detail, DELETE
│   ├── api/links/[id]/analytics/route.ts    # data analytics
│   ├── api/links/[id]/stream/route.ts       # SSE real-time
│   ├── [shortCode]/route.ts                 # redirect handler (public)
│   ├── layout.tsx & page.tsx                # landing page
├── components/                              # shadcn/ui + charts + fitur
├── hooks/                                   # useRealtimeAnalytics, useCopy
├── lib/                                     # db, auth, shortener, validators,
│                                            # anti-loop, rate-limit, privacy, geolocation, api-types
├── prisma/schema.prisma                     # skema User → Link → Click
├── scripts/                                 # skrip verifikasi (test-core-security, dsb.)
├── middleware.ts                            # auth guard untuk /dashboard & /links
├── .env.example                             # template environment variables
└── DEPLOY.md                                # panduan deploy Vercel + Cloudflare
```

Peta lengkap sesuai spec ada di [TechSpec §8](TechSpec).

---

## 🚀 Menjalankan di Lokal

### Prasyarat
- **Node.js ≥ 20.9** dan npm
- **PostgreSQL** (lokal atau Supabase/Neon free tier)

### Langkah
```bash
# 1. Install dependencies
npm install

# 2. Siapkan env (sesuaikan nilainya)
cp .env.example .env

# 3. Sinkronkan skema database
npx prisma db push          # buat/update tabel dari schema + regenerate client

# 4. Jalankan development server
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000).

### Environment Variables
Variabel wajib & opsional didokumentasikan di `.env.example`:
`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `APP_DOMAIN`,
`NEXT_PUBLIC_APP_DOMAIN`, plus opsional `DIRECT_URL`,
`UPSTASH_REDIS_REST_URL/TOKEN`, `IPINFO_API_TOKEN`.

> Jangan pernah commit `.env` ke repository — hanya `.env.example` (template).

---

## ✅ Verifikasi / Testing

Project ini tidak memakai test runner; verifikasi memakai skrip standalone di
`scripts/`. Jalankan berurutan:

```bash
npm run lint
npm run build
npx tsx scripts/test-core-security.ts    # validasi URL, anti-loop, base62, IP masking
npx tsx scripts/test-fase5-engine.ts     # shortener + redirect engine
npx tsx scripts/test-fase6-analytics.ts  # agregasi analytics + privasi IP
```

---

## 📚 Dokumentasi Referensi

Dokumen teknis lengkap berada di `../docs/dev-docs/` (di luar folder ini):

| Dokumen | Isi |
| --- | --- |
| [`PRD-Shortlytics.md`](../docs/dev-docs/PRD-Shortlytics.md) | Product Requirement: fitur, user stories, edge cases, NFR, security, batasan |
| [`TechSpec-Shortlytics.md`](../docs/dev-docs/TechSpec-Shortlytics.md) | Arsitektur teknis: stack, schema DB, API design, rate limiting, SSE, checklist |
| [`design-Shortlytics.md`](../docs/dev-docs/design-Shortlytics.md) | Panduan desain UI/UX & design system |
| [`FrontendCraftGuide-Shortlytics.md`](../docs/dev-docs/FrontendCraftGuide-Shortlytics.md) | Standar pengerjaan frontend (aksesibilitas, kualitas kode) |
| [`PromptingPlaybook-Shortlytics.md`](../docs/dev-docs/PromptingPlaybook-Shortlytics.md) | Playbook prompting untuk AI-driven development |
| [`DEPLOY.md`](./DEPLOY.md) | Panduan deploy ke Vercel + setup Cloudflare (DNS, SSL) |

> Path alias `@/*` mengarah ke root `shortlytics/`, bukan ke parent
> `D:\Projects\1 - URL Shortener`.

---

## 🔒 Keamanan (ringkas)

- **Anti-loop** — menolak URL dari domain sendiri & layanan shortener lain
  (`lib/anti-loop.ts`).
- **Anti-IDOR** — kepemilikan link ditegakkan atomik `where: { id, userId }`;
  link milik user lain mengembalikan 404 (tidak membocorkan eksistensi).
- **Rate limiting** — Upstash Redis (fallback in-memory) pada create/redirect/auth
  (`lib/rate-limit.ts`).
- **Privasi IP** — IP di-mask (`lib/privacy.ts`); IP mentah hanya untuk lookup
  geolocation, tidak pernah ditampilkan di API/UI.
- **CSPRNG** — short code dibuat dengan `crypto.randomBytes` (bukan `Math.random`).
- **Security headers & CSP** — di `next.config.ts`.
- **Lockout akun** — 5 gagal login → kunci 15 menit; idle 15 hari → sesi
  di-invalidate.

Detail lengkap: [PRD §13](PRD) & [TechSpec §6](TechSpec).

---

## 🌐 Deployment (Vercel + Cloudflare)

Deploy mencakup: import repo → set env vars di Vercel → tambah custom domain →
setup DNS di Cloudflare → verifikasi. **Panduan langkah demi langkah ada di
[`DEPLOY.md`](./DEPLOY.md)** (termasuk nilai CNAME untuk `ilhamds.my.id` dan
troubleshooting).

---

## 📄 Lisensi & Status

- Status: **portfolio project** (v1 MVP selesai, development aktif).
- Dibuat oleh **Ilham** — hubungi via repo GitHub
  [`IlhamDwi22/shortlytics`](https://github.com/IlhamDwi22/shortlytics).

---

*Project ini dikembangkan mengikuti PRD & Tech Spec (docs): lihat
[`../docs/dev-docs/`](../docs/dev-docs/).*