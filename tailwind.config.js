/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0d0618',
        'deep-night': '#1a0a2e',
        'spirit-blue': '#4169e1',
        'celestial-gold': '#ffd700',
        sakura: '#ffb7c5',
        jade: '#00a36c',
        'void-purple': '#7b2d8b',
      },
      fontFamily: {
        cinzel: ['"Cinzel Decorative"', 'serif'],
        noto: ['"Noto Sans JP"', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
