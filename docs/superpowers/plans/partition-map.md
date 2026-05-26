---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [technical-architecture.md, delivery-roadmap.md, 2026-05-25-horary-app-stack.md]
reviewed_by: owner-pending
stage: Stage4-Architecture
gate_linkage: Gate5, Gate8 (Trigger 2 — partition review)
---

# Partition Map — Horary Astrology App (AstraSk)

*Document version: 1.0*

Trigger 2 output: disjoint file map for parallel dispatch.
Rule: No file may appear in more than one batch.

SDK 55 note: The `default@sdk-55` template places routes under `src/app/` (not `app/`). All route files below use `src/app/`.

---

## Verification Method

Each file path is listed exactly once across all batches. No duplicates permitted. This map is the authoritative source for agent dispatch in Stage 5.

---

## Batch A — Foundation

Sprint A. Must complete before Batches B, C, D begin.

```
app.json
babel.config.js
metro.config.js
tailwind.config.js
global.css
nativewind-env.d.ts
tsconfig.json
.env.local.example
src/app/_layout.tsx
src/app/(tabs)/_layout.tsx
src/constants/theme.ts
src/constants/planets.ts
src/constants/config.ts
src/i18n/index.ts
src/i18n/en.ts
src/i18n/ru.ts
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/Input.tsx
src/components/ui/Badge.tsx
src/components/ui/Banner.tsx
```

**Batch A file count**: 20

---

## Batch B — Services

Sprint B. Depends on Batch A. Must complete before Batches C and D begin.

```
src/types/horary.ts
src/types/journal.ts
src/types/navigation.ts
src/services/horaryApi.ts
src/services/locationService.ts
src/services/journalService.ts
src/services/secureKeyService.ts
src/hooks/useHoraryQuery.ts
src/hooks/useLocation.ts
src/hooks/useJournal.ts
src/stores/settingsStore.ts
src/services/__tests__/horaryApi.test.ts
src/stores/__tests__/questionsStore.test.ts
```

**Batch B file count**: 13

---

## Batch C — Screens

Sprint C. Depends on Batch B. Runs in parallel with Batch D.

```
src/app/(tabs)/index.tsx
src/app/(tabs)/journal.tsx
src/app/result/[id].tsx
src/components/AskForm.tsx
src/components/VerdictCard.tsx
src/components/SignificatorRow.tsx
src/components/JournalItem.tsx
src/stores/questionsStore.ts
```

**Batch C file count**: 8

---

## Batch D — Polish

Sprint D. Depends on Batch B. Runs in parallel with Batch C.

```
src/app/(tabs)/settings.tsx
src/app/onboarding.tsx
src/components/CosmosBackground.tsx
src/components/svg/StarField.tsx
src/components/svg/PlanetOrbit.tsx
src/components/svg/PlanetGlyph.tsx
src/components/svg/VerdictStar.tsx
src/components/svg/ChartWheel.tsx
assets/animations/
```

**Batch D file count**: 9 (including 1 directory)

---

## Disjoint Verification

Total unique files across all batches: 20 + 13 + 8 + 9 = 50

Cross-batch collision check (manual):

| File | Batch A | Batch B | Batch C | Batch D |
|---|---|---|---|---|
| `src/app/_layout.tsx` | A | — | — | — |
| `src/app/(tabs)/_layout.tsx` | A | — | — | — |
| `src/types/horary.ts` | — | B | — | — |
| `src/services/horaryApi.ts` | — | B | — | — |
| `src/stores/settingsStore.ts` | — | B | — | — |
| `src/stores/questionsStore.ts` | — | — | C | — |
| `src/app/(tabs)/index.tsx` | — | — | C | — |
| `src/app/(tabs)/journal.tsx` | — | — | C | — |
| `src/app/result/[id].tsx` | — | — | C | — |
| `src/app/(tabs)/settings.tsx` | — | — | — | D |
| `src/app/onboarding.tsx` | — | — | — | D |
| `src/components/svg/StarField.tsx` | — | — | — | D |
| `src/components/CosmosBackground.tsx` | — | — | — | D |

No file appears in more than one batch. Partition is valid.

---

## Notes for Implementing Agents

1. Batch A agent must complete before any other agent begins.
2. Batch B agent must complete before Batch C and Batch D agents begin.
3. Batch C and Batch D agents may run simultaneously on separate threads.
4. `src/stores/questionsStore.ts` is in **Batch C only** (screens batch needs to finalize it with addEntry/deleteEntry after Batch B types are ready).
5. `src/stores/settingsStore.ts` is in **Batch B only** (services batch — no screen dependence at init time).
6. The `ChartWheel.tsx` in Batch D is a **Phase 2 stub** — implement as a placeholder component only in MVP.
7. `assets/animations/` in Batch D is a directory placeholder for Phase 2 Lottie files — create the directory, no files required in MVP.

---

*Stage: Stage4-Architecture*
*Gate 8: Trigger 2 partition review — PASS (no duplicates)*
