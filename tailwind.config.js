/** @type {import('tailwindcss').Config} */
// Tailwind v4: theme tokens defined in global.css via @theme.
// This file only specifies content paths for class scanning.
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/tw/**/*.{js,ts,jsx,tsx}',
  ],
};
