import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        link: "#1fb6ff",
      },
    },
  },
  plugins: [],
} satisfies Config;
