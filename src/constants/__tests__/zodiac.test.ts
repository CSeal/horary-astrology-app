// src/constants/__tests__/zodiac.test.ts
// 100% coverage for src/constants/zodiac.ts

import {
  ZODIAC_SIGNS,
  ZODIAC_GLYPHS,
  SIGN_BY_ABBREV,
  ASPECT_SYMBOLS,
  ASPECT_TONE,
  expandSign,
  nextSign,
  aspectSymbol,
  aspectTone,
  formatDegrees,
  timingScalePosition,
} from '@/constants/zodiac';

// ── Constants smoke tests ─────────────────────────────────────────────────────

describe('ZODIAC_SIGNS', () => {
  it('has 12 entries starting with Aries and ending with Pisces', () => {
    expect(ZODIAC_SIGNS).toHaveLength(12);
    expect(ZODIAC_SIGNS[0]).toBe('Aries');
    expect(ZODIAC_SIGNS[11]).toBe('Pisces');
  });
});

describe('ZODIAC_GLYPHS', () => {
  it('has a glyph for every sign', () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(ZODIAC_GLYPHS[sign]).toBeTruthy();
    }
  });
});

describe('SIGN_BY_ABBREV', () => {
  it('maps Tau to Taurus', () => {
    expect(SIGN_BY_ABBREV['Tau']).toBe('Taurus');
  });
  it('maps Pis to Pisces', () => {
    expect(SIGN_BY_ABBREV['Pis']).toBe('Pisces');
  });
});

describe('ASPECT_SYMBOLS', () => {
  it('has a symbol for trine', () => {
    expect(ASPECT_SYMBOLS['trine']).toBe('△');
  });
});

describe('ASPECT_TONE', () => {
  it('maps trine to good', () => {
    expect(ASPECT_TONE['trine']).toBe('good');
  });
});

// ── expandSign ────────────────────────────────────────────────────────────────

describe('expandSign', () => {
  it('expands a known 3-letter abbreviation', () => {
    expect(expandSign('Tau')).toBe('Taurus');
  });

  it('passes through a full sign name that is not in SIGN_BY_ABBREV', () => {
    // 'Taurus' is not a key in SIGN_BY_ABBREV, so ?? abbrev returns it unchanged
    expect(expandSign('Taurus')).toBe('Taurus');
  });

  it('returns undefined for undefined input', () => {
    expect(expandSign(undefined)).toBeUndefined();
  });

  it('returns undefined for empty string (falsy check)', () => {
    expect(expandSign('')).toBeUndefined();
  });
});

// ── nextSign ──────────────────────────────────────────────────────────────────

describe('nextSign', () => {
  it('returns the next sign for a known abbreviation', () => {
    expect(nextSign('Tau')).toBe('Gemini');
  });

  it('wraps around from the last sign (Pisces) to the first (Aries)', () => {
    expect(nextSign('Pis')).toBe('Aries');
  });

  it('returns undefined for undefined input', () => {
    expect(nextSign(undefined)).toBeUndefined();
  });

  it('returns undefined when expandSign produces a string not in ZODIAC_SIGNS (idx === -1 branch)', () => {
    // 'Xyz' is not in SIGN_BY_ABBREV so expandSign returns 'Xyz',
    // which is not in ZODIAC_SIGNS → indexOf returns -1
    expect(nextSign('Xyz')).toBeUndefined();
  });
});

// ── aspectSymbol ──────────────────────────────────────────────────────────────

describe('aspectSymbol', () => {
  it('returns the glyph for a known aspect', () => {
    expect(aspectSymbol('trine')).toBe('△');
  });

  it('returns the fallback glyph for an unknown aspect', () => {
    expect(aspectSymbol('quincunx')).toBe('◦');
  });
});

// ── aspectTone ────────────────────────────────────────────────────────────────

describe('aspectTone', () => {
  it('returns good for trine', () => {
    expect(aspectTone('trine')).toBe('good');
  });

  it('returns bad for opposition', () => {
    expect(aspectTone('opposition')).toBe('bad');
  });

  it('returns cool for sextile', () => {
    expect(aspectTone('sextile')).toBe('cool');
  });

  it('returns the fallback cool for an unknown aspect', () => {
    expect(aspectTone('quincunx')).toBe('cool');
  });
});

// ── formatDegrees ─────────────────────────────────────────────────────────────

describe('formatDegrees', () => {
  it('returns empty string for null', () => {
    expect(formatDegrees(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatDegrees(undefined)).toBe('');
  });

  it('returns empty string for NaN', () => {
    expect(formatDegrees(NaN)).toBe('');
  });

  it('formats 0 degrees with no minutes', () => {
    expect(formatDegrees(0)).toBe('0°');
  });

  it('formats a whole number with no minutes', () => {
    expect(formatDegrees(5)).toBe('5°');
  });

  it('formats fractional degrees as degree + minutes', () => {
    // 2.5 → whole=2, minutes=Math.round(0.5*60)=30 → "2°30′"
    expect(formatDegrees(2.5)).toBe('2°30′');
  });

  it('pads single-digit minutes to two digits', () => {
    // 3 + 5/60 = 3.0833... → whole=3, minutes=Math.round(0.0833*60)=5 → "3°05′"
    expect(formatDegrees(3 + 5 / 60)).toBe('3°05′');
  });

  it('carries rounded-up 60 minutes into the next degree', () => {
    // 2.999999999 → whole=2, (deg-whole)*60 ≈ 59.9999994 → Math.round → 60 → carry → "3°"
    expect(formatDegrees(2.999999999)).toBe('3°');
  });
});

// ── timingScalePosition ───────────────────────────────────────────────────────

describe('timingScalePosition', () => {
  it('returns 0.12 for days', () => {
    expect(timingScalePosition('days')).toBe(0.12);
  });

  it('returns 0.42 for weeks', () => {
    expect(timingScalePosition('weeks')).toBe(0.42);
  });

  it('returns 0.82 for months', () => {
    expect(timingScalePosition('months')).toBe(0.82);
  });

  it('returns 0.82 for years (falls through to months case)', () => {
    expect(timingScalePosition('years')).toBe(0.82);
  });

  it('returns 0.42 for an unrecognised unit (default branch)', () => {
    // Cast to any to exercise the unreachable default branch
    expect(timingScalePosition('unknown' as never)).toBe(0.42);
  });
});
