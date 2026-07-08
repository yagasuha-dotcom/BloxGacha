'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase-client';
import { generateUniqueCode } from '@/app/lib/utils';
import { useToast } from '@/app/components/ToastProvider';
import type { PaymentMethod } from '@/app/lib/types';

export default function TopupStepTwo({ amount, method }: { amount: number; method: PaymentMethod }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uniqueCode] = useState(generateUniqueCode());
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!file) {
      showToast('Upload bukti transfer terlebih dahulu.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        showToast('Sesi login berakhir, silakan masuk kembali.', 'error');
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
        amount,
        unique_code: uniqueCode,
        proof_image_url: urlData.publicUrl,
        payment_method_id: method.id,
        status: 'pending',
      });
      if (insertError) throw insertError;

      setDone(true);
      showToast('Permintaan top up berhasil dikirim!', 'success');
      setTimeout(() => router.push('/topup'), 1500);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengirim permintaan top up.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-surface border border-accent/40 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/15 flex items-center justify-center">
          <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="font-bold mb-1">Permintaan top up terkirim</div>
        <div className="text-text-dim text-sm">Mengalihkan ke halaman top up...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Detail rekening/akun tujuan */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0 overflow-hidden">
            {method.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={method.logo_url} alt={method.name} className="w-full h-full object-contain p-1.5" />
            ) : (
              <span className="text-[10px] text-text-dim font-bold">{method.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="font-bold text-base">{method.name}</div>
        </div>

        {method.account_number && (
          <div className="bg-surface-2 rounded-lg p-3.5 mb-3">
            <div className="text-[11px] text-text-dim mb-1">Nomor Tujuan</div>
            <div className="font-pixel text-sm text-text tracking-wide">{method.account_number}</div>
          </div>
        )}
        {method.account_name && (
          <div className="bg-surface-2 rounded-lg p-3.5 mb-3">
            <div className="text-[11px] text-text-dim mb-1">Atas Nama</div>
            <div className="text-sm font-semibold">{method.account_name}</div>
          </div>
        )}
        {method.instructions && (
          <div className="text-xs text-text-dim mt-2 leading-relaxed">{method.instructions}</div>
        )}
      </div>

      {/* Kode unik */}
      <div className="bg-surface border border-gold/30 rounded-2xl p-4 sm:p-5">
        <div className="text-xs text-text-dim mb-1.5">Cantumkan kode ini di keterangan/berita transfer:</div>
        <div className="font-pixel text-base text-gold">{uniqueCode}</div>
      </div>

      {/* Upload bukti */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
        <label className="text-xs font-bold text-text-dim mb-2 block">Upload bukti transfer</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-text-dim file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:bg-accent file:text-[#062119] file:font-bold file:text-xs"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3 rounded-lg bg-accent text-[#062119] font-bold text-sm disabled:opacity-50 hover:brightness-110 transition-all"
      >
        {submitting ? 'Mengirim...' : 'Kirim Bukti Transfer'}
      </button>
    </div>
  );
}
