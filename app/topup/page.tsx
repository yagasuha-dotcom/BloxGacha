import { createClient } from '@/app/lib/supabase-server';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import TopupStepOne from './TopupStepOne';
import { formatRupiah, formatDateTime } from '@/app/lib/utils';
import type { TopupRequest, PaymentMethod } from '@/app/lib/types';

export const dynamic = 'force-dynamic';

export default async function TopupPage() {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return (
      <>
        <Navbar isLoggedIn={false} />
        <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
          <h1 className="text-xl font-bold mb-2">Masuk untuk top up saldo</h1>
          <p className="text-text-dim text-sm mb-6">Kamu perlu login terlebih dahulu sebelum melakukan top up.</p>
          <a href="/masuk" className="inline-block px-6 py-2.5 rounded-lg bg-accent text-[#062119] font-bold text-sm">
            Masuk
          </a>
        </div>
        <Footer />
      </>
    );
  }

  const { data: profile } = await supabase.from('profiles').select('balance').eq('id', userData.user.id).single();

  const { data: paymentMethods } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  const { data: history } = await supabase
    .from('topup_requests')
    .select('*, payment_methods(name)')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <>
      <Navbar balance={profile?.balance ?? 0} isLoggedIn={true} />

      <div className="max-w-[700px] mx-auto px-3.5 sm:px-5 py-8 sm:py-10 pb-28">
        <h1 className="text-xl sm:text-2xl font-extrabold mb-1">Top Up Saldo</h1>
        <p className="text-text-dim text-sm mb-6">
          Saldo kamu saat ini: <span className="text-gold font-bold">{formatRupiah(profile?.balance ?? 0)}</span>
        </p>

        <TopupStepOne paymentMethods={(paymentMethods as PaymentMethod[]) ?? []} />

        <div className="mt-10">
          <h2 className="text-sm font-bold text-text-dim mb-3">Riwayat Top Up</h2>
          {!history || history.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl py-8 text-center text-text-dim text-sm">
              Belum ada riwayat top up.
            </div>
          ) : (
            <div className="space-y-2">
              {(history as TopupRequest[]).map((req) => (
                <div key={req.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-sm">{formatRupiah(req.amount)}</div>
                    <div className="text-xs text-text-dim mt-0.5">
                      {req.payment_methods?.name ?? 'Transfer'} · {formatDateTime(req.created_at)}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      req.status === 'approved'
                        ? 'bg-accent/20 text-accent'
                        : req.status === 'rejected'
                        ? 'bg-danger/20 text-danger'
                        : 'bg-gold/20 text-gold'
                    }`}
                  >
                    {req.status === 'approved' ? 'Disetujui' : req.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
