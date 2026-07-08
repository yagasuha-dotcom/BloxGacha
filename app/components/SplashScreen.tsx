'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Cuma tampil sekali per sesi tab, bukan di setiap navigasi halaman
    const seen = sessionStorage.getItem('bg_splash_seen');
    if (seen) {
      setVisible(false);
      return;
    }
    const fadeTimer = setTimeout(() => setFadeOut(true), 900);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('bg_splash_seen', '1');
    }, 1200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[300] bg-bg flex items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center font-pixel text-sm text-[#062119]">
          {/* GANTI: <img src="/logo.png" alt="BloxGacha" className="w-full h-full object-cover rounded-2xl" /> */}
          BG
        </div>
        <div className="font-extrabold text-2xl tracking-tight">
          Blox<span className="text-accent">Gacha</span>
        </div>
      </div>
    </div>
  );
}
