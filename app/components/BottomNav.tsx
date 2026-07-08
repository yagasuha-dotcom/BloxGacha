'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconWallet, IconUser } from './Icons';

const navItems = [
  { href: '/', label: 'Beranda', Icon: IconHome },
  { href: '/topup', label: 'Top Up', Icon: IconWallet },
  { href: '/profil', label: 'Profil', Icon: IconUser },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[60] pb-safe">
      <div className="flex justify-center pb-4 pt-2 px-4">
        <nav className="flex items-center gap-1 bg-surface/95 backdrop-blur-lg border border-border rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.4)] px-2 py-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                  active ? 'bg-accent text-[#062119]' : 'text-text-dim hover:text-text'
                }`}
              >
                <item.Icon className="w-[18px] h-[18px]" />
                <span className={active ? 'inline' : 'hidden'}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
