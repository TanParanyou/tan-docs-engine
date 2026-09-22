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
    },
  },
  plugins: [typography],
} satisfies Config;
