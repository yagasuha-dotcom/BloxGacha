import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase-server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) redirect('/masuk');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single();

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-2xl mb-2">🔒</div>
          <div className="font-bold">Akses ditolak</div>
          <div className="text-text-dim text-sm mt-1">Halaman ini hanya untuk admin.</div>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/topup', label: 'Verifikasi Top Up', icon: '💳' },
    { href: '/admin/games', label: 'Game & Tier Gacha', icon: '🎮' },
    { href: '/admin/marketplace', label: 'Marketplace', icon: '🛒' },
  ];

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <aside className="sm:w-56 border-b sm:border-b-0 sm:border-r border-border bg-surface shrink-0">
        <div className="p-4 font-extrabold text-sm">
          Blox<span className="text-accent">Gacha</span> <span className="text-text-dim font-normal">Admin</span>
        </div>
        <nav className="flex sm:flex-col overflow-x-auto sm:overflow-visible">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-dim hover:text-text hover:bg-surface-2 whitespace-nowrap"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-6 max-w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
