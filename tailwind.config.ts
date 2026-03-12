import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#101010",
        foreground: "#f2f2ef",
        muted: "#a2a29d",
        border: "#2b2b2b",
        card: "#131313",
        accent: "#d0d0ca",
        accentSoft: "#191919"
      },
      fontFamily: {
        sans: ["Switzer", "sans-serif"],
        display: ["var(--font-antonio)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
