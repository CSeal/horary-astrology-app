---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [CLAUDE.md, project-brief.md, competitor-research.md, design-system-brief.md]
reviewed_by: owner-pending
---

# Orchestration Plan — Horary Astrology App

## How to use

```bash
/orchestrate-status        # see which stages are done
/orchestrate-stage4        # run Architecture + Expo init
/orchestrate-stage5        # run all 4 implementation batches
/orchestrate-stage6        # run QA + demo readiness
```

Each command reads `handoff-log.md` for state, calls the appropriate sub-agent, and reports results.

---

## Orchestration Map

```
Stage 1: ResearchAgent      ✅ COMPLETE — Gate 1 + Gate 2
Stage 2: PRDAgent           ✅ COMPLETE — Gate 3
Stage 3: DesignAgent        ✅ COMPLETE — Gate 4
Stage 4: ArchitectureAgent  ⏳ PENDING  — Gate 5 + Gate 6  ← Expo init
Stage 5: ImplementAgent     ⏳ PENDING  — Gate 7 + Gate 8
  5a: Foundation (A) ──────────────────────────────→ then
  5b: Services   (B) ──────────────────────────────→ then
  5c: Screens    (C) ──────────────────────┐
  5d: Polish     (D) ──────────────────────┘ (C ∥ D)
Stage 6: QADemoAgent        ⏳ PENDING  — demo readiness
```

---

## Agent Files

| Stage | Command | Agent file | Model |
|---|---|---|---|
| 4 | `/orchestrate-stage4` | `.claude/agents/horary-architecture-agent.md` | sonnet |
| 5a | via `/orchestrate-stage5` | `.claude/agents/horary-foundation-agent.md` | opus |
| 5b | via `/orchestrate-stage5` | `.claude/agents/horary-services-agent.md` | opus |
| 5c | via `/orchestrate-stage5` | `.claude/agents/horary-screens-agent.md` | opus |
| 5d | via `/orchestrate-stage5` | `.claude/agents/horary-polish-agent.md` | opus |
| 6 | `/orchestrate-stage6` | `.claude/agents/horary-qa-agent.md` | sonnet |

---

## Partition Map (Trigger 2)

**Batch A — Foundation** (Stage 5a):
`app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app.json`, `tailwind.config.js`,
`src/constants/theme.ts`, `src/constants/planets.ts`, `src/constants/config.ts`,
`src/i18n/en.ts`, `src/i18n/ru.ts`,
`src/components/ui/Button.tsx`, `Card.tsx`, `Input.tsx`, `Badge.tsx`

**Batch B — Services** (Stage 5b):
`src/types/horary.ts`, `src/services/horaryApi.ts`, `src/services/locationService.ts`,
`src/hooks/useHoraryQuery.ts`, `src/hooks/useLocation.ts`, `src/stores/settingsStore.ts`

**Batch C — Screens** (Stage 5c, parallel with D):
`app/(tabs)/index.tsx`, `app/result/[id].tsx`, `app/(tabs)/journal.tsx`,
`src/components/AskForm.tsx`, `src/components/VerdictCard.tsx`,
`src/components/SignificatorRow.tsx`, `src/components/JournalItem.tsx`,
`src/stores/questionsStore.ts`

**Batch D — Polish** (Stage 5d, parallel with C):
`app/settings.tsx`, `app/onboarding.tsx`, `src/components/CosmosBackground.tsx`,
`src/components/svg/StarField.tsx`, `PlanetOrbit.tsx`, `PlanetGlyph.tsx`,
`VerdictStar.tsx`, `ChartWheel.tsx`,
`src/components/ui/ErrorBanner.tsx`, `EmptyState.tsx`, `SkeletonItem.tsx`

---

## Model Routing

| Agent type | Model | Reason |
|---|---|---|
| Architecture, QA | `sonnet` | Planning and analysis |
| All Stage 5 coding | `opus` | claude-opus-4-7, best for implementation |

---

## Anti-Pattern Rules (Gate 7 enforcement)

```
FORBIDDEN:
  StyleSheet.create()       → NativeWind className only
  Hardcoded hex colors      → src/constants/theme.ts
  Hardcoded strings in JSX  → i18n t('key')
  TypeScript `any`          → proper types in src/types/
  Component copy-paste      → extract to src/components/ui/
  Direct AsyncStorage calls → via Zustand stores only
  Direct SecureStore calls  → via settingsStore only

SVG RULES:
  Colors via props from theme.ts — never inline
  Sizes via props — never hardcoded px
  StarField only via CosmosBackground — never in screens directly
```

---

## Design References

- Design system: `docs/design-system-brief.md`
- HTML prototype: `docs/html-prototype/index.html`
- Claude Design export (22 screens): `docs/html-prototype/AstraSkClaudeDesign.html`

**Cosmos Dark palette:**
```
bgBase:        #070714    bgSurface: #12102A    bgCard:   #1C1940
accentGold:    #F5C842    accentViolet: #8B5CF6
textPrimary:   #F0EEFF    textMuted: #9B93B8
verdictYes:    #22D3A4    verdictNo: #F87171
verdictMaybe:  #FBBF24    verdictUnclear: #9B93B8
```

---

## State Recovery

If a stage fails or context overflows:
1. Open new context in this project directory
2. Run `/orchestrate-status` — it reads `handoff-log.md` and shows exact state
3. Run the command for the failed/next stage

The handoff-log is the single source of truth — every agent writes to it on completion.
