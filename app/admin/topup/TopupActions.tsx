'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { useRouter } from 'next/navigation';

export default function TopupActions({ requestId, userId, amount }: { requestId: string; userId: string; amount: number }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(action);
    try {
      const res = await fetch('/api/admin/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, userId, amount, action }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Gagal memproses permintaan.');
      }
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Terjadi kesalahan.', 'error');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => handleAction('approve')}
        disabled={loading !== null}
        className="px-3.5 py-1.5 rounded-lg bg-accent text-[#062119] text-xs font-bold disabled:opacity-50"
      >
        {loading === 'approve' ? 'Memproses...' : 'Setujui'}
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={loading !== null}
        className="px-3.5 py-1.5 rounded-lg border border-danger/50 text-danger text-xs font-bold disabled:opacity-50"
      >
        {loading === 'reject' ? 'Memproses...' : 'Tolak'}
      </button>
    </div>
  );
}
