'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase-client';
import { generateUniqueCode } from '@/app/lib/utils';

const NOMINAL_OPTIONS = [10000, 25000, 50000, 100000, 250000, 500000];

export default function TopupForm() {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uniqueCode] = useState(generateUniqueCode());
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = amount ?? (customAmount ? parseInt(customAmount, 10) : 0);

  async function handleSubmit() {
    if (!finalAmount || finalAmount < 1000) {
      setError('Masukkan nominal yang valid (minimal Rp 1.000).');
      return;
    }
    if (!file) {
      setError('Upload bukti transfer terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setError('Sesi login berakhir, silakan masuk kembali.');
        setSubmitting(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `topup-proofs/${userData.user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('proofs').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('topup_requests').insert({
        user_id: userData.user.id,
        amount: finalAmount,
        unique_code: uniqueCode,
        proof_image_url: urlData.publicUrl,
        status: 'pending',
      });
      if (insertError) throw insertError;

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim permintaan top up.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-surface border border-accent/40 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <div className="font-bold mb-1">Permintaan top up terkirim</div>
        <div className="text-text-dim text-sm">Admin akan memverifikasi bukti transfermu. Saldo ditambahkan setelah disetujui.</div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6">
      <div className="mb-5">
        <label className="text-xs font-bold text-text-dim mb-2 block">Pilih nominal</label>
        <div className="grid grid-cols-3 gap-2">
          {NOMINAL_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => {
                setAmount(n);
                setCustomAmount('');
              }}
              className={`py-2.5 rounded-lg text-[13px] font-bold border transition-colors ${
                amount === n ? 'bg-accent text-[#062119] border-accent' : 'border-border text-text hover:border-accent/50'
              }`}
            >
              Rp {n.toLocaleString('id-ID')}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Atau masukkan nominal lain"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setAmount(null);
          }}
          className="w-full mt-2.5 bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="mb-5 bg-surface-2 rounded-lg p-3.5">
        <div className="text-xs text-text-dim">Cantumkan kode ini di keterangan transfer:</div>
        <div className="font-pixel text-sm text-accent mt-1">{uniqueCode}</div>
      </div>

      <div className="mb-5">
        <label className="text-xs font-bold text-text-dim mb-2 block">Upload bukti transfer</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-text-dim file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:bg-accent file:text-[#062119] file:font-bold file:text-xs"
        />
      </div>

      {error && <div className="text-danger text-xs mb-4">{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3 rounded-lg bg-accent text-[#062119] font-bold text-sm disabled:opacity-50"
      >
        {submitting ? 'Mengirim...' : 'Kirim Permintaan Top Up'}
      </button>
    </div>
  );
}
