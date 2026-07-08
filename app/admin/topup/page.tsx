import { createClient } from '@/app/lib/supabase-server';
import { formatRupiah, formatDateTime } from '@/app/lib/utils';
import TopupActions from './TopupActions';
import type { TopupRequest } from '@/app/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminTopupPage() {
  const supabase = createClient();

  const { data: requests, error } = await supabase
    .from('topup_requests')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('TOPUP QUERY ERROR:', error);
  }

  const pending = ((requests as TopupRequest[]) ?? []).filter((r) => r.status === 'pending');
  const resolved = ((requests as TopupRequest[]) ?? []).filter((r) => r.status !== 'pending');

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-1">Verifikasi Top Up</h1>
      <p className="text-text-dim text-sm mb-6">Cocokkan nominal &amp; kode unik dengan bukti transfer sebelum menyetujui.</p>

      {error && (
        <div className="border border-danger/50 bg-danger/10 text-danger rounded-xl p-4 text-sm mb-6">
          Gagal memuat data: {error.message}
        </div>
      )}

      <h2 className="text-sm font-bold text-text-dim mb-3">Menunggu Verifikasi ({pending.length})</h2>
      {pending.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-8 text-center text-text-dim text-sm mb-8">
          Tidak ada permintaan top up yang menunggu.
        </div>
      ) : (
        <div className="space-y-3 mb-10">
          {pending.map((req) => (
            <div key={req.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={req.proof_image_url}
                alt="Bukti transfer"
                className="w-full sm:w-40 h-40 object-cover rounded-lg border border-border shrink-0"
              />
              <div className="flex-1">
                <div className="font-bold">{req.profiles?.username ?? 'Pengguna'}</div>
                <div className="text-lg font-extrabold text-gold mt-1">{formatRupiah(req.amount)}</div>
                <div className="text-xs text-text-dim mt-1">
                  Kode: <span className="font-pixel text-accent">{req.unique_code}</span> · {formatDateTime(req.created_at)}
                </div>
                <TopupActions requestId={req.id} userId={req.user_id} amount={req.amount} />
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-sm font-bold text-text-dim mb-3">Riwayat</h2>
      {resolved.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-8 text-center text-text-dim text-sm">
          Belum ada riwayat verifikasi.
        </div>
      ) : (
        <div className="space-y-2">
          {resolved.map((req) => (
            <div key={req.id} className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between gap-3 text-sm">
              <div>
                <span className="font-bold">{req.profiles?.username ?? 'Pengguna'}</span>{' '}
                <span className="text-text-dim">— {formatRupiah(req.amount)}</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${req.status === 'approved' ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'}`}>
                {req.status === 'approved' ? 'Disetujui' : 'Ditolak'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
