import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./@/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./node_modules/frames.js/dist/**/*.{ts,tsx,js,css}",
    "./node_modules/@frames.js/render/dist/*.{ts,tsx,js,css}",
    "./node_modules/@frames.js/render/dist/**/*.{ts,tsx,js,css}",
    "../../node_modules/frames.js/dist/**/*.{ts,tsx,js,css}",
    "../../node_modules/@frames.js/render/dist/*.{ts,tsx,js,css}",
    "../../node_modules/@frames.js/render/dist/**/*.{ts,tsx,js,css}",
  ],
  prefix: "",
  theme: {
    extend: {
      fontFamily: {
        protomono: ["Protomono", "monospace"], // Add the Protomono font
      },
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
  },
};

export default config;
