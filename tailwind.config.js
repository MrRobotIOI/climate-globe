/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        threat: {
          high: '#ff4444',
          medium: '#ff8844',
          low: '#ffaa44',
        },
        defense: {
          high: '#44ff88',
          medium: '#44ddaa',
          low: '#44aadd',
        },
      },
    },
  },
  plugins: [],
}
