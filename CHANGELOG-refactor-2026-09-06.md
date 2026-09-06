# Catatan Perubahan Shortlytics — Perbaikan Audit (Fase 1–8)

Tanggal: 6 September 2026
Ruang lingkup: refactor hasil audit codebase, penerapan otomatis di workspace
`shortlytics/`.

---

## Fase 1 — Hapus Unused Dependency

| Berkas | Perubahan |
| --- | --- |
| `package.json` | Dependency `cn` di-uninstall (`npm uninstall cn`) |

**Dampak:**
- Paket yang tidak pernah diimpor dihapus dari `node_modules` dan manifest → berkurang ukuran instalasi & attack surface supply-chain.
- Catatan: proses uninstall melaporkan 4 high severity vulnerabilities di tree dependency; **tidak ditindaklanjuti** karena berisiko breaking/area di luar scope audit.

---

## Fase 2 — Sentralisasi APP_DOMAIN

| Berkas | Perubahan |
| --- | --- |
| `lib/request.ts` | Ditambahkan `getAppDomain(): string \| null` sebagai single source domain; `getBaseUrl` menggunakannya |
| `lib/anti-loop.ts` | Import `getAppDomain` dari `@/lib/request`; fallback `"shortlytics.app"` |
| `app/page.tsx` | Konstanta `APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN \|\| "shortlytics.app"` (2 pemakaian: demo shortUrl, link FAQ analytics) |
| `.env.example` | Tambah `NEXT_PUBLIC_APP_DOMAIN` dan `DIRECT_URL` + komentar dokumentasi |
| `prisma.config.ts` | Komentar dokumentasi `DIRECT_URL` (koneksi non-pooled) |

**Dampak:**
- Satu sumber kebenaran domain: tidak ada lagi string `shortlytics.app` tersebar hardcoded tanpa kontrol.
- Pemisahan benar antara env server-only (`APP_DOMAIN`/`DIRECT_URL`) vs env client (`NEXT_PUBLIC_*`, di-inline saat build) — mencegah kebocoran konfigurasi server ke bundle client.
- Landing page (client component) tetap bisa menampilkan domain demo tanpa mengimpor var server-only.

---

## Fase 3 — DRY Auth & Clipboard

### 3.1 Haler `requireUser()`

| Berkas | Perubahan |
| --- | --- |
| `lib/auth.ts` | Ditambahkan `requireUser(): Promise<string \| null>` (ambil sesi + validasi `id` string non-empty) |
| `app/api/links/route.ts` | POST & GET pakai `requireUser()`; `rateLimitIdentifier = \`${userId}:${ip}\`` |
| `app/api/links/[id]/route.ts` | GET & DELETE pakai `requireUser()` |
| `app/api/links/[id]/analytics/route.ts` | GET pakai `requireUser()` |
| `app/api/links/[id]/stream/route.ts` | GET pakai `requireUser()`; semua pemakaian `session.user.id` → `userId` |

### 3.2 Ownership Scoped Query (anti-IDOR)

`analytics` dan `stream` yang sebelumnya `findUnique` + cek `link.userId !== session.user.id` (403), diubah menjadi `findFirst({ where: { id, userId } })` → **404**.

| Berkas | Perubahan |
| --- | --- |
| `app/api/links/[id]/analytics/route.ts` | Scoped query, hapus cek 403 terpisah |
| `app/api/links/[id]/stream/route.ts` | Scoped query, hapus cek 403 terpisah |

### 3.3 Hook `useCopy`

| Berkas | Perubahan |
| --- | --- |
| `hooks/useCopy.ts` | **Baru** — hook `useCopy()` mengembalikan `{ copied, copy }` (copy + reset 2 detik) |
| `components/link-card.tsx` | Inline clipboard diganti `useCopy` |
| `app/(dashboard)/links/[id]/page.tsx` | Inline clipboard + state `copied` lokal diganti `useCopy` |
| `app/page.tsx` | Inline clipboard diganti `useCopy` |

**Dampak:**
- Penghapusan ~20 baris boilerplate auth yang sama di 5 route; konsistensi pesan error 401 terjaga.
- **Keamanan:** tidak ada lagi pola cek-ownership-then-query (TOCTOU); akses lintas pengguna sekarang tidak mungkin dan tidak membocorkan keberadaan link (404 untuk missing & bukan miliknya, alih-alih 403 yang mengungkap eksistensi).
- Copy-to-clipboard terpusat → perilaku seragam di landing, dashboard card, dan halaman detail.

---

## Fase 4 — Konsistensi Tailwind Config

| Berkas | Perubahan |
| --- | --- |
| `tailwind.config.ts` / `app/globals.css` | **Diverifikasi tanpa perubahan** — sudah konsisten |

**Dampak:**
- Design tokens hanya hidup di `globals.css` (`@theme inline` + `:root`/`.dark`); `tailwind.config.ts` murni metadata shadcn/IDE dan merujuk var CSS, tidak mendefinisikan ulang skala warna → tidak ada dual source of truth.

---

## Fase 5 — Shared Password Rule

| Berkas | Perubahan |
| --- | --- |
| `lib/validators.ts` | Tambah ekspor `MIN_PASSWORD_LENGTH = 8` |
| `app/api/auth/register/route.ts` | Validasi server pakai `MIN_PASSWORD_LENGTH` |
| `app/(auth)/register/page.tsx` | Validasi client + placeholder input pakai `MIN_PASSWORD_LENGTH` |

**Dampak:**
- Rule min. 8 karakter tidak mungkin melenceng antara client dan server (single source).
- Perubahan placeholder maupun pesan error cukup di satu tempat.

---

## Fase 6 — Dead Code & Gitignore

| Berkas | Perubahan |
| --- | --- |
| `components/logo.tsx` | Hapus `BracketIcon`, `SlashIcon`, tipe `LogoConcept`, prop `concept` (kini hanya `MonogramIcon`) |
| `app/(dashboard)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `app/page.tsx` | Hapus argumen `concept="monogram"` yang menjadi redundan |
| `.gitignore` | Tambah `dev-server.log` |

**Perbaikan tambahan selama verifikasi:** escape `&apos;` pada `app/page.tsx` (memperbaiki 1 error lint `react/no-unescaped-entities`).

**Dampak:**
- Mengurangi ~125 baris kode mati dan 2 komponen SVG tak terpakai; API `Logo` lebih sederhana.
- `dev-server.log` tidak lagi berisiko ter-commit ke repo.

---

## Fase 7 — Simplifikasi Rate Limit & Dashboard

| Berkas | Perubahan |
| --- | --- |
| `lib/rate-limit.ts` | Factory `createRateLimiter(prefix, maxRequests, windowSeconds)` menggantikan 3 blok ternari duplikat; kustomisasi Upstash vs in-memory fallback terpusat |
| `app/(dashboard)/dashboard/page.tsx` | Fetch `/api/links` menggunakan `fetchJson` bertipe; hapus interface lokal `LinkItem` + cast `as` |

**Dampak:**
- Konfigurasi limiter (20/100/5 per menit) terbaca sekilas dari satu fungsi; tambah limiter baru cukup satu baris.
- Dashboard tidak lagi bergantung pada bentuk respons tidak bertipe.

---

## Fase 8 — Type Safety API Client

| Berkas | Perubahan |
| --- | --- |
| `lib/api-types.ts` | **Baru** — tipe kanonikal (`ApiLink`, `ListLinksResponse`, `CreateLinkResponse`, `LinkDetail`, `AnalyticsResponse`, `DeleteLinkResponse`, `RegisterResponse`, `ClickRecord`), kelas `ApiError`, dan helper `fetchJson<T>()` yang melempar `ApiError` pada respons non-2xx |
| `app/(dashboard)/dashboard/page.tsx` | Pakai `fetchJson<ListLinksResponse>` |
| `components/link-form.tsx` | Pakai `fetchJson<CreateLinkResponse>` |
| `components/link-card.tsx` | Hapus pakai `fetchJson<DeleteLinkResponse>` |
| `app/(auth)/register/page.tsx` | Pakai `fetchJson<RegisterResponse>` |
| `app/(dashboard)/links/[id]/page.tsx` | Hapus interface lokal `LinkDetail`/`AnalyticsData`, pakai tipe shared + `fetchJson` |
| `AGENTS.md` | Dokumentasi konvensi baru: `requireUser`, scoped ownership, `fetchJson`/api-types, `useCopy`, `MIN_PASSWORD_LENGTH`, `NEXT_PUBLIC_APP_DOMAIN` vs `getAppDomain` |

**Dampak:**
- `res.json()` di seluruh client tidak lagi "implicit any": respons JSON diketik eksplisit dan error dinormalisasi menjadi `ApiError` (message dari server + `error` code).
- Kontrak API (daftar link, detail, analytics, dll.) didokumentasikan di satu tempat dan merefleksikan bentuk JSON di `app/api/`.
- Mengurangi duplikasi tipe antar-halaman (mis. `LinkItem` vs `LinkDetail`).

---

## Verifikasi Akhir

| Metode | Hasil |
| --- | --- |
| `npm run lint` | ✅ Lulus (1 warning pre-existing di `components/aurora.tsx`) |
| `npm run build` | ✅ Compile + TypeScript + static generation sukses |
| `npx tsx scripts/test-core-security.ts` | ✅ 24/24 PASS |
| `npx tsx scripts/test-fase5-engine.ts` | ✅ 12/12 PASS |
| `npx tsx scripts/test-fase6-analytics.ts` | ✅ 12/12 PASS |
| `npx tsx scripts/test-phase8-security.ts` | ⚠️ 3 "fail" = false-failure terdokumentasi (test berharap 400 unauthenticated padahal API benar mengembalikan 401); IDOR & privasi IP ✅ |

---

## Risiko & Catatan

- **Perubahan perilaku kecil:** analitik & stream kini mengembalikan **404** (bukan 403) untuk link milik pengguna lain — sengaja, demi keamanan (tidak membocorkan eksistensi).
- Rate limiter Upstash kini memakai string durasi `"60 s"` (setara `"1 m"`) via factory — ekivalen, hanya jalur kode yang di-DRY-kan.
- Tidak ada migrasi database, tidak ada perubahan skema Prisma, dan tidak ada secret baru.