'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { useRouter } from 'next/navigation';
import TierCard from '@/app/components/TierCard';
import TierInfoModal from '@/app/components/TierInfoModal';
import GachaResultModal from '@/app/components/GachaResultModal';
import { IconGamepad } from '@/app/components/Icons';
import type { GachaAccountTier, GachaAccountItem } from '@/app/lib/types';

type Props = {
  gameName: string;
  accountTiers: GachaAccountTier[];
  accountItems: GachaAccountItem[];
};

export default function GachaAccountSection({ gameName, accountTiers, accountItems }: Props) {
  const { showToast } = useToast();
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
      showToast(err instanceof Error ? err.message : 'Terjadi kesalahan.', 'error');
    } finally {
      setOpening(null);
    }
  }

  return (
    <>
      <section className="py-8 sm:py-[52px]">
        <div className="mb-6">
          <div className="text-lg sm:text-xl font-extrabold flex items-center gap-2"><IconGamepad className="w-5 h-5 text-accent" /> {gameName} — Pilih Tier</div>
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
