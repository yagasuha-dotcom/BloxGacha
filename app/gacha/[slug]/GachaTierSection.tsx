'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TierCard from '@/app/components/TierCard';
import TierInfoModal from '@/app/components/TierInfoModal';
import GachaResultModal from '@/app/components/GachaResultModal';
import { formatRupiah } from '@/app/lib/utils';
import type { GachaAccountTier, GachaAccountItem, GachaCurrencyTier, GachaCurrencyRange } from '@/app/lib/types';

type Props = {
  gameName: string;
  accountTiers: GachaAccountTier[];
  accountItems: GachaAccountItem[];
  currencyTiers: GachaCurrencyTier[];
  currencyRanges: GachaCurrencyRange[];
};

export default function GachaTierSection({ gameName, accountTiers, accountItems, currencyTiers, currencyRanges }: Props) {
  const router = useRouter();
  const [modalTier, setModalTier] = useState<{ name: string; price: number; items: { id: string; item_name: string; chance: number; image_url?: string | null }[] } | null>(null);
  const [result, setResult] = useState<{ itemName: string; imageUrl?: string | null } | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  function openAccountInfo(tier: GachaAccountTier) {
    const items = accountItems
      .filter((i) => i.tier_id === tier.id && !i.is_claimed)
      .map((i) => ({ id: i.id, item_name: i.item_name, chance: i.chance, image_url: i.image_url }));
    setModalTier({ name: tier.name, price: tier.price, items });
  }

  function openCurrencyInfo(tier: GachaCurrencyTier) {
    const ranges = currencyRanges
      .filter((r) => r.tier_id === tier.id)
      .map((r) => ({
        id: r.id,
        item_name: `${r.min_amount}–${r.max_amount} ${tier.currency_label}`,
        chance: r.chance,
      }));
    setModalTier({ name: tier.name, price: tier.price, items: ranges });
  }

  async function handleOpenAccount(tierId: string) {
    setOpening(tierId);
    try {
      const res = await fetch('/api/gacha/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Gagal membuka gacha.');
      setResult({ itemName: body.result.itemName, imageUrl: body.result.imageUrl });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setOpening(null);
    }
  }

  async function handleOpenCurrency(tierId: string) {
    setOpening(tierId);
    try {
      const res = await fetch('/api/gacha/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Gagal membuka gacha.');
      setResult({ itemName: body.result.itemName });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setOpening(null);
    }
  }

  return (
    <>
      {/* GACHA AKUN */}
      <section className="py-8 sm:py-[52px]">
        <div className="mb-6">
          <div className="text-lg sm:text-xl font-extrabold">🎮 {gameName} — Pilih Tier</div>
        </div>

        {accountTiers.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl py-12 text-center text-text-dim text-sm">
            Belum ada tier akun untuk {gameName}. Tambahkan lewat Admin Panel.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {accountTiers.map((tier) => {
              const items = accountItems.filter((i) => i.tier_id === tier.id && !i.is_claimed);
              const stock = items.length;
              const minChance = items.length > 0 ? Math.min(...items.map((i) => i.chance)) : 100;
              return (
                <TierCard
                  key={tier.id}
                  name={tier.name}
                  price={tier.price}
                  stock={stock}
                  minChance={minChance}
                  imageUrl={tier.banner_image_url}
                  onInfo={() => openAccountInfo(tier)}
                  onOpen={() => handleOpenAccount(tier.id)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* GACHA CURRENCY */}
      {currencyTiers.length > 0 && (
        <section className="py-8 sm:py-[52px]">
          <div className="mb-6">
            <div className="text-lg sm:text-xl font-extrabold flex items-center gap-2.5">
              <span className="font-pixel text-[9px] text-bg bg-gold px-2 py-1.5 rounded">CURRENCY</span>
              Gacha Currency
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {currencyTiers.map((tier) => {
              const ranges = currencyRanges.filter((r) => r.tier_id === tier.id);
              const rangeLabel =
                ranges.length > 0
                  ? `${Math.min(...ranges.map((r) => r.min_amount))}–${Math.max(...ranges.map((r) => r.max_amount))} ${tier.currency_label}`
                  : 'Rentang belum diatur admin';
              return (
                <div key={tier.id} className="bg-surface border border-border rounded-2xl p-4 sm:p-5 flex gap-4 items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-surface-2 border border-border flex items-center justify-center font-pixel text-[9px] text-text-dim shrink-0">
                    {tier.currency_label.slice(0, 3).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px] sm:text-[15px] truncate">{tier.name}</div>
                    <div className="text-xs text-text-dim mt-0.5">{rangeLabel}</div>
                    <div className="font-pixel text-[11px] sm:text-xs text-accent mt-2">{formatRupiah(tier.price)}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openCurrencyInfo(tier)}
                      className="px-3 sm:px-4 py-2 rounded-lg border border-border text-xs sm:text-[13px] font-bold hover:-translate-y-0.5 transition-transform"
                    >
                      Info
                    </button>
                    <button
                      onClick={() => handleOpenCurrency(tier.id)}
                      disabled={opening === tier.id}
                      className="px-3 sm:px-4 py-2 rounded-lg bg-accent text-[#062119] text-xs sm:text-[13px] font-bold hover:brightness-110 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {opening === tier.id ? '...' : 'Buka'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {modalTier && (
        <TierInfoModal
          open={!!modalTier}
          onClose={() => setModalTier(null)}
          tierName={modalTier.name}
          price={modalTier.price}
          items={modalTier.items}
        />
      )}

      {result && (
        <GachaResultModal
          open={!!result}
          onClose={() => setResult(null)}
          itemName={result.itemName}
          imageUrl={result.imageUrl}
        />
      )}
    </>
  );
}
