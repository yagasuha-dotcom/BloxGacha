'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { createClient } from '@/app/lib/supabase-client';
import { useRouter } from 'next/navigation';
import type {
  Game,
  GachaAccountTier,
  GachaAccountItem,
  GachaCurrencyTier,
  GachaCurrencyRange,
} from '@/app/lib/types';
import AccountTierPanel from './AccountTierPanel';
import CurrencyTierPanel from './CurrencyTierPanel';

type Props = {
  initialGames: Game[];
  initialAccountTiers: GachaAccountTier[];
  initialAccountItems: GachaAccountItem[];
  initialCurrencyTiers: GachaCurrencyTier[];
  initialCurrencyRanges: GachaCurrencyRange[];
};

const COLOR_PRESETS = ['#FF6B4A', '#4A6CFF', '#E23E3E', '#4ADE80', '#8B5CF6', '#FFB84D'];

export default function GameManager({
  initialGames,
  initialAccountTiers,
  initialAccountItems,
  initialCurrencyTiers,
  initialCurrencyRanges,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [games, setGames] = useState(initialGames);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(initialGames[0]?.id ?? null);
  const [showNewGame, setShowNewGame] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [newGameColor, setNewGameColor] = useState(COLOR_PRESETS[0]);
  const [saving, setSaving] = useState(false);

  async function handleAddGame() {
    if (!newGameName.trim()) return;
    setSaving(true);
    const slug = newGameName.trim().toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
      .from('games')
      .insert({ name: newGameName.trim(), slug, color_theme: newGameColor, sort_order: games.length })
      .select()
      .single();
    setSaving(false);
    if (error) {
      showToast('Gagal menambah game: ' + error.message, 'error');
      return;
    }
    setGames([...games, data as Game]);
    setSelectedGameId(data.id);
    setNewGameName('');
    setShowNewGame(false);
    router.refresh();
  }

  async function handleDeleteGame(id: string) {
    if (!confirm('Hapus game ini beserta semua tier & item di dalamnya? Tindakan ini tidak bisa dibatalkan.')) return;
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error');
      return;
    }
    setGames(games.filter((g) => g.id !== id));
    if (selectedGameId === id) setSelectedGameId(games[0]?.id ?? null);
    router.refresh();
  }

  const selectedGame = games.find((g) => g.id === selectedGameId);

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-1">Game &amp; Tier Gacha</h1>
      <p className="text-text-dim text-sm mb-6">Kelola game, tier akun, item pool, dan chance rate.</p>

      {/* GAME TABS */}
      <div className="flex gap-2 flex-wrap mb-6 items-center">
        {games.map((g) => (
          <div key={g.id} className="relative group">
            <button
              onClick={() => setSelectedGameId(g.id)}
              className={`px-3.5 py-2 rounded-lg text-sm font-bold border transition-colors ${
                selectedGameId === g.id ? 'bg-accent text-[#062119] border-accent' : 'border-border text-text-dim hover:text-text'
              }`}
            >
              {g.name}
            </button>
            <button
              onClick={() => handleDeleteGame(g.id)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-danger text-white text-[9px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              title="Hapus game"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => setShowNewGame(!showNewGame)}
          className="px-3.5 py-2 rounded-lg text-sm font-bold border border-dashed border-border text-text-dim hover:text-text"
        >
          + Game Baru
        </button>
      </div>

      {showNewGame && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            placeholder="Nama game (misal: Free Fire)"
            value={newGameName}
            onChange={(e) => setNewGameName(e.target.value)}
            className="flex-1 w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <div className="flex gap-1.5">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => setNewGameColor(c)}
                className={`w-7 h-7 rounded-md border-2 ${newGameColor === c ? 'border-white' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <button
            onClick={handleAddGame}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-accent text-[#062119] font-bold text-sm disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      )}

      {!selectedGame ? (
        <div className="border border-dashed border-border rounded-xl py-12 text-center text-text-dim text-sm">
          Belum ada game. Tambahkan game pertama untuk mulai mengatur tier gacha.
        </div>
      ) : (
        <div className="space-y-8">
          <AccountTierPanel
            gameId={selectedGame.id}
            initialTiers={initialAccountTiers.filter((t) => t.game_id === selectedGame.id)}
            initialItems={initialAccountItems}
          />
          <CurrencyTierPanel
            gameId={selectedGame.id}
            initialTiers={initialCurrencyTiers.filter((t) => t.game_id === selectedGame.id)}
            initialRanges={initialCurrencyRanges}
          />
        </div>
      )}
    </div>
  );
}
