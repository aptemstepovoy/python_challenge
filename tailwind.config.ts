import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08060b",
        surface: "#15110d",
        "surface-2": "#1c1812",
        "surface-3": "#241e15",
        foreground: "#ebe2cf",
        muted: "#8a7e6b",
        border: "#3a2e1c",
        "border-bright": "#5a4828",
        accent: "#d4a574",
        "accent-bright": "#f3c97a",
        "accent-dim": "#a37e54",
        gold: "#d4a574",
        "gold-light": "#f3c97a",
        bronze: "#6b4c2a",
        danger: "#c44545",
        "danger-bright": "#e36767",
        warn: "#d4a574",
        ok: "#5a9b6a",
        "ok-bright": "#7dc28d",
        magic: "#7e6cd4",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: [
          "var(--font-jetbrains)",
          "JetBrains Mono",
          "ui-monospace",
          "monospace",
        ],
        display: [
          "var(--font-display)",
          "Forum",
          "Trajan Pro",
          "Cormorant Garamond",
          "serif",
        ],
      },
      borderRadius: {
        DEFAULT: "4px",
        md: "6px",
        lg: "6px",
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(212,165,116,0.35), 0 0 18px -2px rgba(212,165,116,0.25)",
        "gold-lg":
          "0 0 0 1px rgba(212,165,116,0.5), 0 0 30px -2px rgba(212,165,116,0.45), inset 0 1px 0 0 rgba(243,201,122,0.18)",
        inset: "inset 0 1px 0 0 rgba(243,201,122,0.08)",
      },
      backgroundImage: {
        "panel": "linear-gradient(180deg, #1d1812 0%, #15110d 100%)",
        "panel-bright":
          "linear-gradient(180deg, #2a2218 0%, #1c1612 100%)",
        "gold-fill":
          "linear-gradient(180deg, #f3c97a 0%, #d4a574 50%, #a37e54 100%)",
        "gold-fill-soft":
          "linear-gradient(180deg, rgba(243,201,122,0.18) 0%, rgba(212,165,116,0.06) 100%)",
        "vignette":
          "radial-gradient(ellipse at top, rgba(212,165,116,0.05) 0%, transparent 55%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-gold": {
          "0%, 100%": {
            boxShadow: "0 0 0 1px rgba(212,165,116,0.45), 0 0 18px -2px rgba(212,165,116,0.25)",
          },
          "50%": {
            boxShadow: "0 0 0 1px rgba(243,201,122,0.7), 0 0 32px 0 rgba(243,201,122,0.5)",
          },
        },
        "glow": {
          "0%, 100%": { textShadow: "0 0 8px rgba(212,165,116,0.45)" },
          "50%": { textShadow: "0 0 18px rgba(243,201,122,0.85)" },
        },
        "float-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-gold": "pulse-gold 1.8s ease-in-out",
        "glow": "glow 2.5s ease-in-out infinite",
        "float-up": "float-up 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
