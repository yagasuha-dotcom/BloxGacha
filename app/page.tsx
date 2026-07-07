import { createClient } from '@/app/lib/supabase-server';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import GameCard from '@/app/components/GameCard';
import { Leaderboard, LiveFeed } from '@/app/components/CommunityPanels';
import type { Game, GachaTransaction, Profile } from '@/app/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient();

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

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  // Hitung jumlah tier aktif per game (akun + currency + box gabungan)
  const tierCounts: Record<string, number> = {};
  if (games) {
    for (const game of games as Game[]) {
      const { count: accCount } = await supabase
        .from('gacha_account_tiers')
        .select('*', { count: 'exact', head: true })
        .eq('game_id', game.id)
        .eq('is_active', true);
      const { count: curCount } = await supabase
        .from('gacha_currency_tiers')
        .select('*', { count: 'exact', head: true })
        .eq('game_id', game.id)
        .eq('is_active', true);
      tierCounts[game.id] = (accCount ?? 0) + (curCount ?? 0);
    }
  }

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('id, username, avatar_url, total_gacha_count')
    .limit(10);

  const { data: transactions } = await supabase
    .from('gacha_transactions')
    .select('*, profiles(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <>
      <Navbar balance={balance} />

      <div className="max-w-[1180px] mx-auto px-3.5 sm:px-5">
        {/* HERO */}
        <section className="pt-8 sm:pt-10 pb-6 sm:pb-8">
          <span className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] tracking-wider uppercase text-accent font-bold mb-4 bg-accent/[0.08] border border-accent/25 px-2.5 sm:px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Live sekarang
          </span>
          <h1 className="text-[22px] sm:text-[32px] md:text-[40px] font-extrabold leading-tight tracking-tight max-w-[680px]">
            Selamat datang di <span className="text-accent">BloxGacha</span>
          </h1>
        </section>

        {/* GACHA AKUN */}
        <section className="py-9 sm:py-[52px]">
          <div className="mb-6">
            <div className="text-lg sm:text-[22px] font-extrabold flex items-center gap-2.5">
              <span className="font-pixel text-[9px] text-bg bg-accent px-2 py-1.5 rounded">GACHA</span>
              Gacha Akun
            </div>
            <div className="text-text-dim text-[13px] mt-1">Pilih game, buka box, lihat akun apa yang kamu dapat.</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            {(games as Game[] | null)?.map((game) => (
              <GameCard key={game.id} game={game} tierCount={tierCounts[game.id] ?? 0} />
            ))}
            {(!games || games.length === 0) && (
              <div className="col-span-2 sm:col-span-4 border border-dashed border-border rounded-2xl py-12 text-center text-text-dim text-sm">
                Belum ada game yang ditambahkan. Tambahkan lewat Admin Panel.
              </div>
            )}
          </div>
        </section>

        {/* MARKETPLACE */}
        <section className="py-9 sm:py-[52px]">
          <div className="mb-6">
            <div className="text-lg sm:text-[22px] font-extrabold flex items-center gap-2.5">
              <span className="font-pixel text-[9px] text-white bg-purple px-2 py-1.5 rounded">FIX PRICE</span>
              Marketplace Akun
            </div>
            <div className="text-text-dim text-[13px] mt-1">Lihat detail lengkap, pilih sendiri, harga pasti — tanpa random.</div>
          </div>
          <MarketplacePreview />
        </section>

        {/* LEADERBOARD + FEED */}
        <section className="py-9 sm:py-[52px]">
          <div className="mb-6">
            <div className="text-lg sm:text-[22px] font-extrabold">🏆 Papan Peringkat &amp; Aktivitas</div>
            <div className="text-text-dim text-[13px] mt-1">Data asli dari transaksi berjalan — dimulai dari nol.</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-3.5 sm:gap-5 items-start">
            <Leaderboard users={(leaderboard as Profile[] | null) ?? []} />
            <LiveFeed transactions={(transactions as GachaTransaction[] | null) ?? []} />
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

async function MarketplacePreview() {
  const supabase = createClient();
  const { data: listings } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(4);

  if (!listings || listings.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-2xl py-12 px-5 text-center text-text-dim text-[13.5px]">
        Belum ada listing akun. Tambahkan produk pertama lewat Admin Panel.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
      {listings.map((item) => (
        <div key={item.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="h-[90px] sm:h-[110px] bg-surface-2 flex items-center justify-center text-text-dim text-[11px] border-b border-border">
            {item.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              'Foto akun'
            )}
          </div>
          <div className="p-3 sm:p-3.5">
            <div className="font-bold text-[13px] sm:text-[13.5px] truncate">{item.title}</div>
            <div className="font-pixel text-[11px] sm:text-xs text-gold mt-1">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
