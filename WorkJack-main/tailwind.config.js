/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  important: '#root', // เพิ่มบรรทัดนี้
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false, // เพิ่มบรรทัดนี้
  },
};