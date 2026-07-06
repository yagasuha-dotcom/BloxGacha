import Link from 'next/link';
import type { Game } from '@/app/lib/types';

export default function GameCard({ game, tierCount = 0 }: { game: Game; tierCount?: number }) {
  return (
    <Link
      href={`/gacha/${game.slug}`}
      className="group bg-surface border border-border rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform"
      style={{ borderColor: undefined }}
    >
      <div
        className="h-20 sm:h-[100px] flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${game.color_theme} 0%, rgba(0,0,0,0.4) 100%)` }}
      >
        <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-xl bg-black/35 border-2 border-white/15 flex items-center justify-center font-pixel text-[10px] sm:text-[11px]">
          {/* GANTI: <img src={game.logo_url} alt={game.name} className="w-full h-full object-cover rounded-xl" /> */}
          {game.name.slice(0, 2).toUpperCase()}
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="font-bold text-[13.5px] sm:text-[15px]">{game.name}</div>
        <div className="text-[11px] sm:text-xs text-text-dim mt-0.5">{tierCount} tier tersedia</div>
      </div>
    </Link>
  );
}
