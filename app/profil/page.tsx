import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase-server';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { IconUser, IconCoin, IconGamepad } from '@/app/components/Icons';
import { formatRupiah, formatDateTime } from '@/app/lib/utils';
import type { GachaTransaction } from '@/app/lib/types';

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) redirect('/masuk');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, balance, total_gacha_count, created_at')
    .eq('id', userData.user.id)
    .single();

  const { data: history } = await supabase
    .from('gacha_transactions')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <>
      <Navbar balance={profile?.balance ?? 0} isLoggedIn={true} />

      <div className="max-w-[700px] mx-auto px-3.5 sm:px-5 py-8 sm:py-10 pb-28">
        {/* Header profil */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center shrink-0">
            <IconUser className="w-8 h-8 text-[#062119]" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-lg truncate">{profile?.username ?? userData.user.email}</div>
            <div className="text-text-dim text-xs mt-0.5">{userData.user.email}</div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-surface border border-border rounded-2xl p-4">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center mb-2.5">
              <IconCoin className="w-4.5 h-4.5 text-gold" />
            </div>
            <div className="text-lg font-extrabold">{formatRupiah(profile?.balance ?? 0)}</div>
            <div className="text-xs text-text-dim mt-0.5">Saldo</div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-4">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-2.5">
              <IconGamepad className="w-4.5 h-4.5 text-accent" />
            </div>
            <div className="text-lg font-extrabold">{profile?.total_gacha_count ?? 0}x</div>
            <div className="text-xs text-text-dim mt-0.5">Gacha Dibuka</div>
          </div>
        </div>

        {/* Riwayat gacha */}
        <div>
          <h2 className="text-sm font-bold text-text-dim mb-3">Riwayat Gacha</h2>
          {!history || history.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl py-8 text-center text-text-dim text-sm">
              Belum ada riwayat gacha. Yuk buka gacha pertamamu!
            </div>
          ) : (
            <div className="space-y-2">
              {(history as GachaTransaction[]).map((tx) => (
                <div key={tx.id} className="bg-surface border border-border rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border shrink-0 overflow-hidden flex items-center justify-center">
                    {tx.result_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tx.result_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <IconGamepad className="w-4 h-4 text-text-dim" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{tx.result_name}</div>
                    <div className="text-xs text-text-dim">
                      {tx.tier_name} · {formatDateTime(tx.created_at)}
                    </div>
                  </div>
                  <div className="font-pixel text-[11px] text-gold whitespace-nowrap">{formatRupiah(tx.price_paid)}</div>
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
