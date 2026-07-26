/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Base — deep indigo-void, not pure black, so glass panels have somewhere to sit
        void: {
          DEFAULT: "#070B18",
          soft: "#0B1120",
        },
        surface: {
          DEFAULT: "#0E1428",
          raised: "#141B34",
        },
        // Signature accent pair: electric blue (AI / primary actions) + violet (citations / AI voice)
        neon: {
          DEFAULT: "#4DA3FF",
          soft: "#7FC0FF",
          dim: "#2B6CB0",
        },
        violet: {
          DEFAULT: "#8B7CFF",
          soft: "#B3A8FF",
        },
        // Amber used ONLY for primary CTAs — one warm accent against an otherwise cool palette
        amber: {
          DEFAULT: "#F5A623",
          soft: "#FFC862",
        },
        ink: {
          DEFAULT: "#F1F4FA",
          muted: "#93A0BF",
          faint: "#5C6689",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        "mesh-gradient":
          "radial-gradient(at 20% 20%, rgba(77,163,255,0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139,124,255,0.16) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(77,163,255,0.10) 0px, transparent 50%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.55", filter: "blur(40px)" },
          "50%": { opacity: "0.85", filter: "blur(55px)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        // Shimmer sweep for LoadingShimmer skeleton lines
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // Ripple expand+fade for PremiumButton click effect
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.55" },
          "100%": { transform: "scale(2.8)", opacity: "0" },
        },
        // Subtle border rotation for premium button glow ring
        "border-spin": {
          "0%": { "--border-angle": "0deg" },
          "100%": { "--border-angle": "360deg" },
        },
        // Stat counter fade-up on mount
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "pulse-glow": "pulse-glow 5s ease-in-out infinite",
        "gradient-shift": "gradient-shift 12s ease infinite",
        shimmer: "shimmer 1.6s linear infinite",
        ripple: "ripple 0.55s ease-out forwards",
        "fade-up": "fade-up 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
