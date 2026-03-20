export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
      },
      colors: {
        primary: { 50:'#edfff6', 100:'#d5ffec', 200:'#aeffda', 300:'#70ffc0', 400:'#2bffa0', 500:'#00e87d', 600:'#00c47d', 700:'#009a61', 800:'#00784d', 900:'#006340' },
        dark: { 900:'#080f1d', 800:'#0a1628', 700:'#0f2142', 600:'#162035', 500:'#1e2d45' },
      },
    },
  },
  plugins: [],
}
