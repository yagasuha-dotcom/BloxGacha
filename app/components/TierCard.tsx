'use client';

import { formatRupiah, rarityFromChance } from '@/app/lib/utils';

const RARITY_COLOR: Record<string, string> = {
  common: '#5B7083',
  rare: '#5EE6C5',
  epic: '#8B5CF6',
  legendary: '#FFB84D',
};

const RARITY_LABEL: Record<string, string> = {
  common: 'UMUM',
  rare: 'JARANG',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
};

type Props = {
  name: string;
  price: number;
  stock: number;
  minChance?: number; // chance item terendah dalam pool, dipakai untuk tentukan rarity badge tier
  imageUrl?: string | null;
  onInfo?: () => void;
  onOpen?: () => void;
};

export default function TierCard({ name, price, stock, minChance = 100, imageUrl, onInfo, onOpen }: Props) {
  const rarity = rarityFromChance(minChance);
  const color = RARITY_COLOR[rarity];
  const outOfStock = stock <= 0;

  return (
    <div
      className="bg-surface border rounded-2xl p-4 sm:p-[18px] relative overflow-hidden transition-all hover:-translate-y-1"
      style={{
        borderColor: `${color}59`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 0 0 1px ${color}, 0 8px 24px -8px ${color}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}59`;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-text-dim">
          <span className={`w-1.5 h-1.5 rounded-full ${outOfStock ? 'bg-danger' : 'bg-green-400'}`} />
          {outOfStock ? 'Belum ada stok' : `Stok: ${stock}`}
        </span>
        <span
          className="text-[10px] font-extrabold px-2.5 py-1 rounded-full"
          style={{ background: `${color}33`, color }}
        >
          {RARITY_LABEL[rarity]}
        </span>
      </div>

      <div className="h-28 sm:h-[130px] rounded-lg mb-3.5 bg-surface-2 border border-dashed border-border flex items-center justify-center text-text-dim text-[11px] text-center overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>Gambar tier<br/>(diisi dari admin)</span>
        )}
      </div>

      <div className="font-bold text-[15px] sm:text-base mb-1.5">{name}</div>
      <div className="font-pixel text-[11px] sm:text-[13px] mb-4" style={{ color }}>
        {formatRupiah(price)}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onInfo}
          className="flex-1 py-2 rounded-lg border border-border text-[13px] font-bold hover:-translate-y-0.5 transition-transform"
        >
          Info
        </button>
        <button
          onClick={onOpen}
          disabled={outOfStock}
          className="flex-1 py-2 rounded-lg bg-accent text-[#062119] text-[13px] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 hover:-translate-y-0.5 transition-all disabled:hover:translate-y-0 disabled:hover:brightness-100"
        >
          Buka
        </button>
      </div>
    </div>
  );
}
