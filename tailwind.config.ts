import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple neutral system
        black: "#000000",
        "pale-gray": "#f5f5f7",
        ink: "#1d1d1f",
        "text-secondary": "#6e6e73",
        "border-soft": "#d2d2d7",
        "border-mid": "#86868b",
        "surface-dark-a": "#272729",
        "surface-dark-b": "#262629",
        "surface-dark-c": "#28282b",
        "utility-dark": "#424245",

        // Warm culinary accent (replaces Apple blue)
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      fontFamily: {
        display: ['"Inter Tight"', "Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "hero-xl": ["80px", { lineHeight: "1.03", letterSpacing: "-0.04em", fontWeight: "600" }],
        "hero-lg": ["56px", { lineHeight: "1.07", letterSpacing: "-0.02em", fontWeight: "600" }],
        "section-display": ["48px", { lineHeight: "1.08", letterSpacing: "-0.01em", fontWeight: "600" }],
        "product-heading": ["40px", { lineHeight: "1.10", fontWeight: "600" }],
        "feature-display": ["36px", { lineHeight: "1.14", fontWeight: "600" }],
        "promo-display": ["32px", { lineHeight: "1.12", fontWeight: "600" }],
        "card-title": ["24px", { lineHeight: "1.17", letterSpacing: "-0.01em", fontWeight: "600" }],
        "utility-heading": ["21px", { lineHeight: "1.14", fontWeight: "600" }],
        subhead: ["19px", { lineHeight: "1.21", fontWeight: "600" }],
        "body-lg": ["17px", { lineHeight: "1.47", letterSpacing: "-0.022em", fontWeight: "400" }],
        "body-emphasis": ["17px", { lineHeight: "1.24", letterSpacing: "-0.022em", fontWeight: "600" }],
        label: ["14px", { lineHeight: "1.43", letterSpacing: "-0.016em" }],
        micro: ["12px", { lineHeight: "1.33", letterSpacing: "-0.01em" }],
        legal: ["10px", { lineHeight: "1.40", letterSpacing: "-0.008em" }],
      },
      borderRadius: {
        micro: "5px",
        field: "8px",
        control: "10px",
        card: "14px",
        module: "18px",
        spotlight: "24px",
        large: "32px",
        pill: "980px",
      },
      spacing: {
        "0.5": "2px",
        "1": "4px",
        "1.5": "6px",
        "2": "8px",
        "2.5": "10px",
        "3": "12px",
        "3.5": "14px",
        "4": "16px",
        "4.5": "18px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "9": "36px",
        "10": "40px",
        "11": "44px",
        "12": "48px",
        "14": "56px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
      },
      boxShadow: {
        subtle:
          "0 1px 2px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.05)",
        elevated:
          "0 2px 6px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)",
        overlay:
          "0 4px 12px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
