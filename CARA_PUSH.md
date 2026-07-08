# Cara pasang fix ini lewat Termux

Isi zip ini punya struktur folder yang SAMA PERSIS dengan folder `app/` di repo BloxGacha kamu.
Cukup extract dan overwrite ke lokasi yang sama.

## Langkah-langkah

1. Pindahkan file `bloxgacha-fix.zip` ke folder project kamu di Termux (misal via `cp` dari folder Download):
   ```
   cp /sdcard/Download/bloxgacha-fix.zip ~/BloxGacha/
   ```

2. Masuk ke folder project:
   ```
   cd ~/BloxGacha
   ```

3. Extract (ini akan menimpa app/gacha/[slug]/page.tsx yang lama, dan menambah file baru):
   ```
   unzip -o bloxgacha-fix.zip
   ```

4. Hapus file lama yang sudah tidak dipakai (opsional tapi disarankan biar bersih):
   ```
   rm app/gacha/\[slug\]/GachaTierSection.tsx
   ```

5. Cek status git:
   ```
   git status
   ```
   Harusnya kelihatan:
   - modified: app/gacha/[slug]/page.tsx
   - new file: app/gacha/[slug]/GachaAccountSection.tsx
   - new file: app/gacha/[slug]/currency/page.tsx
   - new file: app/gacha/[slug]/currency/GachaCurrencySection.tsx
   - deleted: app/gacha/[slug]/GachaTierSection.tsx (kalau langkah 4 dijalankan)

6. Commit dan push:
   ```
   git add .
   git commit -m "Pisah halaman Gacha Currency jadi route sendiri"
   git push origin main
   ```

7. Tunggu Vercel selesai deploy otomatis, lalu tes buka halaman game — sekarang cuma tampil Gacha Akun,
   dengan tombol "Lihat Gacha Currency untuk [Nama Game]" yang mengarah ke halaman terpisah `/gacha/[slug]/currency`.

## Catatan
- Zip ini TIDAK menyentuh file lain di luar folder `app/gacha/[slug]/`, jadi aman untuk sistem lain
  (marketplace, payment methods, topup, dll tetap seperti semula).
- Kalau ada error build setelah push, kirim screenshot Build Logs dari Vercel.
