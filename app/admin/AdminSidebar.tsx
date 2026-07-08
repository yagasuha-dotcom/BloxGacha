'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconDashboard, IconCreditCard, IconGamepad, IconStore, IconUser } from '@/app/components/Icons';

const navItems = [
  { href: '/admin', label: 'Dashboard', Icon: IconDashboard },
  { href: '/admin/topup', label: 'Verifikasi Top Up', Icon: IconCreditCard },
  { href: '/admin/games', label: 'Game & Tier Gacha', Icon: IconGamepad },
  { href: '/admin/marketplace', label: 'Marketplace', Icon: IconStore },
  { href: '/admin/payment-methods', label: 'Metode Pembayaran', Icon: IconCreditCard },
];

export default function AdminSidebar({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <aside className="sm:w-64 border-b sm:border-b-0 sm:border-r border-border bg-surface shrink-0 sm:min-h-screen">
      <div className="p-5 border-b border-border">
        <div className="font-extrabold text-base">
          Blox<span className="text-accent">Gacha</span>
        </div>
        <div className="text-[11px] text-text-dim mt-0.5">Admin Panel</div>
      </div>

      <nav className="flex sm:flex-col overflow-x-auto sm:overflow-visible p-2.5 gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                active ? 'bg-accent/12 text-accent' : 'text-text-dim hover:text-text hover:bg-surface-2'
              }`}
            >
              <item.Icon className="w-[18px] h-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden sm:flex items-center gap-2.5 p-4 mt-auto border-t border-border">
        <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0">
          <IconUser className="w-4 h-4 text-text-dim" />
        </div>
        <div className="text-xs font-semibold truncate">{username}</div>
      </div>
    </aside>
  );
}
