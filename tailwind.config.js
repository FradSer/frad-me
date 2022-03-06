const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        pachino: "url('/img/pachino-background.png')",
      },
      fontFamily: {
        sans: ['GT Eesti Text Trial', ...defaultTheme.fontFamily.sans],
        mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
      },
      aspectRatio: {
        '100/62': '100 / 62',
        '100/31': '100 / 31',
      },
      gridTemplateColumns: {
        '16': 'repeat(16, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-15': 'span 15 / span 15',
        'span-16': 'span 16 / span 16',
      },
      maxWidth: {
        wrapper: '64rem',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
