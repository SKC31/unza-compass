import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F766E",
          dark: "#0B5C55",
          light: "#14958A",
        },
        accent: {
          DEFAULT: "#22D3EE",
        },
        bg: {
          DEFAULT: "#F8FAFC",
        },
        ink: {
          DEFAULT: "#0F172A",
        },
        muted: {
          DEFAULT: "#64748B",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 6px -1px rgba(15, 23, 42, 0.06)",
        cardHover: "0 4px 12px -2px rgba(15, 23, 42, 0.10)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
