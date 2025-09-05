/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Make sure this is enabled for dark mode to work
  theme: {
    extend: {
      colors: {
        'ocean-blue-deep': 'rgb(59, 130, 246)', // The primary blue color
        'ocean-blue-light': 'rgb(96, 165, 250)', // A lighter shade for hover effects
      },
    },
  },
  plugins: [],
}