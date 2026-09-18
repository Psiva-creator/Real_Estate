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
          50: '#f7f4ee',
          100: '#ede6da',
          500: '#8c653e',
          600: '#755231',
          700: '#5c4026',
          800: '#46301c',
          900: '#322214',
        },
        secondary: {
          500: '#a67c52',
          600: '#8c653e',
        },
        luxury: {
          ivory: '#FAF8F5',
          ivorySoft: '#F5F1EA',
          ivoryDark: '#EFE9E0',
          charcoal: '#191512',
          charcoalSoft: '#28231E',
          charcoalMuted: '#574F48',
          bronze: '#8C653E',
          bronzeLight: '#B9825A',
          bronzeGlow: '#C5A880',
          champagne: '#D8CFC4',
          border: '#E8E2D9',
          borderDark: '#2C2520',
          darkBg: '#141210',
          darkCard: '#1E1B18',
        },
        verifiedGreen: '#059669',
        surface: '#ffffff',
        brandText: {
          primary: '#191512',
          secondary: '#574F48',
          muted: '#8C827A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'Cambria', 'serif'],
        editorial: ['var(--font-cormorant)', 'Georgia', 'serif'],
        telugu: ['var(--font-noto-telugu)', "'Suranna'", 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '10px',
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
