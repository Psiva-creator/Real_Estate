import React from 'react';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, LOCALES } from '@/lib/i18n';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import CookieConsent from '@/components/common/CookieConsent';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;

  return (
    <div className={`min-h-screen flex flex-col ${locale === 'te' ? 'font-telugu' : 'font-sans'}`}>
      <div className="print:hidden">
        <Navbar locale={locale} />
      </div>
      <main className="flex-1 w-full print:p-0">{children}</main>
      <div className="print:hidden">
        <Footer locale={locale} />
        <CookieConsent locale={locale} />
      </div>
    </div>
  );
}
