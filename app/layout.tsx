import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/app/components/ToastProvider';
import BottomNav from '@/app/components/BottomNav';
import SplashScreen from '@/app/components/SplashScreen';

export const metadata: Metadata = {
  title: 'BloxGacha',
  description: 'Gacha akun & currency game — Free Fire, Mobile Legends, Roblox, Growtopia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="grid-bg" />
        <SplashScreen />
        <ToastProvider>
          <div className="relative z-[1]">{children}</div>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
