/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add custom theme extensions if needed
    },
  },
  variants: {
    extend: {
      scrollbar: ["rounded"], // Enable scrollbar variant with rounded support
    },
  },
  plugins: [], // No external plugin needed for scrollbar in Tailwind v4
};
