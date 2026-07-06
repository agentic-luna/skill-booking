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

        border: "#d1cfcd",
        input: "#d1cfcd",
        ring: "#1d1d1d",
        background: "#fcf9f7",
        foreground: "#000000",
        primary: {
          DEFAULT: "#05060b",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#ffffff",
          foreground: "#1d1d1d",
        },
        destructive: {
          DEFAULT: "#05060b",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#ecedef",
          foreground: "#575757",
        },
        accent: {
          DEFAULT: "#ffffff",
          foreground: "#1d1d1d",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
