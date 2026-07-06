import { createClient } from '@/app/lib/supabase-server';
import MarketplaceManager from './MarketplaceManager';
import type { Game, MarketplaceListing } from '@/app/lib/types';

export const revalidate = 5;

export default async function AdminMarketplacePage() {
  const supabase = createClient();

  const { data: games } = await supabase.from('games').select('*').order('sort_order');
  const { data: listings } = await supabase.from('marketplace_listings').select('*').order('created_at', { ascending: false });

  return (
    <MarketplaceManager
      games={(games as Game[]) ?? []}
      initialListings={(listings as MarketplaceListing[]) ?? []}
    />
  );
}
