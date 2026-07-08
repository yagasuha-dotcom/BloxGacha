import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase-server';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import GachaCurrencySection from './GachaCurrencySection';
import type { GachaCurrencyTier, GachaCurrencyRange } from '@/app/lib/types';

export const dynamic = 'force-dynamic';

export default async function GameCurrencyPage({ params }: { params: { slug: string } }) {
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
      <Navbar balance={balance} isLoggedIn={!!userData?.user} />

      <div className="max-w-[1180px] mx-auto px-3.5 sm:px-5">
        <section className="pt-8 sm:pt-10 pb-4">
          <Link href={`/gacha/${game.slug}`} className="text-text-dim text-sm hover:text-text transition-colors">
            ← Kembali ke {game.name}
          </Link>
          <h1 className="text-xl sm:text-3xl font-extrabold mt-3">{game.name} — Gacha Currency</h1>
          <p className="text-text-dim text-sm mt-1">Dapatkan Robux, Diamond, dan currency game lain secara acak dalam rentang tertentu.</p>
        </section>

        <GachaCurrencySection
          currencyTiers={(currencyTiers as GachaCurrencyTier[]) ?? []}
          currencyRanges={(currencyRanges as GachaCurrencyRange[]) ?? []}
        />
      </div>

      <Footer />
    </>
  );
}
