import { createClient } from '@/app/lib/supabase-server';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import type { Game, MarketplaceListing } from '@/app/lib/types';
import { formatRupiah } from '@/app/lib/utils';

export const dynamic = 'force-dynamic';

export default async function MarketplacePage({ searchParams }: { searchParams: { game?: string } }) {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  let balance = 0;
  if (userData?.user) {
    const { data: profile } = await supabase.from('profiles').select('balance').eq('id', userData.user.id).single();
    balance = profile?.balance ?? 0;
  }

  const { data: games } = await supabase.from('games').select('*').eq('is_active', true).order('sort_order');

  let query = supabase.from('marketplace_listings').select('*').eq('status', 'available').order('created_at', { ascending: false });
  if (searchParams.game) {
    const gameRow = (games as Game[] | null)?.find((g) => g.slug === searchParams.game);
    if (gameRow) query = query.eq('game_id', gameRow.id);
  }
  const { data: listings } = await query;

  return (
    <>
      <Navbar balance={balance} isLoggedIn={!!userData?.user} />

      <div className="max-w-[1180px] mx-auto px-3.5 sm:px-5">
        <section className="pt-8 sm:pt-10 pb-6">
          <h1 className="text-xl sm:text-3xl font-extrabold">Marketplace Akun</h1>
          <p className="text-text-dim text-sm mt-1">Lihat detail lengkap, pilih sendiri, harga pasti — tanpa random.</p>
        </section>

        {/* FILTER GAME */}
        <div className="flex gap-2 flex-wrap mb-6">
          <a
            href="/marketplace"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              !searchParams.game ? 'bg-accent text-[#062119] border-accent' : 'border-border text-text-dim hover:text-text'
            }`}
          >
            Semua
          </a>
          {(games as Game[] | null)?.map((g) => (
            <a
              key={g.id}
              href={`/marketplace?game=${g.slug}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                searchParams.game === g.slug ? 'bg-accent text-[#062119] border-accent' : 'border-border text-text-dim hover:text-text'
              }`}
            >
              {g.name}
            </a>
          ))}
        </div>

        <section className="pb-16">
          {!listings || listings.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl py-16 text-center text-text-dim text-sm">
              Belum ada listing akun{searchParams.game ? ' untuk game ini' : ''}. Tambahkan lewat Admin Panel.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {(listings as MarketplaceListing[]).map((item) => (
                <div key={item.id} className="bg-surface border border-border rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform">
                  <div className="h-28 sm:h-[130px] bg-surface-2 flex items-center justify-center text-text-dim text-[11px] border-b border-border overflow-hidden">
                    {item.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      'Foto akun'
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="font-bold text-[13.5px] sm:text-[15px] truncate">{item.title}</div>
                    {item.description && (
                      <div className="text-[11px] sm:text-xs text-text-dim mt-1 line-clamp-2">{item.description}</div>
                    )}
                    <div className="font-pixel text-[11px] sm:text-xs text-gold mt-2.5">{formatRupiah(item.price)}</div>
                    <button className="w-full mt-3 py-2 rounded-lg bg-accent text-[#062119] text-[13px] font-bold hover:brightness-110 transition-all">
                      Beli Sekarang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </>
  );
}
