import Link from 'next/link';
import { formatRupiah } from '@/app/lib/utils';

export default function Navbar({ balance = 0, isLoggedIn = false }: { balance?: number; isLoggedIn?: boolean }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md w-full">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 min-w-0 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center font-pixel text-[11px] text-[#062119] shrink-0">
            {/* GANTI: <img src="/logo.png" alt="BloxGacha" className="w-full h-full object-cover rounded-lg" /> */}
            BG
          </div>
          <span className="font-extrabold text-base sm:text-lg tracking-tight whitespace-nowrap">
            Blox<span className="text-accent">Gacha</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-surface border border-border px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-text-dim whitespace-nowrap">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v20M6 6l6-4 6 4M6 10h12M7 14h10M8 18h8" stroke="#FFB84D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:inline">Saldo:</span>
            <span className="text-gold font-bold">{formatRupiah(balance)}</span>
          </div>

          {isLoggedIn ? (
            <>
              <Link href="/topup" className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-accent text-[#062119] text-xs sm:text-sm font-bold hover:brightness-110 hover:-translate-y-0.5 transition-all">
                Top Up
              </Link>
              <form action="/api/auth/keluar" method="POST">
                <button type="submit" className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-border text-xs sm:text-sm font-bold hover:-translate-y-0.5 transition-transform">
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/masuk" className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-border text-xs sm:text-sm font-bold hover:-translate-y-0.5 transition-transform">
                Masuk
              </Link>
              <Link href="/daftar" className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-accent text-[#062119] text-xs sm:text-sm font-bold hover:brightness-110 hover:-translate-y-0.5 transition-all">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
