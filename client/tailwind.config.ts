import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--surface-bg)",
        card: "var(--surface-card)",
        neon: "var(--accent-purple)",
        pink: "var(--accent-rose)",
        foreground: "var(--text-primary)",
        muted: "var(--text-muted)",
        border: "var(--surface-border)"
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
        pinkGlow: "var(--shadow-soft)",
        panel: "var(--shadow-panel)"
      },
      backdropBlur: {
        xl: "20px"
      },
      spacing: {
        "safe": "env(safe-area-inset-bottom, 0px)"
      }
    }
  },
  plugins: []
};

export default config;
