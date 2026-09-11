'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Locale } from '@/lib/i18n';

interface LanguageToggleProps {
  currentLocale: Locale;
  className?: string;
}

export default function LanguageToggle({ currentLocale, className = '' }: LanguageToggleProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageSwitch = (targetLocale: Locale) => {
    if (targetLocale === currentLocale) return;

    // Pathname might be "/en/properties" or "/te/properties" or "/en"
    let newPathname = pathname;
    if (pathname.startsWith('/en')) {
      newPathname = pathname.replace(/^\/en/, `/${targetLocale}`);
    } else if (pathname.startsWith('/te')) {
      newPathname = pathname.replace(/^\/te/, `/${targetLocale}`);
    } else {
      newPathname = `/${targetLocale}${pathname}`;
    }

    const query = typeof window !== 'undefined' ? window.location.search : '';
    const fullUrl = query ? `${newPathname}${query}` : newPathname;

    router.push(fullUrl);
  };

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 text-sm font-medium ${className}`}
    >
      <button
        type="button"
        onClick={() => handleLanguageSwitch('en')}
        className={`px-3 py-1.5 rounded-md transition-all duration-200 text-xs sm:text-sm font-semibold ${
          currentLocale === 'en'
            ? 'bg-white text-emerald-800 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        aria-pressed={currentLocale === 'en'}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => handleLanguageSwitch('te')}
        className={`px-3 py-1.5 rounded-md transition-all duration-200 text-xs sm:text-sm font-medium ${
          currentLocale === 'te'
            ? 'bg-emerald-700 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        aria-pressed={currentLocale === 'te'}
      >
        తెలుగు
      </button>
    </div>
  );
}
