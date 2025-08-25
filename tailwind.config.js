const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-gt-eesti-text)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-fira-code)', ...defaultTheme.fontFamily.mono],
        display: [
          'var(--font-gt-eesti-display)',
          'var(--font-gt-eesti-text)',
          ...defaultTheme.fontFamily.sans,
        ],
      },
      fontWeight: {
        black: '700', // Map font-black to 700 (bold) since we don't have 900 weight
      },
      aspectRatio: {
        '100/62': '100 / 62',
        '100/31': '100 / 31',
      },
      gridTemplateColumns: {
        16: 'repeat(16, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-15': 'span 15 / span 15',
        'span-16': 'span 16 / span 16',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
