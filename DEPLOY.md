# Panduan Deploy — Shortlytics ke Vercel + Cloudflare

Domain produksi: **`ilhamds.my.id`**
Repo: `https://github.com/IlhamDwi22/shortlytics` (branch `main`)

> Prasyarat: kode di `main` sudah berisi `"postinstall": "prisma generate"` (commit `105b66a`)
> sehingga Prisma Client akan di-generate otomatis saat Vercel install dependencies.

---

## Bagian 1 — Buat Project di Vercel

1. Buka <https://vercel.com/new> dan login.
2. Pilih **Import Git Repository** → pilih repo **`IlhamDwi22/shortlytics`**.
   - Jika belum terhubung, hubungkan GitHub account ke Vercel dan beri akses repo ini.
3. Biarkan preset otomatis (Next.js akan terdeteksi; Framework Preset = **Next.js**).
4. Build Command / Output: **jangan diubah** (default `next build`, output `.next`).
   - `postinstall` akan otomatis menjalankan `prisma generate`.
5. Klik **Deploy**. Tunggu sampai status *Ready*.

---

## Bagian 2 — Isi Environment Variables di Vercel

Di halaman project → **Settings → Environment Variables**, tambahkan (untuk
**Production**, **Preview**, **Development**):

| Key | Contoh nilai | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/shortlytics?sslmode=require` | **WAJIB.** Postgres dari Supabase/Neon. Tanpa ini `lib/db.ts` gagal saat import. |
| `NEXTAUTH_SECRET` | `openssl rand -base64 48` | **WAJIB.** Untuk menandatangani JWT. |
| `NEXTAUTH_URL` | `https://ilhamds.my.id` | **WAJIB.** URL absolut aplikasi. |
| `APP_DOMAIN` | `ilhamds.my.id` | **WAJIB.** Dipakai untuk membangun short URL & deteksi anti-loop. |
| `NEXT_PUBLIC_APP_DOMAIN` | `ilhamds.my.id` | **WAJIB.** Variant client (demo console landing). |
| `DIRECT_URL` | *(opsional)* | Koneksi langsung non-pooled jika `DATABASE_URL` lewat PgBouncer. |
| `UPSTASH_REDIS_REST_URL` | *(opsional)* | Rate limiting skala (Upstash Redis). |
| `UPSTASH_REDIS_REST_TOKEN` | *(opsional)* | Token Upstash. |
| `IPINFO_API_TOKEN` | *(opsional)* | Geolocation IP. |

> Di **Preview**/**Development**, `NEXTAUTH_URL` bebas (mis. URL sandbox) — yang
> penting Production memakai `https://ilhamds.my.id`.

---

## Bagian 3 — Tambahkan Custom Domain di Vercel

1. Di project → **Settings → Domains** → **Add** → ketik `ilhamds.my.id`.
2. Vercel akan menampilkan nilai DNS yang perlu dibuat di Cloudflare. Simpan
   nilai ini (biasanya CNAME `ilhamds.my.id` → `cname.vercel-dns.com`, atau
   A record `76.76.21.21`). Catat tepat milik project kamu.

---

## Bagian 4 — Setup DNS di Cloudflare

> Asumsi: zone `ilhamds.my.id` sudah dikelola di Cloudflare (nameserver
> Cloudflare sudah aktif untuk domain tsb).

1. Buka dasbor Cloudflare → pilih domain **`ilhamds.my.id`**.
2. Masuk ke **DNS → Records**, lalu **Add record**:

   - **Record 1 (root / apex):**
     - Type: `CNAME` (bisa juga `A` ke `76.76.21.21` — ikuti yang Vercel beri)
     - Name: `@` (atau `ilhamds.my.id`)
     - Target: `cname.vercel-dns.com` (nilai dari Vercel)
     - **Proxy status: diubah ke `DNS only` (grey cloud)** selama setup, lalu
       bisa kembali ke `Proxied` (orange) setelah verifikasi jika mau.
   - *(Opsional)* Jika ingin subdomain `www` ikut mengarah:
     - Type: `CNAME`
     - Name: `www`
     - Target: `cname.vercel-dns.com`

3. **Save.** Tunggu propagasi (biasanya 1–5 menit).

> Catatan penting: jika **Proxied (orange cloud)** aktif, pastikan Cloudflare
> SSL mode = **Full (strict)**. Karena Vercel menyediakan TLS sendiri, gunakan
> modus **Full** — bukan "Flexible" — agar tidak terjadi loop sertifikat.
> Rekomendasi: biarkan grey cloud (DNS only) hingga Vercel domain _Active_.

4. Kembali ke **Vercel → Settings → Domains**, klik **Refresh** sampai status
   domain berubah menjadi **Valid Configuration** / **Active** (Vercel sudah
   memverifikasi DNS dan menyediakan sertifikat).
5. Saat status **Active**, aplikasi bisa diakses lewat `https://ilhamds.my.id`.

---

## Bagian 5 — Redeploy / Verifikasi

1. Di Vercel → **Deployments** → pilih deployment terbaru → **Redeploy**
   (setelah env vars & domain ditambahkan, agar semua variabel ikut dipakai).
2. Uji:
   - Buka `https://ilhamds.my.id` → landing page tampil.
   - Register akun → dashboard terbuka.
   - Buat short link → cek short URL mengarah ke `https://ilhamds.my.id/<code>`.
   - `https://ilhamds.my.id/<code>` me-redirect ke URL asli & hitungan klik naik.

---

## Bagian 6 — (Opsional) Cloudflare optimasi / keamanan

- **SSL/TLS → Overview:** pastikan mode **Full (strict)** bila pakai orange cloud.
- **SSL/TLS → Edge Certificates → Always Use HTTPS:** aktifkan.
- Jangan aktifkan **Minify/Transform** yang bisa merusak header CSP.
- `Trusted Proxies` tidak diperlukan; Vercel menangani reverse proxy sendiri.

---

## Troubleshooting

| Gejala | Penyebab / Solusi |
| --- | --- |
| Build gagal "Prisma Client could not be generated" | Pastikan `postinstall` ada di `package.json`; redeploy. |
| Api/auth 500 "DATABASE_URL is not defined" | `DATABASE_URL` belum di-set di Vercel env → tambahkan, redeploy. |
| Redirection/anti-loop salah domain | `APP_DOMAIN` di env belum `ilhamds.my.id` → perbaiki, redeploy. |
| "This site can't be reached" / cert error | Status domain belum *Active* di Vercel; atau SSL mode salah di Cloudflare. |
| Login error "UntrustedHost" | `NEXTAUTH_URL` salah / tidak konsisten antara Vercel & Cloudflare → samakan ke `https://ilhamds.my.id`. |
| `errcode 1101` (orange cloud + Flexible) | Ganti SSL mode ke **Full (strict)**. |
