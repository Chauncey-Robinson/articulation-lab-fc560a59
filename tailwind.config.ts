import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      fontFamily: {
        sans: ["Inter Tight", "Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Fraunces", "Times New Roman", "Georgia", "serif"],
        display: ["Fraunces", "Times New Roman", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SF Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "ink-2": "hsl(var(--ink-2))",
        "ink-3": "hsl(var(--ink-3))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
          bright: "hsl(var(--amber-bright))",
          pale: "hsl(var(--amber-pale))",
        },
        sage: {
          DEFAULT: "hsl(var(--sage))",
          pale: "hsl(var(--sage-pale))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          tint: "hsl(var(--card-tint))",
        },
        surface: {
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
        },
        "ai-card": {
          DEFAULT: "hsl(var(--ai-card))",
          foreground: "hsl(var(--ai-card-foreground))",
          border: "hsl(var(--ai-card-border))",
        },
        meeting: {
          card: "hsl(var(--meeting-card))",
          text: "hsl(var(--meeting-text))",
        },
        section: "hsl(var(--section))",
        selected: {
          DEFAULT: "hsl(var(--selected))",
          border: "hsl(var(--selected-border))",
        },
        "surface-light": "hsl(var(--surface-light))",
        "surface-2": "hsl(var(--surface-2))",
        legal: "hsl(var(--legal))",
        block: {
          empty: "hsl(var(--block-empty))",
          low: "hsl(var(--block-low))",
          mid: "hsl(var(--block-mid))",
          high: "hsl(var(--block-high))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius-sm)",
        sm: "var(--radius-sm)",
        squircle: "14px",
        "squircle-sm": "8px",
        pill: "999px",
      },
      boxShadow: {
        feather: "0 1px 0 rgba(0,0,0,0.02)",
        "feather-lg": "0 8px 24px rgba(0,0,0,0.04)",
        "tile": "0 1px 0 rgba(0,0,0,0.02)",
        "tile-hover": "0 8px 24px rgba(0,0,0,0.05)",
        "card-hover": "0 12px 32px rgba(0,0,0,0.06)",
        "phone": "0 24px 56px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.04)",
        "modal": "0 16px 40px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
