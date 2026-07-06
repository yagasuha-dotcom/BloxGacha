# BloxGacha

Platform gacha akun & currency multi-game (Free Fire, Mobile Legends, Roblox, Growtopia) + marketplace akun fix-price.

## Fitur

- **Gacha Akun** — per game, tier dengan pool item unik (akun asli, kredensial terenkripsi), chance rate diatur admin
- **Gacha Currency** — Robux/Diamond dengan hasil random dalam rentang yang bisa diatur
- **Marketplace** — akun fix-price, tanpa random, seller tunggal (admin)
- **Top Up manual** — transfer + upload bukti, admin approve/reject
- **Live feed transaksi** + **Leaderboard** (jumlah gacha dibuka) — semua data mulai dari nol, tanpa dummy
- **Admin Panel** — kelola game, tier, item, chance rate, listing, verifikasi top up

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor**, jalankan seluruh isi `schema/schema.sql`
3. Buka **Storage**, buat 2 bucket public: `proofs` dan `listings`
   (atau jalankan SQL yang dikomentari di bagian bawah `schema.sql`)
4. Buka **Project Settings > API**, salin URL dan kunci ke `.env.local`

### 3. Environment variables

```bash
cp .env.example .env.local
```

Isi semua nilai. Generate `CREDENTIAL_SECRET_KEY` dengan:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Jadikan diri sendiri admin

Setelah daftar akun pertama lewat halaman `/daftar`, jalankan di SQL Editor Supabase:
```sql
update public.profiles set role = 'admin' where username = 'username_kamu';
```

### 5. Jalankan development server
```bash
npm run dev
```

Buka `http://localhost:3000`.

## Struktur folder

```
app/
  page.tsx                  → Landing page
  gacha/[slug]/              → Halaman per game (tier akun + currency)
  marketplace/                → Marketplace akun fix-price
  topup/                       → Form top up saldo manual
  masuk/, daftar/               → Auth
  admin/
    page.tsx                    → Dashboard admin
    topup/                       → Verifikasi top up
    games/                        → Kelola game, tier, item, chance rate
    marketplace/                   → Kelola listing marketplace
  api/
    gacha/account, gacha/currency  → Logika buka gacha (server-side random)
    admin/topup                     → Approve/reject top up
    admin/account-item                → Simpan item akun (enkripsi kredensial)
    admin/marketplace-listing          → Simpan listing marketplace
  lib/
    crypto.ts                        → Enkripsi/dekripsi kredensial (AES-256-GCM)
    gacha-random.ts                   → Weighted random & range random
    supabase-client.ts, supabase-server.ts → Supabase client (browser/server/service role)
    types.ts                           → Tipe data TypeScript
    utils.ts                            → Format Rupiah, tanggal, dll
```

## Mengganti logo

Cari komentar `<!-- GANTI:` atau `{/* GANTI: */}` di:
- `app/components/Navbar.tsx` (logo utama)
- `app/components/GameCard.tsx` (logo per game)

Ganti div placeholder dengan `<img src="/logo-kamu.png" ... />`.

## Catatan keamanan

- Kredensial akun (email/password) dienkripsi AES-256-GCM sebelum disimpan — lihat `app/lib/crypto.ts`
- Kolom `credentials_encrypted` diblokir dari akses langsung client lewat RLS — hanya API route server yang bisa baca
- Operasi buka gacha bersifat atomik (mencegah dua user mengklaim item unik yang sama secara bersamaan)
- Approve top up divalidasi ulang statusnya sebelum diproses (mencegah double-approve dari klik ganda)

## Deploy

Deploy ke Vercel seperti project Next.js biasa. Pastikan semua environment variable di `.env.example` sudah diisi di dashboard Vercel (Settings > Environment Variables).
