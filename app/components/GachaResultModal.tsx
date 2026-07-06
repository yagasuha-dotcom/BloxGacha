'use client';

type Props = {
  open: boolean;
  onClose: () => void;
  itemName: string;
  imageUrl?: string | null;
};

export default function GachaResultModal({ open, onClose, itemName, imageUrl }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface border border-accent rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 0 40px -10px rgba(94,230,197,0.5)' }}
      >
        <div className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Selamat!</div>
        <div className="w-24 h-24 mx-auto rounded-xl bg-surface-2 border border-border mb-4 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={itemName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">🎉</span>
          )}
        </div>
        <div className="font-bold text-lg mb-1">{itemName}</div>
        <div className="text-text-dim text-xs mb-6">Item sudah masuk ke akunmu. Cek di halaman riwayat.</div>
        <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-accent text-[#062119] font-bold text-sm">
          Tutup
        </button>
      </div>
    </div>
  );
}
