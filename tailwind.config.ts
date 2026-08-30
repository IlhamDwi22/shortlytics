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
        // 3.1 Primary — Violet Scale
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6", // base primary
          600: "#7C3AED", // primary untuk button/CTA utama
          700: "#6D28D9", // hover state dari primary-600
          800: "#5B21B6",
          900: "#4C1D95",
        },
        // 3.2 Accent — Warm Highlight
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          amber: "#FBBF24",
          pink: "#F472B6",
        },
        // 3.3 Semantic Colors
        success: {
          DEFAULT: "#22C55E",
          500: "#22C55E",
          100: "#DCFCE7",
        },
        error: {
          DEFAULT: "#EF4444",
          500: "#EF4444",
          100: "#FEE2E2",
        },
        warning: {
          DEFAULT: "#F59E0B",
          500: "#F59E0B",
          100: "#FEF3C7",
        },
        // 3.4 & 3.5 Neutral Scales
        neutral: {
          0: "#FFFFFF",
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          400: "#A1A1AA",
          600: "#52525B",
          800: "#27272A",
          950: "#09090B",
          dark: {
            0: "#0A0A0B",
            50: "#18181B",
            100: "#27272A",
            200: "#3F3F46",
            400: "#71717A",
            600: "#A1A1AA",
            800: "#E4E4E7",
            950: "#FAFAFA",
          },
        },
        // CSS Variable Semantic Mappings
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
        display: ["var(--font-display)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "sans-serif"],
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
        sm: "var(--radius-sm)", // 0.5rem (8px)
        md: "var(--radius-md)", // 0.75rem (12px)
        lg: "var(--radius-lg)", // 1rem (16px)
        xl: "var(--radius-xl)", // 1.5rem (24px)
        full: "9999px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        primary: "var(--shadow-primary)",
      },
      maxWidth: {
        container: "1280px",
        dashboard: "1024px",
      },
      transitionDuration: {
        fast: "150ms",
        base: "300ms",
        slow: "500ms",
      },
    },
  },
  plugins: [],
};

export default config;
