/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkbg: "#0B0F19",
        sidebar: "#0D1322",
        darkcard: "#131B2E",
        darkborder: "#1E293B",
        brandblue: "#3B82F6",
        brandpurple: "#8B5CF6",
      }
    },
  },
  plugins: [],
}
