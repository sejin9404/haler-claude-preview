import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'pocari-blue': '#1C88FF',
        'pocari-light': '#E6F2FF',
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        heading: ['var(--font-heading)'],
      },
      animation: {
        'infinite-scroll': 'infinite-scroll 40s linear infinite',
        'marquee': 'marquee 30s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
