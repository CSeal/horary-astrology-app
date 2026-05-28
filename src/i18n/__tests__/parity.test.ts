// src/i18n/__tests__/parity.test.ts
// Locks in the invariant that en.ts and ru.ts stay structurally identical:
// same key set, no untranslated placeholders, and matching {{interpolation}}
// tokens. This silently breaks on the next string edit without a test.

import en from '@/i18n/en';
import ru from '@/i18n/ru';

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
const flatRu = flatten(ru as unknown as Dict);

describe('i18n parity (en ↔ ru)', () => {
  it('has identical key sets in both directions', () => {
    const enKeys = Object.keys(flatEn).sort();
    const ruKeys = Object.keys(flatRu).sort();
    const missingInRu = enKeys.filter((k) => !(k in flatRu));
    const missingInEn = ruKeys.filter((k) => !(k in flatEn));
    expect(missingInRu).toEqual([]);
    expect(missingInEn).toEqual([]);
  });

  it('has no empty string values', () => {
    const emptyEn = Object.entries(flatEn).filter(([, v]) => v.trim() === '');
    const emptyRu = Object.entries(flatRu).filter(([, v]) => v.trim() === '');
    expect(emptyEn).toEqual([]);
    expect(emptyRu).toEqual([]);
  });

  it('uses identical {{placeholder}} tokens for every shared key', () => {
    const mismatches = Object.keys(flatEn)
      .filter((k) => k in flatRu)
      .filter(
        (k) =>
          JSON.stringify(placeholders(flatEn[k])) !==
          JSON.stringify(placeholders(flatRu[k]))
      );
    expect(mismatches).toEqual([]);
  });
});
