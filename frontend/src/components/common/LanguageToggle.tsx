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
      className={`inline-flex items-center rounded-full bg-[#F5F1EA] p-0.5 border border-[#E8E2D9] text-xs font-medium ${className}`}
    >
      <button
        type="button"
        onClick={() => handleLanguageSwitch('en')}
        className={`px-3 py-1 rounded-full transition-all duration-200 text-xs font-semibold ${
          currentLocale === 'en'
            ? 'bg-[#191512] text-[#FAF8F5] shadow-sm'
            : 'text-[#574F48] hover:text-[#191512]'
        }`}
        aria-pressed={currentLocale === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => handleLanguageSwitch('te')}
        className={`px-3 py-1 rounded-full transition-all duration-200 text-xs font-medium font-telugu ${
          currentLocale === 'te'
            ? 'bg-[#191512] text-[#FAF8F5] shadow-sm'
            : 'text-[#574F48] hover:text-[#191512]'
        }`}
        aria-pressed={currentLocale === 'te'}
      >
        తెలుగు
      </button>
    </div>
  );
}
