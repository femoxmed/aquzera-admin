import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#03D4FF",
        secondary: "#0040D3",
        tertiary: "#FF6B6B",
        ink: "#0F172A",
        muted: "#64748B",
        panel: "#F8FAFC",
        line: "#E2E8F0"
      },
      boxShadow: {
        soft: "0 12px 40px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
} satisfies Config;
