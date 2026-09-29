import React from 'react';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, LOCALES } from '@/lib/i18n';
import SavedPropertiesClient from '@/components/properties/SavedPropertiesClient';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface SavedPropertiesPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: SavedPropertiesPageProps) {
  const isTe = params.locale === 'te';
  return {
    title: isTe
      ? 'భద్రపరిచిన ప్రాపర్టీలు | తెలంగాణ రియల్టీ హబ్'
      : 'Saved Properties | Telangana Realty Hub',
    description: isTe
      ? 'మీరు భద్రపరుచుకున్న ధృవీకరించిన భూములు, అపార్ట్‌మెంట్లు మరియు విల్లాలు.'
      : 'Review and manage your shortlisted verified properties across Hyderabad & Telangana.',
  };
}

export default function SavedPropertiesPage({ params }: SavedPropertiesPageProps) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;

  return <SavedPropertiesClient locale={locale} />;
}
