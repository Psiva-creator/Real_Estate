import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Telugu, Cormorant_Garamond } from 'next/font/google';
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

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
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
  openGraph: {
    title: 'Telangana Realty Hub | 100% Verified Land & Flat Brokerage',
    description:
      'Telangana’s premier real estate mediator & brokerage. 13-point revenue document verification, Dharani clearance, and end-to-end deal mediation in Hyderabad.',
    url: 'https://frontend-six-psi-ecroth2n1r.vercel.app',
    siteName: 'Telangana Realty Hub',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Telangana Realty Hub - 100% Legal Verification',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Telangana Realty Hub | 100% Verified Land & Flat Brokerage',
    description:
      '13-point revenue document verification and direct mediated land & flat brokerage across Hyderabad.',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#191512',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full scroll-smooth ${inter.variable} ${notoSansTelugu.variable} ${cormorantGaramond.variable}`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#191512] antialiased selection:bg-[#B9825A]/20 selection:text-[#191512] font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
