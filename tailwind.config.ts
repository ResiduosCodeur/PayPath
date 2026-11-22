import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        panel: "#141414",
        panel2: "#1c1c1c",
        border: "#262626",
        text: "#f5f4f0",
        muted: "#8c8a85",
        accent: "#ff5a1f",
        "accent-dark": "#c73f0f",
        warn: "#e8b95b",
        danger: "#ef4444",
        good: "#4ade80",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
