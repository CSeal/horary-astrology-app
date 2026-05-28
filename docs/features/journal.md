# Feature: Journal

**Status:** Implemented (Stage 5b + 5c)
**Created by:** claude-sonnet (2026-05-26)

The Journal persists every completed horary reading on-device and displays them grouped by month. Each entry is tappable (opens the full Verdict screen) and swipe-deletable.

---

## How it works

```
questionsStore (Zustand)
  └─ entries: JournalEntry[]   ← hydrated from AsyncStorage on boot
        │
        ├─ addEntry()          ← called by useHoraryQuery onSuccess
        ├─ deleteEntry()       ← called by JournalItem swipe or Alert
        └─ getEntryById()      ← called by ResultScreen to render verdict
        
AsyncStorage key: 'horary_journal'
Max entries: 500 (oldest auto-pruned on addEntry)
```

---

## Source files

| File | Role |
|---|---|
| [src/app/(tabs)/journal.tsx](../../src/app/(tabs)/journal.tsx) | Journal screen — groups entries by month, renders list |
| [src/components/JournalItem.tsx](../../src/components/JournalItem.tsx) | Swipeable card — shows question, verdict badge, date |
| [src/hooks/useJournal.ts](../../src/hooks/useJournal.ts) | CRUD hook wrapping `questionsStore` |
| [src/stores/questionsStore.ts](../../src/stores/questionsStore.ts) | Zustand store — source of truth for entries + monthly counter |
| [src/services/journalService.ts](../../src/services/journalService.ts) | AsyncStorage read/write/delete for `JournalEntry[]` |
| [src/types/journal.ts](../../src/types/journal.ts) | `JournalEntry` interface |

---

## Data model — `JournalEntry`

```ts
interface JournalEntry {
  id:              string;          // from API response
  question:        string;
  verdict:         VerdictType;     // 'YES' | 'NO' | 'MAYBE' | 'UNCLEAR'
  confidence_band: ConfidenceBand;  // 'high' | 'medium' | 'low'
  summary:         string;
  significators:   SignificatorData[];
  voc_moon:        boolean;
  voc_treatment?:  string;
  timestamp:       string;          // ISO 8601 (set at save time)
  city?:           string;
  latitude:        number;
  longitude:       number;
}
```

---

## Journal screen layout

Entries are sorted newest-first and grouped by calendar month. Each group shows a month header (e.g., `MAY 2026`) in gold uppercase, followed by `JournalItem` cards.

Empty state: Sparkles icon + "No readings yet." + "Ask a Question" CTA button.

---

## JournalItem

Each card shows:
- Question text (truncated to 2 lines)
- Verdict badge (`YES` / `NO` / `MAYBE` / `UNCLEAR`) with semantic color
- City name (if available) and date

**Interaction:**
- Tap → `router.push('/result/<id>')`
- Swipe left → reveals a red Delete action (via `ReanimatedSwipeable` from `react-native-gesture-handler`)

---

## Storage limits

- Maximum **500 entries** stored. When `addEntry` is called and the total would exceed 500, the oldest entries are pruned before writing.
- Storage key: `ASYNC_STORAGE_KEYS.JOURNAL = 'horary_journal'`
- Data format: JSON-serialized `JournalEntry[]`

---

## Zustand store shape

```ts
interface QuestionsStore {
  entries:        JournalEntry[];
  monthlyCount:   number;
  lastResetDate:  string;         // ISO date, e.g. '2026-05-01'

  hydrate():              Promise<void>;
  addEntry(e):            Promise<void>;
  deleteEntry(id):        Promise<void>;
  getEntryById(id):       JournalEntry | undefined;
  incrementMonthlyCount(): Promise<void>;
  checkAndResetMonthlyCounter(): Promise<void>;
}
```

`hydrate()` is called from root `_layout.tsx` before the splash hides. It:
1. Loads entries from AsyncStorage.
2. Calls `checkAndResetMonthlyCounter()` — resets `monthlyCount` if the month has changed.

---

## Delete flow

From `JournalItem` swipe → `deleteEntry(id)` → removes from `entries` array in store → persists updated array to AsyncStorage. The operation is optimistic at the store level and confirmed on write success.

---

## Accessing a reading

`getEntryById(id)` is a synchronous lookup on the in-memory `entries` array (no AsyncStorage round-trip). The Verdict screen (`result/[id].tsx`) calls this immediately on mount to populate the UI.
