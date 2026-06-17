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
        neo: {
          yellow: "#ffc900",
          pink: "#ff90e8",
          blue: "#b8daff",
          green: "#00f0ff",
          red: "#ff5e5e",
          purple: "#d9b8ff",
        }
      },
      boxShadow: {
        neo: '4px 4px 0px 0px rgba(0,0,0,1)',
        'neo-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'neo-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
        'neo-hover': '2px 2px 0px 0px rgba(0,0,0,1)'
      },
    },
  },
  plugins: [],
};
export default config;
