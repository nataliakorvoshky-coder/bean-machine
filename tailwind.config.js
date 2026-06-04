/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}', // Include all your page and component paths
    './components/**/*.{js,ts,jsx,tsx}', // Make sure to include this as well
  ],
  theme: {
    extend: {

      keyframes: {

  softPulse: {

    '0%, 100%': {

      boxShadow:
        '0 0 0 rgba(16,185,129,0)'
    },

    '50%': {

      boxShadow:
        '0 0 18px rgba(16,185,129,0.12)'
    },
  },
},

animation: {

  'soft-pulse':
    'softPulse 2.5s ease-in-out infinite',
},
      colors: {
        platinum: "#E5E4E2", // Bean - Platinum
        sapphire: "#0F52BA", // Coffee - Sapphire
        petalforest: "#F3C6B1", // Latte - Petal Forest
        seagreen: "#2E8B57", // Mocha - Sea Green
        amber: "#FFBF00", // Iced Coffee - Amber
        electricblue: "#7DF9FF", // Cappuccino - Electric Blue
        rose: "#FF007F", // Macchiato - Rose
        lilac: "#C8A2C8", // Frappuccino - Lilac
        royalgold: "#FFD700", // Croissant - Royal Gold
      },
    },
  },
  plugins: [],
};