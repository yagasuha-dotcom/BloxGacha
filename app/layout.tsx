import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BloxGacha',
  description: 'Gacha akun & currency game — Free Fire, Mobile Legends, Roblox, Growtopia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="grid-bg" />
        <div className="relative z-[1]">{children}</div>
      </body>
    </html>
  );
}
