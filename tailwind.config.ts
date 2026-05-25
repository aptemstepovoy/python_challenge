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
        // Canvas — deep neutral cool black, slight blue undertone
        background: "#07080d",
        surface: "#10121b",
        "surface-2": "#181c28",
        "surface-3": "#232838",

        // Text — neutral off-white, no violet tint
        foreground: "#e8ebf5",
        muted: "#9aa0b4",
        // .text-muted / .text-secondary remapped via globals.css

        // Borders — neutral cool gray, single-weight
        border: "#262b3a",
        "border-bright": "#3a4156",

        // Primary accent — electric indigo (single, strong, Linear-style)
        accent: "#7c5cff",
        "accent-bright": "#a594ff",
        "accent-dim": "#5b3ee0",

        // Aliased to accent so legacy `violet`/`magic` keep working
        violet: "#7c5cff",
        "violet-bright": "#a594ff",
        magic: "#7c5cff",

        // Reserved for celebrations / hero XP gradients only
        pink: "#f25fa9",
        "pink-bright": "#ff7ec0",
        cyan: "#39d6f0",
        "cyan-bright": "#7ee9fa",
        gold: "#f5b740",
        "gold-bright": "#ffd073",

        // Status
        danger: "#ef4444",
        "danger-bright": "#fca5a5",
        warn: "#f59e0b",
        ok: "#4ade80",
        "ok-bright": "#86efac",
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
          "Manrope",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "10px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "28px",
      },
      boxShadow: {
        // Soft elevation — used on cards
        soft: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
        lift: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 16px 40px -16px rgba(0,0,0,0.7)",
        // Accent glow — reserved for primary CTAs / hero
        glow: "0 0 0 1px rgba(124,92,255,0.4), 0 0 24px -4px rgba(124,92,255,0.45)",
        "glow-lg":
          "0 0 0 1px rgba(124,92,255,0.55), 0 0 50px -6px rgba(124,92,255,0.55), inset 0 1px 0 0 rgba(165,148,255,0.18)",
        "glow-pink":
          "0 0 0 1px rgba(242,95,169,0.45), 0 0 32px -4px rgba(242,95,169,0.4)",
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.05)",
      },
      backgroundImage: {
        panel: "linear-gradient(180deg, #14182260 0%, #0e111a80 100%)",
        "panel-bright":
          "linear-gradient(180deg, #1c2030 0%, #14182288 100%)",
        "hero-gradient":
          "linear-gradient(135deg, #7c5cff 0%, #f25fa9 55%, #39d6f0 100%)",
        "violet-fill":
          "linear-gradient(180deg, #a594ff 0%, #7c5cff 50%, #5b3ee0 100%)",
        "pink-fill":
          "linear-gradient(180deg, #ff7ec0 0%, #f25fa9 50%, #c93a87 100%)",
        "hp-fill":
          "linear-gradient(180deg, #fca5a5 0%, #ef4444 50%, #b91c1c 100%)",
        "xp-fill":
          "linear-gradient(90deg, #7c5cff 0%, #f25fa9 55%, #39d6f0 100%)",
        noise:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,92,255,0.08) 0%, transparent 60%)",
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
            boxShadow:
              "0 0 0 1px rgba(124,92,255,0.4), 0 0 20px -2px rgba(124,92,255,0.25)",
          },
          "50%": {
            boxShadow:
              "0 0 0 1px rgba(165,148,255,0.7), 0 0 36px 0 rgba(165,148,255,0.5)",
          },
        },
        glow: {
          "0%, 100%": { textShadow: "0 0 10px rgba(165,148,255,0.35)" },
          "50%": { textShadow: "0 0 18px rgba(165,148,255,0.7)" },
        },
        "float-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        glow: "glow 3.2s ease-in-out infinite",
        "float-up": "float-up 0.4s ease-out",
        shimmer: "shimmer 4s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
