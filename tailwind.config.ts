import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./templates/**/*.{html,css}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Sarabun",
          "Prompt",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "SF Mono",
          "Menlo",
          "Consolas",
          "Monaco",
          "Liberation Mono",
          "monospace",
        ],
      },
      colors: {
        theme: {
          bg: "var(--theme-bg)",
          "bg-subtle": "var(--theme-bg-subtle)",
          surface: "var(--theme-surface)",
          "surface-hover": "var(--theme-surface-hover)",
          "surface-sunken": "var(--theme-surface-sunken)",
          text: "var(--theme-text)",
          "text-muted": "var(--theme-text-muted)",
          "text-faint": "var(--theme-text-faint)",
          border: "var(--theme-border)",
          "border-subtle": "var(--theme-border-subtle)",
          primary: {
            DEFAULT: "var(--theme-primary)",
            hover: "var(--theme-primary-hover)",
            text: "var(--theme-primary-text)",
          },
          accent: {
            DEFAULT: "var(--theme-accent)",
            hover: "var(--theme-accent-hover)",
            light: "var(--theme-accent-light)",
            text: "var(--theme-accent-text)",
          },
          warning: {
            DEFAULT: "var(--theme-warning)",
            light: "var(--theme-warning-light)",
          },
          success: {
            DEFAULT: "var(--theme-success)",
            light: "var(--theme-success-light)",
          },
          danger: {
            DEFAULT: "var(--theme-danger)",
            light: "var(--theme-danger-light)",
          },
        },
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfe",
          300: "#7cc2fd",
          400: "#36a3f9",
          500: "#0c87eb",
          600: "#026ac8",
          700: "#0354a2",
          800: "#074885",
          900: "#0c3d6e",
          950: "#082749",
        },
      },
      boxShadow: {
        "retro-sm": "var(--theme-shadow-hard-sm)",
        "retro": "var(--theme-shadow-hard)",
        "retro-lg": "var(--theme-shadow-hard-lg)",
      },
      borderRadius: {
        "retro": "var(--theme-radius)",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
