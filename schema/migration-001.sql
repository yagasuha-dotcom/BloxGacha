-- =========================================
-- MIGRASI: Perbaikan RLS + Fitur Baru
-- Jalankan di SQL Editor Supabase (tambahan dari schema.sql)
-- =========================================

-- =========================================
-- 1. FIX RLS topup_requests (user harus bisa INSERT permintaan sendiri)
-- =========================================
create policy "Users can create own topup request" on public.topup_requests
  for insert with check (auth.uid() = user_id);


-- =========================================
-- 2. METODE PEMBAYARAN (GoPay, QRIS, OVO, DANA, dll)
-- =========================================
create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,               -- "GoPay", "QRIS", "OVO", "DANA"
  logo_url text,                    -- diisi admin lewat panel, kosong dulu (placeholder)
  account_number text,              -- nomor tujuan (nomor e-wallet / rekening)
  account_name text,                -- nama pemilik rekening/akun
  instructions text,                -- instruksi tambahan (opsional)
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.payment_methods enable row level security;

create policy "Anyone can view active payment methods" on public.payment_methods
  for select using (true);

create policy "Admins can manage payment methods" on public.payment_methods
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Kolom baru di topup_requests untuk menyimpan metode yang dipilih
alter table public.topup_requests
  add column payment_method_id uuid references public.payment_methods(id);


-- =========================================
-- 3. STORAGE BUCKET untuk logo payment method & logo game/app
-- =========================================
-- LANGKAH MANUAL WAJIB (tidak bisa lewat SQL biasa):
-- 1. Buka Supabase Dashboard -> Storage -> New bucket
-- 2. Nama bucket: branding
-- 3. Toggle "Public bucket" -> ON
-- 4. Setelah bucket dibuat, baru jalankan SQL di bawah ini:

create policy "Anyone can view branding assets" on storage.objects
  for select using (bucket_id = 'branding');

create policy "Admins can upload branding assets" on storage.objects
  for insert with check (
    bucket_id = 'branding'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete branding assets" on storage.objects
  for delete using (
    bucket_id = 'branding'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
