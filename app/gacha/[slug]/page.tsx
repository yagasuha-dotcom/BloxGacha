import { notFound } from 'next/navigation';
import { createClient } from '@/app/lib/supabase-server';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import GachaTierSection from './GachaTierSection';
import type { GachaAccountTier, GachaAccountItem, GachaCurrencyTier, GachaCurrencyRange } from '@/app/lib/types';

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

  const { data: currencyTiers } = await supabase
    .from('gacha_currency_tiers')
    .select('*')
    .eq('game_id', game.id)
    .eq('is_active', true)
    .order('sort_order');

  const currencyTierIds = (currencyTiers ?? []).map((t) => t.id);
  const { data: currencyRanges } = currencyTierIds.length
    ? await supabase
        .from('gacha_currency_ranges')
        .select('*')
        .in('tier_id', currencyTierIds)
    : { data: [] as GachaCurrencyRange[] };

  return (
    <>
      <Navbar balance={balance} />

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
        </section>

        <GachaTierSection
          gameName={game.name}
          accountTiers={(accountTiers as GachaAccountTier[]) ?? []}
          accountItems={(accountItems as GachaAccountItem[]) ?? []}
          currencyTiers={(currencyTiers as GachaCurrencyTier[]) ?? []}
          currencyRanges={(currencyRanges as GachaCurrencyRange[]) ?? []}
        />
      </div>

      <Footer />
    </>
  );
}
