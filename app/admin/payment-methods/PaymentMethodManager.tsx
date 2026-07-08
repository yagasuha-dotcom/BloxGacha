'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/components/ToastProvider';
import { IconCreditCard } from '@/app/components/Icons';
import type { PaymentMethod } from '@/app/lib/types';

export default function PaymentMethodManager({ initialMethods }: { initialMethods: PaymentMethod[] }) {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [methods, setMethods] = useState(initialMethods);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!name.trim()) {
      showToast('Nama metode pembayaran wajib diisi.', 'error');
      return;
    }

    setSaving(true);
    try {
      let logoUrl: string | null = null;
      if (logoFile) {
        const filePath = `payment-logos/${Date.now()}-${logoFile.name}`;
        const { error: uploadError } = await supabase.storage.from('branding').upload(filePath, logoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('branding').getPublicUrl(filePath);
        logoUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          name: name.trim(),
          logo_url: logoUrl,
          account_number: accountNumber.trim() || null,
          account_name: accountName.trim() || null,
          instructions: instructions.trim() || null,
          sort_order: methods.length,
        })
        .select()
        .single();

      if (error) throw error;

      setMethods([...methods, data as PaymentMethod]);
      setName('');
      setAccountNumber('');
      setAccountName('');
      setInstructions('');
      setLogoFile(null);
      setShowForm(false);
      showToast('Metode pembayaran ditambahkan.', 'success');
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menambah metode pembayaran.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(method: PaymentMethod) {
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_active: !method.is_active })
      .eq('id', method.id);
    if (error) {
      showToast('Gagal mengubah status: ' + error.message, 'error');
      return;
    }
    setMethods(methods.map((m) => (m.id === method.id ? { ...m, is_active: !m.is_active } : m)));
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus metode pembayaran ini?')) return;
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error');
      return;
    }
    setMethods(methods.filter((m) => m.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-extrabold flex items-center gap-2.5">
          <IconCreditCard className="w-5 h-5 text-accent" />
          Metode Pembayaran
        </h1>
        <button onClick={() => setShowForm(!showForm)} className="text-xs font-bold text-accent">
          + Tambah Metode
        </button>
      </div>
      <p className="text-text-dim text-sm mb-6">Kelola logo, rekening/nomor tujuan, dan instruksi top up manual.</p>

      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 space-y-3">
          <input
            type="text"
            placeholder="Nama metode (misal: GoPay, QRIS, DANA)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Logo (upload sendiri, opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-text-dim file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:bg-accent file:text-[#062119] file:font-bold file:text-xs"
            />
          </div>
          <input
            type="text"
            placeholder="Nomor tujuan (nomor e-wallet / rekening)"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="text"
            placeholder="Atas nama"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <textarea
            placeholder="Instruksi tambahan (opsional)"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-accent text-[#062119] font-bold text-sm disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Metode'}
          </button>
        </div>
      )}

      {methods.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-12 text-center text-text-dim text-sm">
          Belum ada metode pembayaran. Tambahkan yang pertama.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {methods.map((m) => (
            <div key={m.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0 overflow-hidden">
                {m.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.logo_url} alt={m.name} className="w-full h-full object-contain p-1.5" />
                ) : (
                  <span className="text-[10px] text-text-dim font-bold">{m.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{m.name}</div>
                <div className="text-xs text-text-dim truncate">{m.account_number ?? 'Belum ada nomor tujuan'}</div>
              </div>
              <button
                onClick={() => handleToggleActive(m)}
                className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                  m.is_active ? 'bg-accent/20 text-accent' : 'bg-text-dim/20 text-text-dim'
                }`}
              >
                {m.is_active ? 'Aktif' : 'Nonaktif'}
              </button>
              <button onClick={() => handleDelete(m.id)} className="text-danger text-xs font-bold shrink-0">
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
