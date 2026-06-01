// PostCSS config for Tailwind v4 + NativeWind v5.
// Expo's Metro transform-worker runs PostCSS on .css files when this config exists.
// Without it, @import "tailwindcss/..." directives remain unprocessed and
// lightningcss 1.32.x crashes on @import statements in the second compiler pass.
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
