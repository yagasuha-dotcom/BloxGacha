export default function Footer() {
  return (
    <footer className="border-t border-border py-10 mt-5 pb-28 sm:pb-10">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-5 flex justify-between items-center flex-wrap gap-4">
        <div className="text-text-dim text-xs">
          © BloxGacha 2026. Semua transaksi final setelah box dibuka.
        </div>
        <div className="flex gap-2.5">
          <a href="#" aria-label="Discord" className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center hover:border-accent transition-colors text-text-dim">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.3 4.4A18 18 0 0 0 15.6 3l-.3.6a13 13 0 0 1 4 1.8 15.7 15.7 0 0 0-13.8 0 13 13 0 0 1 4-1.8L9.2 3a18 18 0 0 0-4.7 1.4C1.6 8.7 1 12.9 1.2 17a17.7 17.7 0 0 0 5.3 2.6l.8-1.3a11 11 0 0 1-1.8-.8l.4-.3a12.6 12.6 0 0 0 10.2 0l.4.3a11 11 0 0 1-1.8.9l.8 1.2A17.7 17.7 0 0 0 21 17c.3-4.6-.9-8.8-3.6-12.6ZM8.6 14.5c-.9 0-1.7-.9-1.7-1.9 0-1.1.7-2 1.7-2s1.7.9 1.7 2c0 1-.8 1.9-1.7 1.9Zm6.8 0c-.9 0-1.7-.9-1.7-1.9 0-1.1.8-2 1.7-2 1 0 1.7.9 1.7 2 0 1-.7 1.9-1.7 1.9Z" />
            </svg>
          </a>
          <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center hover:border-accent transition-colors text-text-dim">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
            </svg>
          </a>
          <a href="#" aria-label="Email" className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center hover:border-accent transition-colors text-text-dim">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M3.5 6l8.5 6.5L20.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
