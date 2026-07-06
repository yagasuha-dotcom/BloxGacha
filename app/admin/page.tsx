import { createClient } from '@/app/lib/supabase-server';
import { formatRupiah } from '@/app/lib/utils';

export default async function AdminDashboard() {
  const supabase = createClient();

  const { count: pendingTopup } = await supabase
    .from('topup_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

  const { count: totalGacha } = await supabase.from('gacha_transactions').select('*', { count: 'exact', head: true });

  const { data: approvedTopups } = await supabase.from('topup_requests').select('amount').eq('status', 'approved');
  const totalRevenue = (approvedTopups ?? []).reduce((sum, t) => sum + Number(t.amount), 0);

  const stats = [
    { label: 'Top Up Menunggu', value: pendingTopup ?? 0, icon: '⏳', href: '/admin/topup' },
    { label: 'Total Pengguna', value: totalUsers ?? 0, icon: '👥' },
    { label: 'Total Gacha Dibuka', value: totalGacha ?? 0, icon: '🎰' },
    { label: 'Total Top Up Disetujui', value: formatRupiah(totalRevenue), icon: '💰' },
  ];

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl p-4">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-lg font-extrabold">{s.value}</div>
            <div className="text-xs text-text-dim mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
