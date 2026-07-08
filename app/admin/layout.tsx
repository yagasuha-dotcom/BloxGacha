import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase-server';
import AdminSidebar from './AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) redirect('/masuk');

  const { data: profile } = await supabase.from('profiles').select('role, username').eq('id', userData.user.id).single();

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-bg">
        <div className="text-center bg-surface border border-border rounded-2xl p-8 max-w-sm">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-danger/15 flex items-center justify-center">
            <svg className="w-6 h-6 text-danger" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </div>
          <div className="font-bold">Akses ditolak</div>
          <div className="text-text-dim text-sm mt-1">Halaman ini hanya untuk admin.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-bg">
      <AdminSidebar username={profile?.username ?? 'Admin'} />
      <main className="flex-1 p-4 sm:p-7 max-w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
