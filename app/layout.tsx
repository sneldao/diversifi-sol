import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { SolanaWalletProvider } from './components/WalletProvider';
import { NavWalletButton } from './components/NavWalletButton';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: {
    default: 'DiversiFi - AI Portfolio Guardian',
    template: '%s | DiversiFi',
  },
  description: 'AI-powered portfolio protection and yield optimization for digital assets. Real-time monitoring, risk assessment, and autonomous wealth management.',
  keywords: ['portfolio', 'crypto', 'solana', 'AI', 'wealth protection', 'DeFi', 'yield', 'trading'],
  authors: [{ name: 'DiversiFi' }],
  creator: 'DiversiFi',
  publisher: 'DiversiFi',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://diversifi-solana.vercel.app',
    siteName: 'DiversiFi',
    title: 'DiversiFi - AI Portfolio Guardian',
    description: 'AI-powered portfolio protection and yield optimization',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DiversiFi - AI Portfolio Guardian',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DiversiFi - AI Portfolio Guardian',
    description: 'AI-powered portfolio protection and yield optimization',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'icon',
      href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>',
    }
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} animated-gradient`}>
        <SolanaWalletProvider>
          <div className="min-h-screen">
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-emerald-500/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  <span className="text-white font-semibold text-lg">DiversiFi</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-live" />
                    Live
                  </div>
                  <NavWalletButton />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
