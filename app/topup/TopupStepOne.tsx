'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PaymentMethod } from '@/app/lib/types';
import { useToast } from '@/app/components/ToastProvider';

const NOMINAL_OPTIONS = [10000, 25000, 50000, 100000, 250000, 500000];

export default function TopupStepOne({ paymentMethods }: { paymentMethods: PaymentMethod[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const finalAmount = amount ?? (customAmount ? parseInt(customAmount, 10) : 0);

  function handleContinue() {
    if (!finalAmount || finalAmount < 1000) {
      showToast('Masukkan nominal yang valid (minimal Rp 1.000).', 'error');
      return;
    }
    if (!selectedMethod) {
      showToast('Pilih metode pembayaran terlebih dahulu.', 'error');
      return;
    }
    router.push(`/topup/konfirmasi?amount=${finalAmount}&method=${selectedMethod}`);
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6">
      <div className="mb-6">
        <label className="text-xs font-bold text-text-dim mb-2 block">1. Pilih nominal</label>
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

      <div className="mb-6">
        <label className="text-xs font-bold text-text-dim mb-2 block">2. Pilih metode pembayaran</label>
        {paymentMethods.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg py-6 text-center text-text-dim text-xs">
            Belum ada metode pembayaran. Admin perlu menambahkan lewat Admin Panel.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {paymentMethods.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setSelectedMethod(pm.id)}
                className={`flex items-center gap-2.5 p-3 rounded-lg border transition-colors ${
                  selectedMethod === pm.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/40'
                }`}
              >
                <div className="w-9 h-9 rounded-md bg-surface-2 border border-border flex items-center justify-center shrink-0 overflow-hidden">
                  {pm.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pm.logo_url} alt={pm.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-[9px] text-text-dim font-bold">{pm.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-[13px] font-semibold truncate">{pm.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-3 rounded-lg bg-accent text-[#062119] font-bold text-sm hover:brightness-110 transition-all"
      >
        Lanjutkan
      </button>
    </div>
  );
}
