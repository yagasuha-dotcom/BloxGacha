'use client';

import { formatRupiah } from '@/app/lib/utils';

type PoolItem = {
  id: string;
  item_name: string;
  chance: number;
  image_url?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  tierName: string;
  price: number;
  items: PoolItem[];
};

export default function TierInfoModal({ open, onClose, tierName, price, items }: Props) {
  if (!open) return null;

  const totalChance = items.reduce((sum, i) => sum + i.chance, 0);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 flex justify-between items-center">
          <div>
            <div className="font-bold text-base">{tierName}</div>
            <div className="text-xs text-text-dim mt-0.5">{formatRupiah(price)} per gacha</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-2 flex items-center justify-center text-lg">
            ×
          </button>
        </div>

        <div className="p-5">
          <div className="text-xs text-text-dim mb-3">
            Peluang mendapatkan setiap item ditampilkan di bawah ini. Total peluang: {totalChance.toFixed(2)}%.
          </div>

          {items.length === 0 ? (
            <div className="text-center py-10 text-text-dim text-sm">
              Belum ada item di pool ini. Admin belum menambahkan stok.
            </div>
          ) : (
            <div className="space-y-2">
              {items
                .slice()
                .sort((a, b) => a.chance - b.chance)
                .map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-surface-2 rounded-lg p-3">
                    <div className="w-10 h-10 rounded-md bg-bg border border-border shrink-0 flex items-center justify-center text-[9px] text-text-dim overflow-hidden">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                      ) : (
                        'IMG'
                      )}
                    </div>
                    <div className="flex-1 text-sm font-medium truncate">{item.item_name}</div>
                    <div className="font-pixel text-[11px] text-accent">{item.chance}%</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
