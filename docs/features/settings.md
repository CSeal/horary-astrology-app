# Feature: Settings

**Status:** Implemented (Stage 5d — Polish)
**Created by:** claude-sonnet (2026-05-26)

The Settings screen lets users switch language, view their timezone and usage counter, and manage their personal astrology-api.io API key.

---

## Source files

| File | Role |
|---|---|
| [src/app/(tabs)/settings.tsx](../../src/app/(tabs)/settings.tsx) | Settings screen UI |
| [src/stores/settingsStore.ts](../../src/stores/settingsStore.ts) | Zustand: locale + API key source |
| [src/stores/questionsStore.ts](../../src/stores/questionsStore.ts) | Zustand: monthly counter |
| [src/services/secureKeyService.ts](../../src/services/secureKeyService.ts) | SecureStore wrapper for API key |
| [src/constants/config.ts](../../src/constants/config.ts) | `MONTHLY_QUESTION_LIMIT`, `SUPPORTED_LOCALES` |

---

## Sections

### Language

Segmented EN / RU toggle. On tap:
```ts
await settingsStore.setLocale(newLocale);  // writes to AsyncStorage
await i18n.changeLanguage(newLocale);      // updates all UI immediately
```

Both calls happen in parallel. The UI re-renders instantly because `i18n.changeLanguage` is synchronous on the translation side.

### Timezone

Read-only display. Value:
```ts
Intl.DateTimeFormat().resolvedOptions().timeZone   // e.g. "Europe/Moscow"
```

Not persisted — always read fresh from the device at render time. This is the same value captured at question-submission time.

### API Key

Users can provide their own `astrology-api.io` key to bypass the app default (useful for testing or higher limits).

**Flow:**
- Text input (secure entry style)
- "Save Key" button → `secureKeyService.setKey(key)` → updates `settingsStore.apiKeySource = 'personal'`
- "Remove key" link → `secureKeyService.deleteKey()` → `settingsStore.apiKeySource = 'default'`
- Source indicator below input: "Using: personal key" or "Using: app default"

The key is stored in Expo SecureStore (`SECURE_STORE_KEY_API = 'horary_api_key'`), never in AsyncStorage or logs.

### Usage Counter

Progress bar showing `monthlyCount / MONTHLY_QUESTION_LIMIT`.

```
Questions this month: 3 / 5
[████████░░]
Resets June 1
```

- Bar fill width is calculated as a percentage inline style (dynamic width cannot use Tailwind arbitrary values without tree-shaking risk).
- Reset date is the first day of next month, formatted using the current locale.
- `monthlyCount` comes from `questionsStore`; resets automatically on month boundary.

---

## settingsStore shape

```ts
interface SettingsStore {
  locale:        SupportedLocale;     // 'en' | 'ru'
  apiKeySource:  'personal' | 'default';

  hydrate():              Promise<void>;  // loads locale from AsyncStorage
  setLocale(l):           Promise<void>;  // saves + updates i18n
}
```

`apiKeySource` is derived at hydration time by checking `secureKeyService.getKey()` — not separately persisted.

---

## secureKeyService

```ts
secureKeyService.setKey(key: string): Promise<void>
secureKeyService.getKey(): Promise<string | null>
secureKeyService.deleteKey(): Promise<void>
```

Wraps `expo-secure-store` with the key name `'horary_api_key'`. The key name is defined in `config.ts` as `SECURE_STORE_KEY_API`.

---

## API key priority (in horaryApi.ts interceptor)

```
SecureStore('horary_api_key')
  → process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY
  → empty string (will 401)
```

The interceptor reads SecureStore on every request (async). If a personal key is stored, it takes priority over the app default env var.
