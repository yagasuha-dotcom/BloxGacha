import type { GachaTransaction, Profile } from '@/app/lib/types';
import { formatRupiah, formatDateTime } from '@/app/lib/utils';

export function Leaderboard({ users }: { users: Pick<Profile, 'id' | 'username' | 'avatar_url' | 'total_gacha_count'>[] }) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-4 sm:px-[18px] py-4 border-b border-border font-bold text-sm flex items-center gap-2">
        🏆 Top Pembuka Gacha
      </div>
      {users.length === 0 ? (
        <div className="py-10 px-5 text-center text-text-dim text-[13px]">
          <div className="text-[28px] mb-2.5 opacity-50">🎯</div>
          Belum ada yang membuka gacha.<br />Jadilah yang pertama masuk papan peringkat.
        </div>
      ) : (
        users.map((u, i) => (
          <div key={u.id} className="flex items-center gap-3 px-4 sm:px-[18px] py-3 border-b border-border last:border-b-0 text-[13.5px]">
            <div className="w-6 h-6 rounded-md bg-surface-2 flex items-center justify-center text-[11px] font-extrabold text-text-dim shrink-0">
              {i + 1}
            </div>
            <div className="w-[30px] h-[30px] rounded-lg bg-surface-2 border border-border shrink-0 overflow-hidden">
              {u.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 font-semibold truncate">{u.username}</div>
            <div className="font-pixel text-[10px] text-accent">{u.total_gacha_count}x</div>
          </div>
        ))
      )}
    </div>
  );
}

export function LiveFeed({ transactions }: { transactions: GachaTransaction[] }) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-4 sm:px-[18px] py-4 border-b border-border font-bold text-sm flex items-center gap-2">
        <span className="w-[7px] h-[7px] rounded-full bg-danger animate-pulse" />
        Live — Transaksi Terbaru
      </div>
      {transactions.length === 0 ? (
        <div className="py-10 px-5 text-center text-text-dim text-[13px]">
          <div className="text-[28px] mb-2.5 opacity-50">📡</div>
          Belum ada transaksi.<br />Setiap pembelian akan muncul di sini secara real-time.
        </div>
      ) : (
        transactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 px-4 sm:px-[18px] py-3 border-b border-border last:border-b-0 text-[13px]">
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border shrink-0 overflow-hidden">
              {tx.profiles?.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tx.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">{tx.profiles?.username ?? 'Pengguna'}</div>
              <div className="text-xs text-text-dim truncate">
                membuka {tx.tier_name} → dapat {tx.result_name} · {formatDateTime(tx.created_at)}
              </div>
            </div>
            <div className="font-pixel text-[11px] text-gold whitespace-nowrap">{formatRupiah(tx.price_paid)}</div>
          </div>
        ))
      )}
    </div>
  );
}
