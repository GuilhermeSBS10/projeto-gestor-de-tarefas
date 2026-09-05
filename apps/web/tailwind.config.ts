import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        muted: "#64748b",
        line: "#d7e3f3",
        panel: "#eef6ff",
        brand: "#0b63ce",
        accent: "#38bdf8"
      }
    }
  },
  plugins: []
} satisfies Config;
