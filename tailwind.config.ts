import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        foreground: "#e2e8f0",
        card: "#111118",
        "card-foreground": "#e2e8f0",
        popover: "#111118",
        "popover-foreground": "#e2e8f0",
        primary: {
          DEFAULT: "#06b6d4",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1e293b",
          foreground: "#e2e8f0",
        },
        muted: {
          DEFAULT: "#1a1a24",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#06b6d4",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#000000",
        },
        border: "#1e293b",
        input: "#1e293b",
        ring: "#06b6d4",
        "chart-1": "#06b6d4",
        "chart-2": "#10b981",
        "chart-3": "#f59e0b",
        "chart-4": "#8b5cf6",
        "chart-5": "#ef4444",
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
