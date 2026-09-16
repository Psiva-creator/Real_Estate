import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Telugu } from 'next/font/google';
import '@/styles/globals.css';
import AppProviders from '@/components/providers/AppProviders';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-telugu',
});

export const metadata: Metadata = {
  title: {
    default: 'Telangana Realty Hub | 100% Verified Land & Flat Brokerage',
    template: '%s | Telangana Realty Hub',
  },
  description:
    'Telangana’s premier real estate mediator & brokerage. Connecting land & flat sellers with buyers across Hyderabad with 13-point revenue document verification, Dharani clearance, and end-to-end deal mediation.',
  keywords: [
    'Telangana real estate',
    'Hyderabad land brokerage',
    'HMDA approved plots',
    'Dharani passbook verified land',
    'Kokapet Neopolis flats',
    'Mokila villa plots',
    'Kollur ORR flats',
    'Shamshabad farm land',
    '13 document verification',
  ],
  authors: [{ name: 'Telangana Realty Advisory Team' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#14532d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full scroll-smooth ${inter.variable} ${notoSansTelugu.variable}`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-900 font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
