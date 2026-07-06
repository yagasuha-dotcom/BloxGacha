import { createClient } from '@/app/lib/supabase-server';
import GameManager from './GameManager';
import type { Game } from '@/app/lib/types';

export const revalidate = 5;

export default async function AdminGamesPage() {
  const supabase = createClient();

  const { data: games } = await supabase.from('games').select('*').order('sort_order');

  const gameIds = (games ?? []).map((g) => g.id);

  const { data: accountTiers } = gameIds.length
    ? await supabase.from('gacha_account_tiers').select('*').in('game_id', gameIds)
    : { data: [] };

  const { data: accountItems } = accountTiers && accountTiers.length
    ? await supabase.from('gacha_account_items').select('*').in('tier_id', accountTiers.map((t) => t.id))
    : { data: [] };

  const { data: currencyTiers } = gameIds.length
    ? await supabase.from('gacha_currency_tiers').select('*').in('game_id', gameIds)
    : { data: [] };

  const { data: currencyRanges } = currencyTiers && currencyTiers.length
    ? await supabase.from('gacha_currency_ranges').select('*').in('tier_id', currencyTiers.map((t) => t.id))
    : { data: [] };

  return (
    <GameManager
      initialGames={(games as Game[]) ?? []}
      initialAccountTiers={accountTiers ?? []}
      initialAccountItems={accountItems ?? []}
      initialCurrencyTiers={currencyTiers ?? []}
      initialCurrencyRanges={currencyRanges ?? []}
    />
  );
}
