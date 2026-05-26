/** @type {import('tailwindcss').Config} */
// NativeWind v5 tailwind config.
// All color tokens map to src/constants/theme.ts values.
// No hardcoded hex values in components — use these class names.

module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background tokens
        'bg-base': '#070714',
        'bg-surface': '#12102A',
        'bg-card': '#1C1940',
        'bg-overlay': '#0A091F',

        // Accent tokens
        'accent-gold': '#F5C842',
        'accent-violet': '#8B5CF6',
        'accent-gold-dim': '#7A6421',

        // Verdict semantic colors
        yes: '#22D3A4',
        no: '#F87171',
        maybe: '#FBBF24',
        unclear: '#9B93B8',

        // Text tokens
        'text-primary': '#F0EEFF',
        'text-secondary': '#9B93B8',
        'text-disabled': '#4A4465',
        'text-inverse': '#070714',

        // Border tokens
        border: 'rgba(240,238,255,0.08)',
        'border-focus': 'rgba(245,200,66,0.4)',
      },
      fontFamily: {
        cormorant: ['CormorantGaramond-Regular'],
        'cormorant-medium': ['CormorantGaramond-Medium'],
        'cormorant-bold': ['CormorantGaramond-Bold'],
        inter: ['Inter-Regular'],
        'inter-medium': ['Inter-Medium'],
        'inter-semibold': ['Inter-SemiBold'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
