import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fdf8e7",
          100: "#faefc2",
          200: "#f5df8a",
          300: "#efcb4f",
          400: "#e6b422",
          500: "#d4a017",
          600: "#b07f10",
          700: "#8a5f10",
        },
        ink: { 900: "#050505", 800: "#0b0b0c", 700: "#141416", 600: "#1c1c1f", 500: "#2a2a2e" },
      },
      fontFamily: {
        display: ["'Playfair Display Variable'", "Georgia", "serif"],
        sans: ["'Inter Variable'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg,#f5df8a 0%,#d4a017 45%,#8a5f10 100%)",
      },
      boxShadow: { gold: "0 0 40px -8px rgba(212,160,23,.45)" },
    },
  },
  plugins: [],
};
export default config;
