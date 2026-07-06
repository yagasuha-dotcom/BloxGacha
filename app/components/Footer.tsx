export default function Footer() {
  return (
    <footer className="border-t border-border py-10 mt-5">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-5 flex justify-between items-center flex-wrap gap-4">
        <div className="text-text-dim text-xs">
          © BloxGacha 2026. Semua transaksi final setelah box dibuka.
        </div>
        <div className="flex gap-2.5">
          <a href="#" aria-label="Discord" className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-sm hover:border-accent transition-colors">💬</a>
          <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-sm hover:border-accent transition-colors">📷</a>
          <a href="#" aria-label="Email" className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-sm hover:border-accent transition-colors">✉️</a>
        </div>
      </div>
    </footer>
  );
}
