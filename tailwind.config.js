/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        racing: ['"racing sans one"'],
      },
      keyframes: {
        leftToRight: {
          '0%': { left: -1000 },
          '100%': { left: 0 }
        }
      }
    },

  },
  plugins: [],
}

