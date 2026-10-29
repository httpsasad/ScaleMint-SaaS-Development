import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'ScaleMint | Manage TikTok Ad Accounts at Scale & Automated Funding',
  description: 'Enterprise advertising account orchestration and automated funding workflows for TikTok media agencies and high-velocity performance buyers.',
  keywords: [
    'TikTok ad accounts',
    'bulk ad accounts',
    'aged ad accounts',
    'ad funding workflows',
    'agency ad accounts',
    'media buying infrastructure'
  ],
  authors: [{ name: 'ScaleMint Technologies' }],
  openGraph: {
    title: 'ScaleMint | Manage TikTok Ad Accounts at Scale',
    description: 'Autonomous ad account management and liquidity distribution for enterprise TikTok media buyers.',
    siteName: 'ScaleMint',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full scroll-smooth dark`}>
      <body className="min-h-full flex flex-col bg-[#060913] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
