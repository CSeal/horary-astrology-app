# Feature: Ask Flow (Home → API → Verdict)

**Status:** Implemented (Stage 5c — Screens)
**Created by:** claude-sonnet (2026-05-26)

The core user journey: the user types a question, AstraSk captures their location and time, sends the request to astrology-api.io, and navigates to the Verdict screen. Every step from form submission to journal storage happens in a single React Query mutation.

---

## How it works

```
HomeScreen
  └─ AskForm (question text, submit button)
       └─ handleSubmit() → mutation.mutate(HoraryRequest)
            │
            ├─ withMinDuration(horaryApi.ask(request), 1500ms)
            │     └─ POST /horary/ask (axios, 3 retries, exp. backoff)
            │
            onSuccess:
            ├─ buildJournalEntry(request, response, city)
            ├─ questionsStore.addEntry(entry)       → AsyncStorage
            ├─ questionsStore.incrementMonthlyCount → AsyncStorage
            └─ router.replace('/result/<id>')
            
            onError:
            └─ router.back()  (error shown via Banner on HomeScreen)
```

---

## Source files

| File | Role |
|---|---|
| [src/app/(tabs)/index.tsx](../../src/app/(tabs)/index.tsx) | Home screen — wires AskForm → mutation |
| [src/components/AskForm.tsx](../../src/components/AskForm.tsx) | Question textarea, location row, submit button, counter |
| [src/hooks/useHoraryQuery.ts](../../src/hooks/useHoraryQuery.ts) | React Query `useMutation` — API call + side effects |
| [src/services/horaryApi.ts](../../src/services/horaryApi.ts) | Axios client for `POST /horary/ask` |
| [src/hooks/withMinDuration.ts](../../src/hooks/withMinDuration.ts) | Ensures loading spinner shows for at least 1.5s |
| [src/stores/questionsStore.ts](../../src/stores/questionsStore.ts) | Zustand store — journal entries + monthly counter |
| [src/app/(tabs)/result/[id].tsx](../../src/app/(tabs)/result/%5Bid%5D.tsx) | Verdict detail screen |
| [src/components/VerdictCard.tsx](../../src/components/VerdictCard.tsx) | YES/NO/MAYBE/UNCLEAR display card |
| [src/components/SignificatorRow.tsx](../../src/components/SignificatorRow.tsx) | Planet significator row |
| [src/types/horary.ts](../../src/types/horary.ts) | `HoraryRequest`, `HoraryResponse`, `HoraryAPIError` |
| [src/constants/config.ts](../../src/constants/config.ts) | `API_BASE_URL`, `LOADING_MIN_DURATION`, `MONTHLY_QUESTION_LIMIT` |

---

## API request / response

**Request — `HoraryRequest`:**
```ts
{
  question:  string;   // 5–280 chars, trimmed
  latitude:  number;   // from expo-location
  longitude: number;
  timezone:  string;   // IANA string via Intl.DateTimeFormat().resolvedOptions()
  timestamp: string;   // ISO 8601
}
```

**Response — `HoraryResponse`:**
```ts
{
  id:               string;
  verdict:          'YES' | 'NO' | 'MAYBE' | 'UNCLEAR';
  confidence_band:  'high' | 'medium' | 'low';
  summary:          string;
  significators:    SignificatorData[];
  voc_moon:         boolean;
  voc_treatment?:   string;
  chart_time:       string;
  location_display?: string;
}
```

**Error — `HoraryAPIError`:**
```ts
{
  code:           'NETWORK_ERROR' | 'API_4XX' | 'API_5XX' | 'TIMEOUT' | 'UNKNOWN';
  message:        string;
  retryable:      boolean;   // true for 5xx + NETWORK_ERROR only
  originalStatus?: number;
}
```

---

## Retry policy

| Condition | Retries | Back-off |
|---|---|---|
| 5xx server errors | 3 attempts | 1s / 2s / 4s exponential |
| Network error | 3 attempts | 1s / 2s / 4s exponential |
| 4xx client errors | 0 (no retry) | — |
| Timeout | 0 (no retry) | — |

Axios timeout: `API_TIMEOUT = 10 000ms`.

---

## Monthly question counter

`questionsStore` tracks `monthlyCount` (integer) and `lastResetDate` (ISO date string).

- Counter is **incremented AFTER** a successful API response — failed requests are not counted.
- `checkAndResetMonthlyCounter()` is called on store hydration. If the month has changed since `lastResetDate`, the counter resets to `0`.
- `MONTHLY_QUESTION_LIMIT = 5` (from `config.ts`). When reached, `HomeScreen` shows a dismissible warning banner; the `AskForm` submit button remains enabled (soft limit only).

---

## Minimum loading duration

`withMinDuration(promise, 1500)` wraps the API call. If the response arrives in under 1.5 s, the loading state is held for the remainder. This prevents a jarring instant flip and gives the planet animation time to appear.

---

## Location requirement

The submit button in `AskForm` is disabled until either GPS resolves or the user sets a manual override. If the user denies location permission:
- The home screen shows a `locationDenied` banner with a "Open Settings" link.
- The submit button remains disabled — **unless** the user picks a city via the location picker (see [location-override.md](location-override.md)).

The location row is tappable and opens a bottom sheet for manual city search. Override coordinates win over GPS, but **timezone always comes from the device** (`Intl` API) regardless of override state.

---

## Verdict screen

After `router.replace('/result/<id>')`, the Verdict screen:
1. Reads the journal entry by `id` from `questionsStore` (no second API call).
2. Renders `VerdictCard` (verdict + confidence + summary).
3. Shows void-of-course Moon banner if `voc_moon === true`.
4. Shows a low-confidence note if `confidence_band === 'low'`.
5. Lists all `significators` via `SignificatorRow` (planet, role, sign, house, dignity, retrograde, aspect).
6. Shows city name and formatted timestamp.

---

## Error states on Home screen

| Error code | Banner message |
|---|---|
| `NETWORK_ERROR` | `errors.noInternet` |
| `TIMEOUT` | `errors.timeout` |
| Everything else | `errors.apiError` |

Banners are dismissible. They are cleared (`setDismissedError(false)`) on each new submission.

---

## Navigation notes

- Uses `router.replace()` — not `router.push()` — so the Verdict screen is not stacked on top of Home. Back from Verdict goes to Journal (or Home if no back history).
- Uses `router.back()` on `onError` to return to Home and show the error banner.
