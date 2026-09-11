import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef8f3',
          100: '#d6efe2',
          500: '#15803d',
          600: '#166534',
          700: '#14532d',
        },
        secondary: {
          500: '#b45309',
          600: '#92400e',
        },
        verifiedGreen: '#059669',
        surface: '#ffffff',
        brandText: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        telugu: ['var(--font-noto-telugu)', "'Suranna'", 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        badge: '9999px',
      },
      screens: {
        xs: '360px',
      },
    },
  },
  plugins: [],
};

export default config;
