/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        sans: ["var(--font-sans)", "sans-serif"],
      },
      colors: {
        'linen-canvas': 'var(--color-linen-canvas)',
        'bone-white': 'var(--color-bone-white)',
        'graphite-ink': 'var(--color-graphite-ink)',
        'nightshade-black': 'var(--color-nightshade-black)',
        'deep-harbor': 'var(--color-deep-harbor)',
        'charcoal-slate': 'var(--color-charcoal-slate)',
        'iron-grey': 'var(--color-iron-grey)',
        'obsidian': 'var(--color-obsidian)',
        'stone-grey': 'var(--color-stone-grey)',
        'ash': 'var(--color-ash)',
        'pebble': 'var(--color-pebble)',
        'concrete': 'var(--color-concrete)',
        'dove': 'var(--color-dove)',
        'clay-shadow': 'var(--color-clay-shadow)',
        'haze': 'var(--color-haze)',

        border: "var(--color-clay-shadow)",
        input: "var(--color-clay-shadow)",
        ring: "var(--color-charcoal-slate)",
        background: "var(--color-linen-canvas)",
        foreground: "var(--color-graphite-ink)",
        primary: {
          DEFAULT: "var(--color-nightshade-black)",
          foreground: "var(--color-graphite-ink)",
        },
        secondary: {
          DEFAULT: "var(--color-deep-harbor)",
          foreground: "var(--color-graphite-ink)",
        },
        destructive: {
          DEFAULT: "var(--color-nightshade-black)",
          foreground: "var(--color-bone-white)",
        },
        muted: {
          DEFAULT: "var(--color-haze)",
          foreground: "var(--color-stone-grey)",
        },
        accent: {
          DEFAULT: "var(--color-ash)",
          foreground: "var(--color-graphite-ink)",
        },
        popover: {
          DEFAULT: "var(--color-bone-white)",
          foreground: "var(--color-graphite-ink)",
        },
        card: {
          DEFAULT: "var(--color-bone-white)",
          foreground: "var(--color-graphite-ink)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        marquee: "marquee 15s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
