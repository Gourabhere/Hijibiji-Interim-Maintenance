/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{tsx,ts}",
    "./components/**/*.{tsx,ts}",
    "./lib/**/*.{tsx,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

