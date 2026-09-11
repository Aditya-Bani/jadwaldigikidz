import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "./index.html"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--on-primary))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--on-secondary))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        /* Coach colours — used by the schedule legend and badges. */
        coach: {
          bani: "hsl(var(--coach-bani))",
          argy: "hsl(var(--coach-argy))",
          zaura: "hsl(var(--coach-zaura))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* Stitch Generated Colors */
        "on-secondary": "hsl(var(--on-secondary))",
        "on-secondary-fixed-variant": "hsl(var(--on-secondary-fixed-variant))",
        "primary-container": "hsl(var(--primary-container))",
        "surface-dim": "hsl(var(--surface-dim))",
        "secondary-fixed": "hsl(var(--secondary-fixed))",
        "inverse-surface": "hsl(var(--inverse-surface))",
        "error": "hsl(var(--error))",
        "on-primary-fixed-variant": "hsl(var(--on-primary-fixed-variant))",
        "on-surface-variant": "hsl(var(--on-surface-variant))",
        "surface-bright": "hsl(var(--surface-bright))",
        "surface-container": "hsl(var(--surface-container))",
        "on-error-container": "hsl(var(--on-error-container))",
        "on-primary-container": "hsl(var(--on-primary-container))",
        "on-error": "hsl(var(--on-error))",
        "surface-container-high": "hsl(var(--surface-container-high))",
        "on-tertiary": "hsl(var(--on-tertiary))",
        "on-background": "hsl(var(--on-background))",
        "tertiary-fixed-dim": "hsl(var(--tertiary-fixed-dim))",
        "on-secondary-fixed": "hsl(var(--on-secondary-fixed))",
        "surface": "hsl(var(--surface))",
        "surface-container-highest": "hsl(var(--surface-container-highest))",
        "primary-fixed-dim": "hsl(var(--primary-fixed-dim))",
        "error-container": "hsl(var(--error-container))",
        "on-primary-fixed": "hsl(var(--on-primary-fixed))",
        "on-surface": "hsl(var(--on-surface))",
        "tertiary": "hsl(var(--tertiary))",
        "surface-container-lowest": "hsl(var(--surface-container-lowest))",
        "surface-tint": "hsl(var(--surface-tint))",
        "outline": "hsl(var(--outline))",
        "on-secondary-container": "hsl(var(--on-secondary-container))",
        "inverse-primary": "hsl(var(--inverse-primary))",
        "tertiary-container": "hsl(var(--tertiary-container))",
        "secondary-container": "hsl(var(--secondary-container))",
        "on-tertiary-fixed": "hsl(var(--on-tertiary-fixed))",
        "on-tertiary-container": "hsl(var(--on-tertiary-container))",
        "outline-variant": "hsl(var(--outline-variant))",
        "on-tertiary-fixed-variant": "hsl(var(--on-tertiary-fixed-variant))",
        "inverse-on-surface": "hsl(var(--inverse-on-surface))",
        "surface-variant": "hsl(var(--surface-variant))",
        "surface-container-low": "hsl(var(--surface-container-low))",
        "tertiary-fixed": "hsl(var(--tertiary-fixed))",
        "primary-fixed": "hsl(var(--primary-fixed))",
        "secondary-fixed-dim": "hsl(var(--secondary-fixed-dim))"
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
        xl: "0.75rem",
        full: "9999px",
        "2xl": "1rem"
      },
      spacing: {
        "gutter": "24px",
        "margin-mobile": "16px",
        "margin-desktop": "40px",
        "base": "8px",
        "container-padding": "32px"
      },
      fontFamily: {
        "display-lg": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }]
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "hsl(var(--radix-accordion-content-height))" },
        },
        "accordion-up": {
          from: { height: "hsl(var(--radix-accordion-content-height))" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
