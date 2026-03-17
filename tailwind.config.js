/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./frontend/**/*.{html,js}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2D3B2D",
        "background-light": "#F5F2EE",
        "background-dark": "#112111",
        "surface": "#ffffff",
        "surface-dark": "#1a261a",
        "text-main": "#1A1412",
        "text-main-dark": "#f5f2ee",
        "muted": "#8A837E",
        "muted-dark": "#a39b95",
        "accent": "#ec5b13",
      },
      fontFamily: {
        "display": ["Public Sans", "sans-serif"],
        "serif": ["Playfair Display", "serif"]
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "input": "6px",
        "btn": "12px",
        "card": "16px",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
