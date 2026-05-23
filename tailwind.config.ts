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
        background: "#0a0814",
        surface: "#14111f",
        "surface-2": "#1c1830",
        "surface-3": "#251f3d",
        foreground: "#ece8f5",
        muted: "#8b85a2",
        border: "#2d2845",
        "border-bright": "#4a4170",
        accent: "#a78bfa",
        "accent-bright": "#c4b5fd",
        "accent-dim": "#7c5cdb",
        violet: "#a78bfa",
        "violet-bright": "#c4b5fd",
        pink: "#ec4899",
        "pink-bright": "#f472b6",
        cyan: "#22d3ee",
        "cyan-bright": "#67e8f9",
        magic: "#a78bfa",
        gold: "#fbbf24",
        "gold-bright": "#fcd34d",
        danger: "#f87171",
        "danger-bright": "#fca5a5",
        warn: "#fbbf24",
        ok: "#34d399",
        "ok-bright": "#6ee7b7",
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
          "Cormorant Garamond",
          "serif",
        ],
      },
      borderRadius: {
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(167,139,250,0.35), 0 0 24px -2px rgba(167,139,250,0.3)",
        "glow-lg":
          "0 0 0 1px rgba(167,139,250,0.5), 0 0 40px -2px rgba(167,139,250,0.5), inset 0 1px 0 0 rgba(196,181,253,0.2)",
        "glow-pink":
          "0 0 0 1px rgba(236,72,153,0.5), 0 0 30px -2px rgba(236,72,153,0.4)",
        inset: "inset 0 1px 0 0 rgba(196,181,253,0.08)",
      },
      backgroundImage: {
        "panel": "linear-gradient(180deg, #1a1530 0%, #100c1f 100%)",
        "panel-bright":
          "linear-gradient(180deg, #251f3d 0%, #1a1530 100%)",
        "hero-gradient":
          "linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #f97316 100%)",
        "violet-fill":
          "linear-gradient(180deg, #c4b5fd 0%, #a78bfa 50%, #7c5cdb 100%)",
        "pink-fill":
          "linear-gradient(180deg, #f472b6 0%, #ec4899 50%, #be185d 100%)",
        "hp-fill":
          "linear-gradient(180deg, #fca5a5 0%, #f87171 50%, #b91c1c 100%)",
        "xp-fill":
          "linear-gradient(90deg, #a78bfa 0%, #ec4899 60%, #22d3ee 100%)",
        "noise":
          "radial-gradient(circle at 20% 20%, rgba(167,139,250,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236,72,153,0.05) 0%, transparent 50%)",
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
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 0 1px rgba(167,139,250,0.45), 0 0 24px -2px rgba(167,139,250,0.3)",
          },
          "50%": {
            boxShadow: "0 0 0 1px rgba(196,181,253,0.7), 0 0 40px 0 rgba(196,181,253,0.55)",
          },
        },
        "glow": {
          "0%, 100%": { textShadow: "0 0 12px rgba(167,139,250,0.45)" },
          "50%": { textShadow: "0 0 22px rgba(196,181,253,0.85)" },
        },
        "float-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out",
        "glow": "glow 3s ease-in-out infinite",
        "float-up": "float-up 0.4s ease-out",
        "shimmer": "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
