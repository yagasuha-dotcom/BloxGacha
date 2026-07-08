import { createClient } from '@/app/lib/supabase-server';
import { formatRupiah } from '@/app/lib/utils';
import { IconHourglass, IconUsers, IconGamepad, IconMoneyBag } from '@/app/components/Icons';

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
    { label: 'Top Up Menunggu', value: pendingTopup ?? 0, Icon: IconHourglass, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Total Pengguna', value: totalUsers ?? 0, Icon: IconUsers, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Total Gacha Dibuka', value: totalGacha ?? 0, Icon: IconGamepad, color: 'text-purple', bg: 'bg-purple/10' },
    { label: 'Total Top Up Disetujui', value: formatRupiah(totalRevenue), Icon: IconMoneyBag, color: 'text-gold', bg: 'bg-gold/10' },
  ];

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-1">Dashboard</h1>
      <p className="text-text-dim text-sm mb-6">Ringkasan aktivitas BloxGacha.</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-2xl p-5 hover:border-accent/30 transition-colors">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.Icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-xl font-extrabold">{s.value}</div>
            <div className="text-xs text-text-dim mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
