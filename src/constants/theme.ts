// src/constants/theme.ts
// All color tokens, typography, and spacing constants.
// Rules:
//   - No hardcoded hex values outside this file
//   - SVG components must import from here, never use inline colors
//   - NativeWind className values reference tailwind.config.js which maps to these tokens

export const colors = {
  // Background tokens
  bgBase: '#070714',
  bgSurface: '#12102A',
  bgCard: '#1C1940',
  bgOverlay: '#0A091F',

  // Accent tokens
  accentGold: '#F5C842',
  accentViolet: '#8B5CF6',
  accentGoldDim: '#7A6421',

  // Verdict semantic colors
  yes: '#22D3A4',
  yesGlow: 'rgba(34,211,164,0.15)',
  no: '#F87171',
  noGlow: 'rgba(248,113,113,0.15)',
  maybe: '#FBBF24',
  maybeGlow: 'rgba(251,191,36,0.15)',
  unclear: '#9B93B8',
  unclearGlow: 'rgba(155,147,184,0.15)',

  // Text tokens
  textPrimary: '#F0EEFF',
  textSecondary: '#9B93B8',
  textDisabled: '#4A4465',
  textInverse: '#070714',

  // Border tokens
  border: 'rgba(240,238,255,0.08)',
  borderFocus: 'rgba(245,200,66,0.4)',
} as const;

export const typography = {
  // Font families
  display: 'CormorantGaramond-Regular',
  displayMedium: 'CormorantGaramond-Medium',
  displayBold: 'CormorantGaramond-Bold',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',

  // Font sizes (px → pt equivalent)
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 22,
  '2xl': 28,
  '3xl': 48,
  hero: 36,

  // Line heights
  bodyLineHeight: 1.6,
  headingLineHeight: 1.2,
  captionLineHeight: 1.4,
  verdictLineHeight: 1.0,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
