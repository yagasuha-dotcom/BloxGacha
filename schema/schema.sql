-- =========================================
-- BLOXGACHA DATABASE SCHEMA
-- Platform: Supabase (Postgres)
-- =========================================

-- =========================================
-- 0. APP SETTINGS (exchange rate, dll)
-- =========================================
create table public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Contoh isi awal (dijalankan sekali):
-- insert into public.app_settings (key, value) values ('key_exchange_rate_rupiah', '1000');
-- artinya 1 Key = Rp 1.000, tinggal diubah dari admin panel kapan saja


-- =========================================
-- 1. USERS & AUTH
-- =========================================
-- Supabase Auth sudah handle tabel auth.users bawaan.
-- Tabel ini adalah profile tambahan yang nyambung ke auth.users

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  balance numeric(12,2) not null default 0,       -- saldo dalam satuan Key (1 Key = Rp sekian, lihat app_settings)
  role text not null default 'user',               -- 'user' | 'admin'
  total_gacha_count int not null default 0,        -- buat leaderboard "jumlah gacha dibuka"
  created_at timestamptz not null default now()
);

-- Index buat leaderboard cepat
create index idx_profiles_gacha_count on public.profiles (total_gacha_count desc);


-- =========================================
-- 2. GAME MASTER (FF, ML, Roblox, Growtopia, dst)
-- =========================================
create table public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- "Free Fire", "Mobile Legends", "Roblox", "Growtopia"
  slug text unique not null,          -- "free-fire", "mobile-legends", "roblox", "growtopia"
  logo_url text,                      -- placeholder, nanti diganti manual
  color_theme text default '#22c55e',-- warna aksen card per game
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);


-- =========================================
-- 3. GACHA AKUN (per game)
-- =========================================

-- Tier / paket gacha akun (misal: "Power Accounts", "Magical Accounts")
create table public.gacha_account_tiers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  name text not null,                 -- "Magical Accounts"
  price numeric(12,2) not null,       -- harga sekali gacha
  profile_badge text,                 -- "Small Profit" / "Medium Profit" / dst (label saja, bukan penentu nilai)
  banner_image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Item unik di dalam tier (akun asli, 1 row = 1 akun)
create table public.gacha_account_items (
  id uuid primary key default gen_random_uuid(),
  tier_id uuid not null references public.gacha_account_tiers(id) on delete cascade,
  item_name text not null,             -- "Akun Magical #001"
  image_url text,
  chance numeric(5,2) not null,        -- persen, misal 25.00 artinya 25%
  -- Kredensial akun, disimpan terenkripsi di level aplikasi (bukan plaintext)
  credentials_encrypted text,          -- JSON terenkripsi: {email, password, extra_info}
  is_claimed boolean not null default false,
  claimed_by uuid references public.profiles(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_gacha_account_items_tier on public.gacha_account_items (tier_id) where is_claimed = false;


-- =========================================
-- 4. GACHA CURRENCY (Robux, Diamond ML, dll)
-- =========================================

create table public.gacha_currency_tiers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  name text not null,                  -- "Robux Tier A"
  currency_label text not null,        -- "Robux" / "Diamond"
  price numeric(12,2) not null,
  banner_image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Range hasil random per tier (reusable, bukan unik/stock fisik)
create table public.gacha_currency_ranges (
  id uuid primary key default gen_random_uuid(),
  tier_id uuid not null references public.gacha_currency_tiers(id) on delete cascade,
  min_amount int not null,
  max_amount int not null,
  chance numeric(5,2) not null,         -- persen
  created_at timestamptz not null default now()
);


-- =========================================
-- 5. GACHA BOXES (generik, non-akun non-currency)
-- misal: world lock, diamond lock, item Growtopia lain
-- =========================================

create table public.gacha_box_tiers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete cascade, -- nullable, bisa generik
  name text not null,                   -- "Crystal Box"
  price numeric(12,2) not null,
  banner_image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Item di dalam box (reusable, stock berupa angka karena bukan akun unik)
create table public.gacha_box_items (
  id uuid primary key default gen_random_uuid(),
  tier_id uuid not null references public.gacha_box_tiers(id) on delete cascade,
  item_name text not null,
  image_url text,
  chance numeric(5,2) not null,
  stock int not null default 0,          -- stock sebagai counter, bukan row unik
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);


-- =========================================
-- 6. MARKETPLACE AKUN (fix price, non-random, seller = kamu sendiri)
-- =========================================

create table public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  title text not null,
  description text,
  price numeric(12,2) not null,
  images jsonb default '[]'::jsonb,       -- array url screenshot akun
  credentials_encrypted text,             -- terisi setelah SOLD, sebelum itu bisa null/draft
  status text not null default 'available', -- 'available' | 'sold' | 'hidden'
  sold_to uuid references public.profiles(id),
  sold_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_marketplace_status on public.marketplace_listings (status, game_id);


-- =========================================
-- 7. TRANSAKSI GACHA (histori + live feed)
-- =========================================

create table public.gacha_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  gacha_type text not null,             -- 'account' | 'currency' | 'box'
  tier_id uuid not null,                -- FK manual ke salah satu tabel tier di atas (polymorphic, divalidasi di app layer)
  tier_name text not null,              -- disimpan langsung biar feed tetap tampil walau tier dihapus
  price_paid numeric(12,2) not null,
  result_name text not null,            -- nama item/currency yang didapat, misal "Akun Magical #001" atau "97 Robux"
  result_image_url text,
  created_at timestamptz not null default now()
);

create index idx_gacha_tx_created on public.gacha_transactions (created_at desc);


-- =========================================
-- 8. MARKETPLACE TRANSAKSI (beli fix-price)
-- =========================================

create table public.marketplace_transactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id),
  buyer_id uuid not null references public.profiles(id),
  price_paid numeric(12,2) not null,
  created_at timestamptz not null default now()
);


-- =========================================
-- 9. TOP UP SALDO (manual transfer + approval admin)
-- =========================================

create table public.topup_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  amount numeric(12,2) not null,         -- nominal yang di-transfer
  unique_code text not null,             -- kode unik buat dicantumin di keterangan TF
  proof_image_url text not null,         -- bukti transfer, upload ke Supabase Storage
  status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  admin_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_topup_status on public.topup_requests (status, created_at desc);


-- =========================================
-- 10. LEADERBOARD (view, bukan tabel fisik)
-- =========================================

create view public.leaderboard as
select
  p.id,
  p.username,
  p.avatar_url,
  p.total_gacha_count
from public.profiles p
where p.total_gacha_count > 0
order by p.total_gacha_count desc
limit 50;


-- =========================================
-- 11. ROW LEVEL SECURITY (dasar, wajib untuk Supabase)
-- =========================================

alter table public.profiles enable row level security;
alter table public.topup_requests enable row level security;
alter table public.gacha_transactions enable row level security;
alter table public.marketplace_listings enable row level security;

-- Contoh policy dasar (nanti disempurnakan pas implementasi auth)
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can view own topup requests" on public.topup_requests
  for select using (auth.uid() = user_id);

create policy "Anyone can view gacha transactions" on public.gacha_transactions
  for select using (true);   -- feed live harus publik

create policy "Anyone can view available listings" on public.marketplace_listings
  for select using (status = 'available' or auth.uid() is not null);


-- =========================================
-- 12. PROTEKSI KOLOM SENSITIF (kredensial akun)
-- =========================================
-- Kolom credentials_encrypted TIDAK boleh terbaca oleh anon/authenticated,
-- hanya service_role (dipakai lewat API route server-side) yang boleh baca.
revoke select (credentials_encrypted) on public.gacha_account_items from anon, authenticated;
revoke select (credentials_encrypted) on public.marketplace_listings from anon, authenticated;
grant select (credentials_encrypted) on public.gacha_account_items to service_role;
grant select (credentials_encrypted) on public.marketplace_listings to service_role;

alter table public.gacha_account_items enable row level security;
create policy "Anyone can view non-sensitive item info" on public.gacha_account_items
  for select using (true);


-- =========================================
-- 13. AUTO-CREATE PROFILE SAAT USER BARU DAFTAR (opsional, alternatif dari insert manual di frontend)
-- =========================================
-- Jika ingin profile dibuat otomatis oleh trigger alih-alih insert manual di halaman daftar,
-- aktifkan trigger berikut (pastikan tidak dobel insert dengan kode frontend):
--
-- create or replace function public.handle_new_user()
-- returns trigger as $$
-- begin
--   insert into public.profiles (id, username)
--   values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
--   return new;
-- end;
-- $$ language plpgsql security definer;
--
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute function public.handle_new_user();


-- =========================================
-- 14. STORAGE BUCKETS (dijalankan sekali via Supabase Dashboard atau SQL)
-- =========================================
-- insert into storage.buckets (id, name, public) values ('proofs', 'proofs', true);
-- insert into storage.buckets (id, name, public) values ('listings', 'listings', true);
--
-- Storage policy: user hanya bisa upload ke folder miliknya sendiri untuk bukti TF
-- create policy "Users can upload own topup proof" on storage.objects
--   for insert with check (bucket_id = 'proofs' and auth.uid() is not null);
-- create policy "Anyone can view topup proofs" on storage.objects
--   for select using (bucket_id = 'proofs');
-- create policy "Admins can upload listing images" on storage.objects
--   for insert with check (bucket_id = 'listings' and auth.uid() is not null);
-- create policy "Anyone can view listing images" on storage.objects
--   for select using (bucket_id = 'listings');
