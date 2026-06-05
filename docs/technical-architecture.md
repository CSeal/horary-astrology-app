---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [prd-v1.md, design-system-brief.md, 2026-05-25-horary-app-stack.md, mvp-scope.md]
reviewed_by: owner-pending
stage: Stage4-Architecture
gate_linkage: Gate5
---

# Technical Architecture — Horary Astrology App (Hora)

*Document version: 1.0*
*SDK: Expo SDK 55 / React Native 0.83*

---

## 1. Overview

Hora is a mobile-first horary astrology application targeting iOS and Android. The architecture prioritizes:

- **Offline-first local data** — journal and settings persisted on device (AsyncStorage + SecureStore)
- **Single remote integration** — astrology-api.io (horary chart casting + AI summary)
- **Type-safe throughout** — TypeScript strict mode, no `any`, typed API contracts
- **NativeWind styling** — zero `StyleSheet.create()`, all className-based
- **File-based routing** — Expo Router (SDK 55) with `src/app/` route directory

---

## 2. Full File Tree

```
/
├── app.json                        ← Expo config (scheme, plugins, infoPlist, permissions)
├── babel.config.js                 ← Expo preset + nativewind/babel (reanimated plugin last)
├── metro.config.js                 ← withNativeWind wrapper, global.css input
├── tailwind.config.js              ← NativeWind/Tailwind v3 config, content paths
├── global.css                      ← @tailwind base/components/utilities
├── nativewind-env.d.ts             ← triple-slash NativeWind TS reference
├── tsconfig.json                   ← strict: true, paths alias @/*→src/*
├── .env.local.example              ← EXPO_PUBLIC_ASTROLOGY_API_KEY=your_key_here
│
├── src/
│   ├── app/                        ← Expo Router file-based routes (SDK 55 default@sdk-55 layout)
│   │   ├── _layout.tsx             ← Root layout: QueryClientProvider, i18n init, fonts, splash
│   │   ├── onboarding.tsx          ← First-run onboarding (full-screen stack, no tab bar)
│   │   └── (tabs)/
│   │       ├── _layout.tsx         ← Tab navigator: Home (Sparkles), Journal (BookOpen)
│   │       ├── index.tsx           ← Home screen (question input, location, counter)
│   │       ├── journal.tsx         ← Journal screen (grouped by month, swipe-delete)
│   │       ├── settings.tsx        ← Settings screen (lang toggle, API key, counter)
│   │       └── result/
│   │           └── [id].tsx        ← Verdict detail screen (read from questionsStore by id)
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx          ← Primary / Secondary / Destructive variants
│   │   │   ├── Card.tsx            ← Base surface card (bg-card, rounded-xl)
│   │   │   ├── Input.tsx           ← TextInput with character counter, focus ring
│   │   │   ├── Badge.tsx           ← Verdict badge (YES/NO/MAYBE/UNCLEAR), confidence badge
│   │   │   └── Banner.tsx          ← Error / warning inline banner
│   │   │
│   │   ├── AskForm.tsx             ← Question TextInput + submit button composite
│   │   ├── VerdictCard.tsx         ← Verdict type + glow card + confidence dots
│   │   ├── SignificatorRow.tsx     ← Planet row (symbol, name, role, sign/house, dignity)
│   │   ├── JournalItem.tsx         ← Journal entry card with left-border verdict color
│   │   ├── CosmosBackground.tsx    ← Animated star field (60 particles, pulse + drift)
│   │   │
│   │   └── svg/
│   │       ├── StarField.tsx       ← SVG star particle layer
│   │       ├── PlanetOrbit.tsx     ← Elliptical orbit animation (loading screen)
│   │       ├── PlanetGlyph.tsx     ← Planet symbol SVG (Sun ☉, Moon ☽, etc.)
│   │       ├── VerdictStar.tsx     ← Animated ✦ star reveal on verdict
│   │       └── ChartWheel.tsx      ← Phase 2 placeholder — house wheel SVG (stub only in MVP)
│   │
│   ├── hooks/
│   │   ├── useHoraryQuery.ts       ← useMutation wrapping horaryApi.ask(); saves to journal
│   │   ├── useLocation.ts          ← expo-location wrapper; returns {city, lat, lng, timezone}
│   │   └── useJournal.ts           ← questionsStore selectors + delete/clear helpers
│   │
│   ├── stores/
│   │   ├── settingsStore.ts        ← Zustand: locale, apiKeySource; hydrated from AsyncStorage
│   │   └── questionsStore.ts       ← Zustand: monthlyCount, monthlyResetDate, entries[]
│   │
│   ├── services/
│   │   ├── horaryApi.ts            ← Axios instance + POST /horary/ask + retry logic
│   │   ├── locationService.ts      ← expo-location abstraction (requestForeground, getPosition)
│   │   ├── journalService.ts       ← AsyncStorage CRUD (key: horary_journal)
│   │   └── secureKeyService.ts     ← SecureStore get/set/delete for horary_api_key
│   │
│   ├── i18n/
│   │   ├── index.ts                ← i18next init: lng detection, fallback 'en', resources
│   │   ├── en.ts                   ← English string map (namespace: translation)
│   │   └── ru.ts                   ← Russian string map (namespace: translation)
│   │
│   ├── constants/
│   │   ├── theme.ts                ← All color tokens, typography scale, spacing (re-export)
│   │   ├── planets.ts              ← Planet glyph map, name map (☉ Sun, ☽ Moon, ♂ Mars…)
│   │   └── config.ts               ← API base URL, timeout, monthly limit, AsyncStorage keys
│   │
│   └── types/
│       ├── horary.ts               ← HoraryRequest, HoraryResponse, VerdictType, ConfidenceBand,
│       │                              SignificatorData, HoraryAPIError
│       ├── journal.ts              ← JournalEntry (id, question, verdict, timestamp, …)
│       └── navigation.ts           ← Route param types (ResultParams)
│
├── assets/
│   ├── fonts/                      ← Cormorant Garamond (400, 500, 700), Inter (400, 500, 600)
│   ├── images/                     ← App icon, splash, adaptive-icon
│   └── animations/                 ← Lottie JSON placeholders (Phase 2)
│
└── docs/                           ← All architecture and governance documents
    ├── technical-architecture.md
    ├── api-integration-spec.md
    ├── quality-gates.md
    ├── delivery-roadmap.md
    └── orchestration/
        └── handoff-log.md
```

---

## 3. Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INPUT FLOW                              │
│                                                                     │
│  AskForm (Home screen)                                              │
│      │                                                              │
│      │ question text (5–280 chars)                                  │
│      ▼                                                              │
│  useHoraryQuery (useMutation)                                       │
│      │                                                              │
│      │ builds HoraryRequest { question, lat, lng, timezone, ts }   │
│      ▼                                                              │
│  horaryApi.ask(request)          ← Axios instance                  │
│      │    ↑                                                         │
│      │    └── API key from SecureStore or EXPO_PUBLIC env var       │
│      │                                                              │
│      │ POST /horary/ask → astrology-api.io                         │
│      │                                                              │
│      ▼                                                              │
│  HoraryResponse { verdict, confidence, summary, significators, … } │
│      │                                                              │
│      ├──▶ questionsStore.addEntry(journalEntry)                     │
│      │         └── AsyncStorage.setItem('horary_journal', …)       │
│      │                                                              │
│      ├──▶ questionsStore.incrementMonthlyCount()                    │
│      │         └── AsyncStorage.setItem('horary_question_count', …)│
│      │                                                              │
│      └──▶ router.replace('/result/[id]')                            │
│               └── VerdictCard renders response data                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Error paths:
  NetworkError  → router.back() + Banner "No internet connection"
  APIError 4xx  → router.back() + Banner (API message or generic)
  APIError 5xx  → router.back() + Banner + retry up to 3 attempts
  TimeoutError  → router.back() + Banner "Server took too long…"
```

---

## 4. State Management

### 4.1 Zustand Stores

All stores use `import { create } from 'zustand'` (named export, Zustand v5).

#### settingsStore (`src/stores/settingsStore.ts`)

```typescript
interface SettingsState {
  locale: 'en' | 'ru';
  apiKeySource: 'personal' | 'default';
  setLocale: (locale: 'en' | 'ru') => void;
  setApiKeySource: (source: 'personal' | 'default') => void;
  hydrate: () => Promise<void>;  // loads from AsyncStorage on boot
}
```

Persistence: locale saved to `AsyncStorage` under `horary_language`. Hydrated in root `_layout.tsx` before rendering.

#### questionsStore (`src/stores/questionsStore.ts`)

```typescript
interface QuestionsState {
  entries: JournalEntry[];
  monthlyCount: number;
  monthlyResetDate: string;  // 'YYYY-MM' format
  addEntry: (entry: JournalEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  incrementMonthlyCount: () => Promise<void>;
  checkAndResetMonthlyCounter: () => Promise<void>;
  hydrate: () => Promise<void>;
}
```

Monthly counter logic:
- On app open, call `checkAndResetMonthlyCounter()`
- Compare current `'YYYY-MM'` against stored `monthlyResetDate`
- If different month: reset `monthlyCount = 0`, update `monthlyResetDate`
- AsyncStorage keys: `horary_question_count`, `horary_question_reset_date`, `horary_journal`

### 4.2 React Query (Server State)

Used exclusively via `useMutation` for the horary API call. No `useQuery` for this flow — the operation is a write (POST), not a read.

```typescript
// src/hooks/useHoraryQuery.ts
const useHoraryQuery = () => {
  return useMutation({
    mutationFn: (request: HoraryRequest) => horaryApi.ask(request),
    onSuccess: (data, variables) => {
      // 1. build JournalEntry from data + variables
      // 2. questionsStore.addEntry(entry)
      // 3. questionsStore.incrementMonthlyCount()
      // 4. router.replace(`/result/${entry.id}`)
    },
    onError: (error: HoraryAPIError) => {
      // router.back() then show error banner
    },
  });
};
```

`QueryClientProvider` is mounted in `src/app/_layout.tsx` wrapping all routes.

---

## 5. Navigation Structure

Expo Router file-based routing (SDK 55). Route files live under `src/app/`.

```
src/app/
├── _layout.tsx          ← Stack (root) — QueryClientProvider, i18n, fonts
├── onboarding.tsx       ← stack screen, no tab bar, shown once on first launch
└── (tabs)/
    ├── _layout.tsx      ← Tabs: index (Home/Sparkles), journal (BookOpen), settings (Settings)
    ├── index.tsx        ← Home — ask question, location row, monthly counter
    ├── journal.tsx      ← Journal — grouped entries, swipe-delete
    ├── settings.tsx     ← Settings — lang toggle, API key, counter display
    └── result/
        └── [id].tsx     ← Verdict detail — reads entry from questionsStore by id
```

Navigation patterns:
- **Home → Loading state**: loading is an inline state within `useHoraryQuery` (not a separate screen route). The AskForm renders a loading overlay while `isPending === true`.
- **Home → Verdict**: `router.replace('/result/' + entry.id)` after successful mutation
- **Verdict → Home**: `router.back()` (returns to tab navigator)
- **Onboarding → Home**: `router.replace('/(tabs)')` after completing onboarding
- **Journal entry → Verdict**: `router.push('/result/' + entry.id)` (read-only)

Route parameters:
```typescript
// src/types/navigation.ts
export type ResultParams = {
  id: string;
};
```

---

## 6. Localization

Library: `i18next` + `react-i18next`. Default locale: `'en'`. Fallback locale: `'en'`.

**Do NOT use i18n-js.** The chosen library is i18next, which supports runtime language switching without app restart, namespace support, and React hooks (`useTranslation`).

Init (`src/i18n/index.ts`):
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import ru from './ru';

i18n.use(initReactI18next).init({
  lng: 'en',          // overridden from settingsStore on boot
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  interpolation: { escapeValue: false },
});
```

Language switch (immediate, no restart):
```typescript
i18n.changeLanguage('ru');  // called from Settings screen
```

All JSX string content uses `t('key')` — no hardcoded strings in components.

---

## 7. API Client Architecture

Full spec in `docs/api-integration-spec.md`. Summary:

- **Axios instance**: `src/services/horaryApi.ts`
- **Base URL**: `https://astrology-api.io`
- **Timeout**: 10,000ms
- **Auth**: `Authorization: Bearer <key>` injected via request interceptor
- **API key priority**: `SecureStore('horary_api_key')` → `process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY`
- **Retry**: 3 attempts, exponential backoff (1s, 2s, 4s), 5xx and network errors only

---

## 8. Error Handling Strategy

All API errors are normalized to `HoraryAPIError`:

```typescript
interface HoraryAPIError {
  code: 'NETWORK_ERROR' | 'API_4XX' | 'API_5XX' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
  retryable: boolean;
  originalStatus?: number;
}
```

Error handling tiers:
1. **NetworkError** (no connectivity): non-retryable, show banner immediately
2. **TimeoutError** (>10s): non-retryable, show specific timeout message
3. **APIError 4xx**: non-retryable (client error), show API message or generic fallback
4. **APIError 5xx**: retryable, automatic retry up to 3× with backoff; if all fail, show banner
5. **AsyncStorage failure**: log error, display empty-state UI, no crash
6. **SecureStore failure**: fall back to env var, log warning, no crash

---

## 9. Security and Secrets

| Concern | Approach |
|---|---|
| API key at rest | `expo-secure-store` (`AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`) |
| API key in transit | `Authorization: Bearer` header (HTTPS only) |
| API key in code | NEVER committed — env var `EXPO_PUBLIC_ASTROLOGY_API_KEY` only |
| Journal data | Device-local AsyncStorage, no cloud sync in MVP |
| Location data | Used per-request only; city + coords saved in journal entry per question |
| No analytics | No third-party analytics SDK in MVP |
| No crash reporter | Sentry deferred to Phase 2 |

---

## 10. Styling Rules

- Zero `StyleSheet.create()` — all styling via NativeWind `className` props
- All colors via `src/constants/theme.ts` tokens — no inline hex values
- All strings via `t('key')` — no hardcoded JSX strings
- SVG colors always reference `theme.ts` — never inline in SVG components
- TypeScript: `strict: true` — no `any` types anywhere

---

## 11. Font Loading

Fonts loaded in `src/app/_layout.tsx` via `expo-font` before rendering:

```typescript
const [fontsLoaded] = useFonts({
  'CormorantGaramond-Regular': require('../assets/fonts/CormorantGaramond-Regular.ttf'),
  'CormorantGaramond-Medium': require('../assets/fonts/CormorantGaramond-Medium.ttf'),
  'CormorantGaramond-Bold': require('../assets/fonts/CormorantGaramond-Bold.ttf'),
  'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
  'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
  'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
});
```

Only load weights actually used — no full-family loads (bundle-size cost).

---

## 12. Platform Targets

- iOS (primary): iOS 16+
- Android: Android 12+ (API 31+)
- Web: NOT supported — no web platform config, API key storage uses SecureStore (not localStorage)

---

*Stage: Stage4-Architecture*
*Gate 5: Architecture, test strategy, roadmap — PASS*
*Gate 6: Provenance confirms Claude-only edits — PASS*
