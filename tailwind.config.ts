import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        grid: {
          bg: "#0A0B0D",
          cyan: "#22D3EE",
          cyanDim: "rgba(34,211,238,0.35)",
          grey1: "#1A1C1F",
          grey2: "#2A2D31",
          grey3: "#4A4D52",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        sans: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "holo-cyan": "0 0 22px rgba(34,211,238,0.12)",
        "holo-cyan-intense": "0 0 28px rgba(34,211,238,0.18)",
      },
      borderRadius: {
        holo: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
