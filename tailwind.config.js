/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{tsx,ts}",
    "./components/**/*.{tsx,ts}",
    "./lib/**/*.{tsx,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'neo-base': '#e0e5ec', // Light mode base (not used in dark neo but good to have)
        'neo-dark': '#1e293b', // Slate-800, good base for dark neo
        'neo-dark-shadow-light': '#2d3d56', // Lighter shadow for top-left
        'neo-dark-shadow-dark': '#0f151e', // Darker shadow for bottom-right
      },
      boxShadow: {
        'neo-flat': '8px 8px 16px #0f151e, -8px -8px 16px #2d3d56',
        'neo-pressed': 'inset 8px 8px 16px #0f151e, inset -8px -8px 16px #2d3d56',
        'neo-convex': '8px 8px 16px #0f151e, -8px -8px 16px #2d3d56', // convex is similar to flat but usually rounded
        'neo-sm': '4px 4px 8px #0f151e, -4px -4px 8px #2d3d56', // smaller shadow for smaller elements
      }
    },
  },
  plugins: [],
}

