import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 사미반점 브랜드 — 짜장 갈색 + 따뜻한 빨강
        brand: {
          50: "#fdf3ed",
          100: "#fbe3d4",
          200: "#f5c4a3",
          300: "#eb9d6c",
          400: "#dd7339",
          500: "#c2410c", // 메인 포인트 (간장/고추기름 톤)
          600: "#9a3412",
          700: "#7c2d12",
          800: "#5c220e",
          900: "#431a0d",
        },
        ink: {
          50: "#f7f6f4",
          900: "#1c1917",
        },
      },
      fontFamily: {
        display: ["Pretendard", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
