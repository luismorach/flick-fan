module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        racing: ['"Racing Sans One"', 'sans-serif'],
      },
      screens: {
        'xs': '420px',
      },
      colors:{
        'primary': '#E50914',
        'surface': '#E5E2E1',
        'surface-variant':'#E9BCB6'
      }
    },
  },
  plugins: [],
};