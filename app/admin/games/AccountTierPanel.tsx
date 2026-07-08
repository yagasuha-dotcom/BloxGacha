'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { IconGamepad } from '@/app/components/Icons';
import { createClient } from '@/app/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/app/lib/utils';
import type { GachaAccountTier, GachaAccountItem } from '@/app/lib/types';

type Props = {
  gameId: string;
  initialTiers: GachaAccountTier[];
  initialItems: GachaAccountItem[];
};

export default function AccountTierPanel({ gameId, initialTiers, initialItems }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [tiers, setTiers] = useState(initialTiers);
  const [items, setItems] = useState(initialItems);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [showNewTier, setShowNewTier] = useState(false);
  const [newTierName, setNewTierName] = useState('');
  const [newTierPrice, setNewTierPrice] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAddTier() {
    if (!newTierName.trim() || !newTierPrice) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('gacha_account_tiers')
      .insert({ game_id: gameId, name: newTierName.trim(), price: parseFloat(newTierPrice), sort_order: tiers.length })
      .select()
      .single();
    setSaving(false);
    if (error) {
      showToast('Gagal menambah tier: ' + error.message, 'error');
      return;
    }
    setTiers([...tiers, data as GachaAccountTier]);
    setNewTierName('');
    setNewTierPrice('');
    setShowNewTier(false);
    router.refresh();
  }

  async function handleDeleteTier(id: string) {
    if (!confirm('Hapus tier ini beserta semua item di dalamnya?')) return;
    const { error } = await supabase.from('gacha_account_tiers').delete().eq('id', id);
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
        <h2 className="text-sm font-bold flex items-center gap-2"><IconGamepad className="w-4 h-4 text-accent" /> Tier Gacha Akun</h2>
        <button
          onClick={() => setShowNewTier(!showNewTier)}
          className="text-xs font-bold text-accent"
        >
          + Tambah Tier
        </button>
      </div>

      {showNewTier && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Nama tier (misal: Magical Accounts)"
            value={newTierName}
            onChange={(e) => setNewTierName(e.target.value)}
            className="flex-1 bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="number"
            placeholder="Harga (Rp)"
            value={newTierPrice}
            onChange={(e) => setNewTierPrice(e.target.value)}
            className="w-full sm:w-40 bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={handleAddTier}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-accent text-[#062119] font-bold text-sm disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      )}

      {tiers.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-8 text-center text-text-dim text-sm mb-6">
          Belum ada tier akun untuk game ini.
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {tiers.map((tier) => {
            const tierItems = items.filter((i) => i.tier_id === tier.id);
            const totalChance = tierItems.reduce((sum, i) => sum + Number(i.chance), 0);
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
                      <div className="font-bold text-sm truncate">{tier.name}</div>
                      <div className="text-xs text-text-dim">
                        {formatRupiah(tier.price)} · {tierItems.length} item ·{' '}
                        <span className={totalChance === 100 ? 'text-accent' : 'text-gold'}>
                          {totalChance.toFixed(1)}% total chance
                        </span>
                      </div>
                    </div>
                  </button>
                  <button onClick={() => handleDeleteTier(tier.id)} className="text-danger text-xs font-bold shrink-0">
                    Hapus
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4">
                    <ItemManager
                      tierId={tier.id}
                      items={tierItems}
                      onItemsChange={(newItems) => {
                        setItems([...items.filter((i) => i.tier_id !== tier.id), ...newItems]);
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

function ItemManager({
  tierId,
  items,
  onItemsChange,
}: {
  tierId: string;
  items: GachaAccountItem[];
  onItemsChange: (items: GachaAccountItem[]) => void;
}) {
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [chance, setChance] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [saving, setSaving] = useState(false);

  const totalChance = items.reduce((sum, i) => sum + Number(i.chance), 0);

  async function handleAddItem() {
    if (!itemName.trim() || !chance || !email.trim() || !password.trim()) {
      showToast('Nama item, chance, email, dan password wajib diisi.', 'error');
      return;
    }
    const chanceNum = parseFloat(chance);
    if (totalChance + chanceNum > 100) {
      showToast(`Total chance akan menjadi ${(totalChance + chanceNum).toFixed(1)}%. Total tidak boleh melebihi 100%.`, 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/account-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId,
          itemName: itemName.trim(),
          chance: chanceNum,
          credentials: { email: email.trim(), password: password.trim(), extra_info: extraInfo.trim() },
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Gagal menyimpan item.');

      onItemsChange([...items, body.item]);
      setItemName('');
      setChance('');
      setEmail('');
      setPassword('');
      setExtraInfo('');
      setShowForm(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Terjadi kesalahan.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteItem(id: string) {
    if (!confirm('Hapus item ini dari pool?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('gacha_account_items').delete().eq('id', id);
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error');
      return;
    }
    onItemsChange(items.filter((i) => i.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold text-text-dim">
          Sisa chance tersedia: <span className="text-accent">{(100 - totalChance).toFixed(1)}%</span>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="text-xs font-bold text-accent">
          + Tambah Item / Akun
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-2 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nama item (misal: Akun Magical #001)"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Chance % (misal: 25)"
              value={chance}
              onChange={(e) => setChance(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="text-[11px] text-text-dim">Kredensial akun di bawah ini akan dienkripsi sebelum disimpan.</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Email / Username akun"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="Password akun"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <textarea
            placeholder="Info tambahan (opsional): level, item bawaan, dll"
            value={extraInfo}
            onChange={(e) => setExtraInfo(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
            rows={2}
          />
          <button
            onClick={handleAddItem}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-accent text-[#062119] font-bold text-sm disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Item'}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-6 text-text-dim text-xs">Belum ada item di pool ini.</div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 bg-surface-2 rounded-lg px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{item.item_name}</div>
                <div className="text-[11px] text-text-dim">
                  {item.chance}% · {item.is_claimed ? 'Sudah diklaim' : 'Tersedia'}
                </div>
              </div>
              <button onClick={() => handleDeleteItem(item.id)} className="text-danger text-xs font-bold shrink-0">
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
