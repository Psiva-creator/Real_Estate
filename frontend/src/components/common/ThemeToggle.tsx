'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { Locale } from '@/lib/i18n';

interface ThemeToggleProps {
  locale?: Locale;
  className?: string;
}

export default function ThemeToggle({ locale = 'en', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isTe = locale === 'te';
  const isDark = theme === 'dark';

  const label = isDark
    ? isTe
      ? 'లైట్ థీమ్‌కు మార్చండి'
      : 'Switch to Light Theme'
    : isTe
    ? 'డార్క్ థీమ్‌కు మార్చండి'
    : 'Switch to Dark Theme';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      aria-pressed={isDark}
      className={`relative p-2.5 rounded-full border border-[#E8E2D9] bg-white hover:bg-[#F5F1EA] text-[#574F48] hover:text-[#191512] transition-all duration-200 flex items-center justify-center shadow-xs group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8C653E] ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#C5A880] group-hover:text-[#D4A977] transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#8C653E] group-hover:text-[#191512] transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}
