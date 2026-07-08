'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { createClient } from '@/app/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/app/lib/utils';
import type { GachaCurrencyTier, GachaCurrencyRange } from '@/app/lib/types';

type Props = {
  gameId: string;
  initialTiers: GachaCurrencyTier[];
  initialRanges: GachaCurrencyRange[];
};

export default function CurrencyTierPanel({ gameId, initialTiers, initialRanges }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [tiers, setTiers] = useState(initialTiers);
  const [ranges, setRanges] = useState(initialRanges);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [showNewTier, setShowNewTier] = useState(false);
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAddTier() {
    if (!name.trim() || !label.trim() || !price) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('gacha_currency_tiers')
      .insert({ game_id: gameId, name: name.trim(), currency_label: label.trim(), price: parseFloat(price) })
      .select()
      .single();
    setSaving(false);
    if (error) {
      showToast('Gagal menambah tier: ' + error.message, 'error');
      return;
    }
    setTiers([...tiers, data as GachaCurrencyTier]);
    setName('');
    setLabel('');
    setPrice('');
    setShowNewTier(false);
    router.refresh();
  }

  async function handleDeleteTier(id: string) {
    if (!confirm('Hapus tier currency ini?')) return;
    const { error } = await supabase.from('gacha_currency_tiers').delete().eq('id', id);
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error');
      return;
    }
    setTiers(tiers.filter((t) => t.id !== id));
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">💎 Tier Gacha Currency</h2>
        <button onClick={() => setShowNewTier(!showNewTier)} className="text-xs font-bold text-accent">
          + Tambah Tier
        </button>
      </div>

      {showNewTier && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Nama tier (Robux Tier A)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="sm:col-span-2 bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="text"
            placeholder="Label currency (Robux)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="number"
            placeholder="Harga (Rp)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={handleAddTier}
            disabled={saving}
            className="sm:col-span-4 px-4 py-2.5 rounded-lg bg-accent text-[#062119] font-bold text-sm disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      )}

      {tiers.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-8 text-center text-text-dim text-sm">
          Belum ada tier currency untuk game ini.
        </div>
      ) : (
        <div className="space-y-2">
          {tiers.map((tier) => {
            const tierRanges = ranges.filter((r) => r.tier_id === tier.id);
            const totalChance = tierRanges.reduce((sum, r) => sum + Number(r.chance), 0);
            const isExpanded = expandedTier === tier.id;

            return (
              <div key={tier.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="p-4 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setExpandedTier(isExpanded ? null : tier.id)}
                    className="flex-1 text-left flex items-center gap-3 min-w-0"
                  >
                    <span className="text-text-dim text-xs">{isExpanded ? '▼' : '▶'}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">
                        {tier.name} <span className="text-text-dim font-normal">({tier.currency_label})</span>
                      </div>
                      <div className="text-xs text-text-dim">
                        {formatRupiah(tier.price)} · {tierRanges.length} range ·{' '}
                        <span className={totalChance === 100 ? 'text-accent' : 'text-gold'}>{totalChance.toFixed(1)}% total</span>
                      </div>
                    </div>
                  </button>
                  <button onClick={() => handleDeleteTier(tier.id)} className="text-danger text-xs font-bold shrink-0">
                    Hapus
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4">
                    <RangeManager
                      tierId={tier.id}
                      currencyLabel={tier.currency_label}
                      ranges={tierRanges}
                      onRangesChange={(newRanges) => {
                        setRanges([...ranges.filter((r) => r.tier_id !== tier.id), ...newRanges]);
                        router.refresh();
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RangeManager({
  tierId,
  currencyLabel,
  ranges,
  onRangesChange,
}: {
  tierId: string;
  currencyLabel: string;
  ranges: GachaCurrencyRange[];
  onRangesChange: (ranges: GachaCurrencyRange[]) => void;
}) {
  const supabase = createClient();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [chance, setChance] = useState('');
  const [saving, setSaving] = useState(false);

  const totalChance = ranges.reduce((sum, r) => sum + Number(r.chance), 0);

  async function handleAdd() {
    if (!min || !max || !chance) return;
    const chanceNum = parseFloat(chance);
    if (totalChance + chanceNum > 100) {
      showToast(`Total chance akan menjadi ${(totalChance + chanceNum).toFixed(1)}%. Tidak boleh melebihi 100%.`, 'error');
      return;
    }
    if (parseInt(min, 10) > parseInt(max, 10)) {
      showToast('Nilai minimum tidak boleh lebih besar dari maksimum.', 'error');
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from('gacha_currency_ranges')
      .insert({ tier_id: tierId, min_amount: parseInt(min, 10), max_amount: parseInt(max, 10), chance: chanceNum })
      .select()
      .single();
    setSaving(false);

    if (error) {
      showToast('Gagal menyimpan range: ' + error.message, 'error');
      return;
    }

    onRangesChange([...ranges, data as GachaCurrencyRange]);
    setMin('');
    setMax('');
    setChance('');
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus range ini?')) return;
    const { error } = await supabase.from('gacha_currency_ranges').delete().eq('id', id);
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error');
      return;
    }
    onRangesChange(ranges.filter((r) => r.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold text-text-dim">
          Sisa chance tersedia: <span className="text-accent">{(100 - totalChance).toFixed(1)}%</span>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="text-xs font-bold text-accent">
          + Tambah Range
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-2 rounded-lg p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="number"
            placeholder={`Min ${currencyLabel}`}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="number"
            placeholder={`Max ${currencyLabel}`}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Chance %"
            value={chance}
            onChange={(e) => setChance(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-accent text-[#062119] font-bold text-sm disabled:opacity-50"
          >
            {saving ? '...' : 'Simpan'}
          </button>
        </div>
      )}

      {ranges.length === 0 ? (
        <div className="text-center py-6 text-text-dim text-xs">Belum ada range untuk tier ini.</div>
      ) : (
        <div className="space-y-1.5">
          {ranges.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 bg-surface-2 rounded-lg px-3.5 py-2.5">
              <div className="text-sm font-medium">
                {r.min_amount}–{r.max_amount} {currencyLabel}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-pixel text-[10px] text-accent">{r.chance}%</span>
                <button onClick={() => handleDelete(r.id)} className="text-danger text-xs font-bold">
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
