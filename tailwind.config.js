/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  safelist: [
    'bg-[#ffffff]',
    'bg-[#000000]',
    'bg-[#ad6c6e]',
    'bg-[#f8e7db]',
    'ring-[#ffffff]',
    'ring-[#000000]',
    'ring-[#ad6c6e]',
    'ring-[#f8e7db]',
  ],
};
