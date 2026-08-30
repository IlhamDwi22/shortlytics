/**
 * Shortlytics Design Tokens
 * Source of truth based on docs/design-Shortlytics.md
 * Vibe: Playful & Friendly
 */

export const colors = {
  // 3.1 Primary — Violet Scale
  primary: {
    50: "#F5F3FF",
    100: "#EDE9FE",
    200: "#DDD6FE",
    300: "#C4B5FD",
    400: "#A78BFA",
    500: "#8B5CF6", // Base primary
    600: "#7C3AED", // Primary for button/main CTA
    700: "#6D28D9", // Hover state of primary-600
    800: "#5B21B6",
    900: "#4C1D95",
  },

  // 3.2 Accent — Warm Highlight (used sparingly for playful vibe)
  accent: {
    amber: "#FBBF24", // Highlights, badges, light notifications
    pink: "#F472B6",  // Decorative elements, illustrations (very limited)
  },

  // 3.3 Semantic Colors
  semantic: {
    success: {
      500: "#22C55E",
      100: "#DCFCE7", // Success banner/toast bg
    },
    error: {
      500: "#EF4444",
      100: "#FEE2E2", // Error banner/toast bg
    },
    warning: {
      500: "#F59E0B",
      100: "#FEF3C7", // Warning banner/toast bg
    },
  },

  // 3.4 Neutral Scale (Light Mode)
  neutralLight: {
    0: "#FFFFFF",   // Main background
    50: "#FAFAFA",  // Secondary/card background
    100: "#F4F4F5", // Thin border, divider
    200: "#E4E4E7",
    400: "#A1A1AA", // Placeholder text
    600: "#52525B", // Secondary body text
    800: "#27272A", // Primary body text
    950: "#09090B", // Heading, high contrast text
  },

  // 3.5 Neutral Scale (Dark Mode)
  neutralDark: {
    0: "#0A0A0B",   // Main dark background (not #000000)
    50: "#18181B",  // Card/elevated surface
    100: "#27272A", // Thin border, divider
    200: "#3F3F46",
    400: "#71717A", // Placeholder text
    600: "#A1A1AA", // Secondary body text
    800: "#E4E4E7", // Primary body text
    950: "#FAFAFA", // Heading, high contrast text
  },
} as const;

// 4. Typography
export const typography = {
  fonts: {
    display: "var(--font-display), 'Plus Jakarta Sans', sans-serif",
    body: "var(--font-body), 'Inter', sans-serif",
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],        // 12px / 16px
    sm: ["0.875rem", { lineHeight: "1.25rem" }],    // 14px / 20px
    base: ["1rem", { lineHeight: "1.5rem" }],       // 16px / 24px
    lg: ["1.125rem", { lineHeight: "1.75rem" }],    // 18px / 28px
    xl: ["1.25rem", { lineHeight: "1.75rem" }],     // 20px / 28px
    "2xl": ["1.5rem", { lineHeight: "2rem" }],      // 24px / 32px
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],  // 30px / 36px
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px / 40px
    "5xl": ["3rem", { lineHeight: "3.25rem" }],     // 48px / 52px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

// 5. Spacing & Layout
export const layout = {
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    6: "24px",
    8: "32px",
    12: "48px",
    16: "64px",
    24: "96px",
  },
  container: {
    maxWidth: "1280px",
    maxWidthDashboard: "1024px",
    paddingMobile: "16px",
    paddingDesktop: "32px",
  },
} as const;

// 6. Border Radius (Playful & Friendly - generous rounded corners)
export const borderRadius = {
  sm: "0.5rem",   // 8px - badge, small button
  md: "0.75rem",  // 12px - input, standard button
  lg: "1rem",     // 16px - card
  xl: "1.5rem",   // 24px - modal, large elevated card
  full: "9999px", // pill button, avatar, circular badge
} as const;

// 7. Shadows & Elevation
export const shadows = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.04)",
  md: "0 4px 12px rgba(0, 0, 0, 0.08)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
  primary: "0 8px 20px rgba(124, 58, 237, 0.25)", // Signature touch for main CTA
} as const;

// 10. Motion Tokens
export const motionTokens = {
  duration: {
    fast: 0.15, // hover, micro-interaction
    base: 0.3,  // standard element transition (modal, dropdown)
    slow: 0.5,  // page transition, large elements
  },
  easing: {
    out: [0.16, 1, 0.3, 1] as const,    // entering elements
    inOut: [0.65, 0, 0.35, 1] as const, // two-way transition
  },
  spring: {
    default: { type: "spring", stiffness: 300, damping: 30 },
    bouncy: { type: "spring", stiffness: 400, damping: 17 }, // for playful elements (badge, toast)
  },
} as const;
