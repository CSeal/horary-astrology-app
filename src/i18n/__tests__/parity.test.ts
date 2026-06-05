// src/i18n/__tests__/parity.test.ts
// Locks in the invariant that all language files stay structurally identical
// to en.ts: same key set, no empty values, and matching {{interpolation}} tokens.

import en from '@/i18n/en';
import ru from '@/i18n/ru';
import uk from '@/i18n/uk';
import de from '@/i18n/de';
import fr from '@/i18n/fr';
import pt from '@/i18n/pt';
import es from '@/i18n/es';

type Dict = Record<string, unknown>;

/** Flatten a nested string map into dot-path → value pairs. */
function flatten(obj: Dict, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') {
      Object.assign(out, flatten(value as Dict, path));
    } else {
      out[path] = String(value);
    }
  }
  return out;
}

/** Extract sorted {{placeholder}} tokens from a string. */
function placeholders(value: string): string[] {
  return (value.match(/\{\{(.*?)\}\}/g) ?? []).sort();
}

const flatEn = flatten(en as unknown as Dict);

const LOCALES = [
  { code: 'ru', flat: flatten(ru as unknown as Dict) },
  { code: 'uk', flat: flatten(uk as unknown as Dict) },
  { code: 'de', flat: flatten(de as unknown as Dict) },
  { code: 'fr', flat: flatten(fr as unknown as Dict) },
  { code: 'pt', flat: flatten(pt as unknown as Dict) },
  { code: 'es', flat: flatten(es as unknown as Dict) },
];

describe('i18n parity (all locales ↔ en)', () => {
  it('has identical key sets in both directions', () => {
    const enKeys = Object.keys(flatEn).sort();
    for (const { code, flat } of LOCALES) {
      const keys = Object.keys(flat).sort();
      const missingInLocale = enKeys.filter((k) => !(k in flat));
      const missingInEn = keys.filter((k) => !(k in flatEn));
      expect({ code, missingInLocale }).toEqual({ code, missingInLocale: [] });
      expect({ code, missingInEn }).toEqual({ code, missingInEn: [] });
    }
  });

  it('has no empty string values', () => {
    for (const { code, flat } of LOCALES) {
      const empty = Object.entries(flat).filter(([, v]) => v.trim() === '');
      expect({ code, empty }).toEqual({ code, empty: [] });
    }
  });

  it('uses identical {{placeholder}} tokens for every shared key', () => {
    for (const { code, flat } of LOCALES) {
      const mismatches = Object.keys(flatEn)
        .filter((k) => k in flat)
        .filter(
          (k) =>
            JSON.stringify(placeholders(flatEn[k])) !==
            JSON.stringify(placeholders(flat[k]))
        );
      expect({ code, mismatches }).toEqual({ code, mismatches: [] });
    }
  });
});
