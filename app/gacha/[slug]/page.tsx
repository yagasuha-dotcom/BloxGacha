import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase-server';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import GachaAccountSection from './GachaAccountSection';
import type { GachaAccountTier, GachaAccountItem } from '@/app/lib/types';

export const dynamic = 'force-dynamic';

export default async function GamePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!game) notFound();

  const { data: userData } = await supabase.auth.getUser();
  let balance = 0;
  if (userData?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userData.user.id)
      .single();
    balance = profile?.balance ?? 0;
  }

  const { data: accountTiers } = await supabase
    .from('gacha_account_tiers')
    .select('*')
    .eq('game_id', game.id)
    .eq('is_active', true)
    .order('sort_order');

  const accountTierIds = (accountTiers ?? []).map((t) => t.id);
  const { data: accountItems } = accountTierIds.length
    ? await supabase
        .from('gacha_account_items')
        .select('*')
        .in('tier_id', accountTierIds)
    : { data: [] as GachaAccountItem[] };

  // Cek apakah game ini punya currency tier, untuk menampilkan tombol link
  const { data: currencyTierCheck } = await supabase
    .from('gacha_currency_tiers')
    .select('id')
    .eq('game_id', game.id)
    .eq('is_active', true)
    .limit(1);

  const hasCurrency = (currencyTierCheck ?? []).length > 0;

  return (
    <>
      <Navbar balance={balance} isLoggedIn={!!userData?.user} />

      <div className="max-w-[1180px] mx-auto px-3.5 sm:px-5">
        <section className="pt-8 sm:pt-10 pb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-pixel text-[11px] mb-4"
            style={{ background: `linear-gradient(135deg, ${game.color_theme}, rgba(0,0,0,0.4))` }}
          >
            {game.name.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold">{game.name}</h1>
          <p className="text-text-dim text-sm mt-1">Klik &quot;Info&quot; untuk lihat isi pool &amp; peluang sebelum membeli.</p>

          {hasCurrency && (
            <Link
              href={`/gacha/${game.slug}/currency`}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg border border-gold/40 text-gold text-xs sm:text-sm font-bold hover:-translate-y-0.5 transition-transform"
            >
              Lihat Gacha Currency untuk {game.name} →
            </Link>
          )}
        </section>

        <GachaAccountSection
          gameName={game.name}
          accountTiers={(accountTiers as GachaAccountTier[]) ?? []}
          accountItems={(accountItems as GachaAccountItem[]) ?? []}
        />
      </div>

      <Footer />
    </>
  );
}
