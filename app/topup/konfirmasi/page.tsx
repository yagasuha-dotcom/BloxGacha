import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase-server';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import TopupStepTwo from './TopupStepTwo';
import { formatRupiah } from '@/app/lib/utils';
import type { PaymentMethod } from '@/app/lib/types';

export const dynamic = 'force-dynamic';

export default async function TopupKonfirmasiPage({
  searchParams,
}: {
  searchParams: { amount?: string; method?: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) redirect('/masuk');

  const amount = parseInt(searchParams.amount ?? '0', 10);
  const methodId = searchParams.method;

  if (!amount || amount < 1000 || !methodId) redirect('/topup');

  const { data: profile } = await supabase.from('profiles').select('balance').eq('id', userData.user.id).single();

  const { data: method } = await supabase.from('payment_methods').select('*').eq('id', methodId).single();

  if (!method) redirect('/topup');

  return (
    <>
      <Navbar balance={profile?.balance ?? 0} isLoggedIn={true} />

      <div className="max-w-[600px] mx-auto px-3.5 sm:px-5 py-8 sm:py-10 pb-28">
        <a href="/topup" className="text-xs text-text-dim hover:text-text mb-4 inline-block">
          ← Kembali pilih nominal
        </a>
        <h1 className="text-xl sm:text-2xl font-extrabold mb-1">Selesaikan Pembayaran</h1>
        <p className="text-text-dim text-sm mb-6">
          Transfer <span className="text-gold font-bold">{formatRupiah(amount)}</span> ke {method.name}, lalu upload bukti transfer.
        </p>

        <TopupStepTwo amount={amount} method={method as PaymentMethod} />
      </div>

      <Footer />
    </>
  );
}
