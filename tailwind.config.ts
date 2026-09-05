import type { Config } from "tailwindcss";

/**
 * NOTE: Design tokens now live EXCLUSIVELY in `app/globals.css` (Tailwind v4
 * `@theme inline`). This file is kept for shadcn `components.json` metadata
 * and IDE tooling only — it must NOT redefine color/neutral scales.
 * Fonts: Space Grotesk (display/body) + JetBrains Mono (mono) via next/font.
 */
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
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-body)", "Space Grotesk", "sans-serif"],
        sans: ["var(--font-body)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],       // 12px / 16px
        sm: ["0.875rem", { lineHeight: "1.25rem" }],   // 14px / 20px
        base: ["1rem", { lineHeight: "1.5rem" }],      // 16px / 24px
        lg: ["1.125rem", { lineHeight: "1.75rem" }],   // 18px / 28px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],    // 20px / 28px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],     // 24px / 32px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px / 36px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],  // 36px / 40px
        "5xl": ["3rem", { lineHeight: "3.25rem" }],    // 48px / 52px
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "9999px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      maxWidth: {
        container: "1280px",
        dashboard: "1024px",
      },
      transitionDuration: {
        fast: "120ms",
        base: "300ms",
        slow: "500ms",
        reveal: "350ms",
        counter: "400ms",
      },
    },
  },
  plugins: [],
};

export default config;