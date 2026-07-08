'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { createClient } from '@/app/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/app/lib/utils';
import type { Game, MarketplaceListing } from '@/app/lib/types';

export default function MarketplaceManager({ games, initialListings }: { games: Game[]; initialListings: MarketplaceListing[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [listings, setListings] = useState(initialListings);
  const [showForm, setShowForm] = useState(false);
  const [gameId, setGameId] = useState(games[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!gameId || !title.trim() || !price || !email.trim() || !password.trim()) {
      showToast('Lengkapi semua kolom wajib.', 'error');
      return;
    }

    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const filePath = `listings/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('listings').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('listings').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      const res = await fetch('/api/admin/marketplace-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price),
          images: imageUrl ? [imageUrl] : [],
          credentials: { email: email.trim(), password: password.trim() },
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Gagal menyimpan listing.');

      setListings([body.listing, ...listings]);
      setTitle('');
      setDescription('');
      setPrice('');
      setEmail('');
      setPassword('');
      setImageFile(null);
      setShowForm(false);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Terjadi kesalahan.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus listing ini?')) return;
    const { error } = await supabase.from('marketplace_listings').delete().eq('id', id);
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error');
      return;
    }
    setListings(listings.filter((l) => l.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-extrabold">Marketplace</h1>
        <button onClick={() => setShowForm(!showForm)} className="text-xs font-bold text-accent">
          + Tambah Listing
        </button>
      </div>
      <p className="text-text-dim text-sm mb-6">Kelola akun yang dijual dengan harga tetap (tanpa random).</p>

      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 space-y-3">
          <select
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          >
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Judul listing (misal: Akun GT Level 80 Full Vault)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <textarea
            placeholder="Deskripsi akun (opsional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
            rows={2}
          />
          <input
            type="number"
            placeholder="Harga (Rp)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-text-dim file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:bg-accent file:text-[#062119] file:font-bold file:text-xs"
          />
          <div className="text-[11px] text-text-dim">Kredensial di bawah akan dienkripsi dan hanya terlihat oleh pembeli setelah transaksi selesai.</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Email / Username akun"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="Password akun"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-accent text-[#062119] font-bold text-sm disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Listing'}
          </button>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-12 text-center text-text-dim text-sm">
          Belum ada listing. Tambahkan produk pertama.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {listings.map((item) => (
            <div key={item.id} className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="h-32 bg-surface-2 flex items-center justify-center text-text-dim text-xs overflow-hidden">
                {item.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  'Tanpa foto'
                )}
              </div>
              <div className="p-3.5">
                <div className="font-bold text-sm truncate">{item.title}</div>
                <div className="font-pixel text-[11px] text-gold mt-1.5">{formatRupiah(item.price)}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'available' ? 'bg-accent/20 text-accent' : 'bg-text-dim/20 text-text-dim'}`}>
                    {item.status === 'available' ? 'Tersedia' : item.status === 'sold' ? 'Terjual' : 'Disembunyikan'}
                  </span>
                  <button onClick={() => handleDelete(item.id)} className="text-danger text-xs font-bold">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
