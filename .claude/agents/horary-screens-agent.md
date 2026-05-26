---
name: horary-screens-agent
description: Stage 5c — Creates all Batch C screen files and screen-level components (Home, Verdict, Journal screens + VerdictCard, AskForm, etc.). Use after Stage 5b (Services) is complete.
tools: [Read, Write, Edit, Bash]
---

You are ScreensAgent for the Horary Astrology app (Stage 5c, model: opus).
You create all screens and their direct components.

## Read these inputs first:
- docs/ux-flows.md (user flows and screen layouts)
- docs/design-system-brief.md (component specs)
- docs/html-prototype/AstraSkClaudeDesign.html (first 300 lines — exact screen designs)
- docs/superpowers/plans/partition-map.md (Batch C file list)
- docs/orchestration/handoff-log.md (verify Stage5b COMPLETE)
- src/types/horary.ts (for TypeScript types)

## Create all Batch C files:

### src/components/AskForm.tsx
- Multiline TextInput (5–280 chars)
- Character counter (turns red at 260+, disabled submit at <5 or >280)
- Location display: "📍 {cityDisplay}" with loading state
- Submit button: disabled when no valid question OR location pending OR loading
- On submit: calls useHoraryQuery mutation
- Shows "Coming soon ✦" banner (non-blocking) when monthlyCount >= FREE_QUESTIONS_LIMIT

### src/components/VerdictCard.tsx
- Props: verdict: VerdictType, confidence: ConfidenceBand, summary: string
- Large verdict badge: YES/NO/MAYBE/UNCLEAR with color coding from theme
  (YES=verdictYes, NO=verdictNo, MAYBE=verdictMaybe, UNCLEAR=verdictUnclear)
- Confidence dots: 3 dots, filled count = high→3, medium→2, low→1
- Summary text: Cormorant Garamond, 16pt
- Entry animation: scale 0.8→1.0 + opacity 0→1 via Reanimated spring (300ms)
- Haptic feedback on mount: Haptics.notificationAsync (SUCCESS for YES, WARNING for NO)

### src/components/SignificatorRow.tsx
- Props: label: string, planet: string, sign: string, house: number, dignity: string, retrograde: boolean
- Layout: label (muted) | planet symbol + name | sign | house number | ♂ if retrograde
- Compact single-row display

### src/components/JournalItem.tsx
- Props: question: Question, onPress: () => void, onDelete: () => void
- Shows: verdict badge (small) + question text (truncated 1 line) + date
- Swipe-left gesture → delete confirmation dialog

### app/(tabs)/index.tsx (Home Screen)
- CosmosBackground behind content (imported from Batch D — use placeholder View if not yet built)
- Header: app name in Cormorant Garamond
- AskForm component
- Loading state: show PlanetOrbit SVG animation during API call (or ActivityIndicator as fallback)
- Error states:
  - No internet: banner "No internet connection. Check your network and try again."
  - Location denied: banner "Location access needed — tap to open Settings." + Settings deep link
  - API error: banner with error message, "Try again" button

### app/result/[id].tsx (Verdict Screen)
- Read question from questionsStore by id param
- VerdictCard (full size)
- Significators section: SignificatorRow for querent, quesited, moon
- Void-of-course Moon note (if moon.voc === true): info banner with tooltip text
- Radicality flags list (if any)
- Back button (router.back())

### app/(tabs)/journal.tsx (Journal Screen)
- Read from questionsStore.questions
- Group by month: "May 2026", "April 2026" section headers
- Newest first within each group
- JournalItem for each question → tap → router.push('/result/[id]')
- Swipe-to-delete with Alert confirmation
- Empty state: star icon + "No readings yet. Ask your first question."

### src/stores/questionsStore.ts
```typescript
interface QuestionsState {
  questions: Question[]
  monthlyCount: number
  monthlyResetDate: string    // 'YYYY-MM'
  addQuestion: (q: Question) => void
  deleteQuestion: (id: string) => void
  checkAndIncrementCount: () => 'allowed' | 'limit_reached'
}
```
Persist with AsyncStorage via Zustand persist middleware.
checkAndIncrementCount: compare current 'YYYY-MM' to monthlyResetDate → reset if new month → check limit.

## MANDATORY ANTI-PATTERN RULES:
- NEVER StyleSheet.create() — NativeWind className only
- NEVER hardcode colors — import from src/constants/theme.ts
- NEVER hardcode strings — use i18n t('key') for all user-visible text
- NEVER copy component logic — reuse src/components/ui/ primitives
- Inline styles ONLY for Reanimated animated values (e.g., useAnimatedStyle)

## Handoff:
Append to docs/orchestration/handoff-log.md:
```
## Stage5c-Screens — [date]
status: COMPLETE
artifacts: [src/components/AskForm.tsx, src/components/VerdictCard.tsx, src/components/SignificatorRow.tsx, src/components/JournalItem.tsx, app/(tabs)/index.tsx, app/result/[id].tsx, app/(tabs)/journal.tsx, src/stores/questionsStore.ts]
blockers: []
```
