/** @type {import('tailwindcss').Config} */
export default {
   darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#dc2626",      // Modern soft red (Tailwind red-600)
        "primary-dark": "#b91c1c", // Darker red for hover
        secondary: "#1e293b",    // Slate 800
        "secondary-light": "#334155", // Slate 700 
        accent: "#38bdf8",       // Sky blue
        background: "#f8fafc",   // Slate 50
        surface: "#ffffff",
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
    },
  },
  plugins: [],
}