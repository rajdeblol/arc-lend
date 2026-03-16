import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-subtle": "rgb(var(--surface-subtle) / <alpha-value>)",
        "surface-border": "rgb(var(--surface-border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-contrast": "rgb(var(--accent-contrast) / <alpha-value>)",
        profit: "rgb(var(--profit) / <alpha-value>)",
        loss: "rgb(var(--loss) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};

export default config;
