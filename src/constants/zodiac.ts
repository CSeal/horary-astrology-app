// src/constants/zodiac.ts
// Zodiac sign order + abbreviation expansion, and aspect glyph/tone mapping.
// The wire model returns 3-letter sign abbreviations (e.g. 'Tau') and aspect
// type names (e.g. 'sextile'); these helpers turn them into display data.

export const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

// Wire abbreviation → full English sign name.
export const SIGN_BY_ABBREV: Record<string, ZodiacSign> = {
  Ari: 'Aries',
  Tau: 'Taurus',
  Gem: 'Gemini',
  Can: 'Cancer',
  Leo: 'Leo',
  Vir: 'Virgo',
  Lib: 'Libra',
  Sco: 'Scorpio',
  Sag: 'Sagittarius',
  Cap: 'Capricorn',
  Aqu: 'Aquarius',
  Pis: 'Pisces',
};

// Expand a 3-letter abbreviation to the full sign name. Returns the input
// unchanged if it is already a full name or unknown.
export function expandSign(abbrev: string | undefined): string | undefined {
  if (!abbrev) return undefined;
  return SIGN_BY_ABBREV[abbrev] ?? abbrev;
}

// The sign the Moon will enter next (used by the void-of-course banner).
export function nextSign(abbrev: string | undefined): string | undefined {
  const full = expandSign(abbrev);
  if (!full) return undefined;
  const idx = ZODIAC_SIGNS.indexOf(full as ZodiacSign);
  if (idx === -1) return undefined;
  return ZODIAC_SIGNS[(idx + 1) % ZODIAC_SIGNS.length];
}

// ── Aspects ──────────────────────────────────────────────────────────────────

export const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
};

export type AspectTone = 'good' | 'bad' | 'cool';

// Glyph colour tone: harmonious trine/conjunction = good (green),
// sextile = cool (blue), hard square/opposition = bad (red).
export const ASPECT_TONE: Record<string, AspectTone> = {
  trine: 'good',
  conjunction: 'good',
  sextile: 'cool',
  square: 'bad',
  opposition: 'bad',
};

export function aspectSymbol(aspectType: string): string {
  return ASPECT_SYMBOLS[aspectType] ?? '◦';
}

export function aspectTone(aspectType: string): AspectTone {
  return ASPECT_TONE[aspectType] ?? 'cool';
}

// Decimal degrees → traditional degree/minute display, e.g. 2.5 → "2°30′".
export function formatDegrees(deg: number | null | undefined): string {
  if (deg == null || Number.isNaN(deg)) return '';
  const whole = Math.floor(deg);
  const minutes = Math.round((deg - whole) * 60);
  // Carry a rounded-up 60′ into the next degree.
  if (minutes === 60) return `${whole + 1}°`;
  return minutes > 0 ? `${whole}°${minutes.toString().padStart(2, '0')}′` : `${whole}°`;
}

// Position (0-1) of a timing estimate on the days→weeks→months scale bar.
export function timingScalePosition(
  unit: 'days' | 'weeks' | 'months' | 'years'
): number {
  switch (unit) {
    case 'days':
      return 0.12;
    case 'weeks':
      return 0.42;
    case 'months':
    case 'years':
      return 0.82;
    default:
      return 0.42;
  }
}
