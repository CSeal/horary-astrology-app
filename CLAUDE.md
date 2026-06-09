# CLAUDE.md

## Mission
Build an internal MVP of a horary astrology mobile app with controlled Claude-driven orchestration.

## Core Governance
- Claude-only edits for all core project artifacts.
- External AI/docs are input-only context, never direct artifact edits.
- Every artifact must include provenance metadata: `created_by`, `updated_by`, `source_inputs`, `reviewed_by`.

## Orchestration Flow
1. DiscoveryInputs → 2. MarketAndCompetitorResearch → 3. MvpAndPhaseDefinition → 4. UxUiSpecAndHtmlPrototype → 5. MobileArchitectureAndApiContracts
6. ImplementationSprints: 6a Foundation → 6b Services → 6c Screens ∥ 6d Polish → **6e Pre-QA Cleanup**
7. QaAndReleaseReadiness → 8. DemoAndStakeholderReview

Handoff fields per stage: Inputs, Deliverable, Assumptions, Risks, NextAgent

## Superpowers + superpowers-v (Mandatory)
Full spec: `docs/orchestration/superpowers-v-preflight.md`

- Trigger 1 (post-spec): archaeology → domain expert → Context7 library validation
- Trigger 2 (writing-plans): partition review for disjoint file map
- Trigger 3 (execution): parallel dispatch of implementation batches

## Gate System
Gates 1–8 defined in `docs/orchestration/gate-criteria.md`. Mode: **semi-strict** (must-pass required; conditional-pass allowed with owner + follow-up record).

## Required Artifacts
Full list in `docs/INDEX.md`. Key files: `project-brief.md`, `prd-v1.md`, `mvp-scope.md`, `technical-architecture.md`, `ux-flows.md`, `api-integration-spec.md`.

## Command Interface

### Orchestration
| Command | Stage |
|---|---|
| `/orchestrate:start` | Init |
| `/orchestrate:research` | Stage 1 |
| `/orchestrate:prd` | Stage 2 |
| `/orchestrate:design` | Stage 3 |
| `/orchestrate:architecture` | Stage 4 |
| `/orchestrate:implement` | Stage 5 (5a→5b→5c∥5d→5e) |
| `/orchestrate-stage5e` | Stage 5e only |
| `/orchestrate:qa` | Stage 6 |
| `/orchestrate:status` | Status table |

### Dependency management
| Command | Action |
|---|---|
| `/deps:audit` | Analyse packages, tiers, changelogs, SDK availability |
| `/sdk:upgrade` | Migration plan (read-only) |
| `/sdk:upgrade execute` | Apply approved plan |

Command contracts: `docs/orchestration/command-contracts.md`

## Documentation System
Index: `docs/INDEX.md`. Structure: `docs/` (artifacts) · `docs/features/` · `docs/ops/` · `docs/orchestration/` · `docs/superpowers/` · `docs/deps/`

After any non-trivial feature: `/doc:feature <name>` → creates `docs/features/<name>.md` + updates index.

## Code Map

Screens (`src/app/`): `(tabs)/index.tsx` (Home/Ask) · `(tabs)/result/[id]/index.tsx` (Verdict) · `(tabs)/result/[id]/full.tsx` (Full reading) · `(tabs)/journal.tsx` · `(tabs)/stats.tsx` · `(tabs)/settings.tsx` · `onboarding.tsx`

| Layer | Key files |
|---|---|
| API + mapper | `src/services/horaryApi.ts` · `horaryMapper.ts` |
| Journal | `src/services/journalService.ts` · `src/hooks/useJournal.ts` |
| Location | `src/services/locationService.ts` · `geocodingService.ts` |
| Stores | `src/stores/settingsStore.ts` · `questionsStore.ts` · `debugStore.ts` |
| Types | `src/types/horary.ts` · `journal.ts` |
| Theme + config | `src/constants/theme.ts` · `config.ts` (APP_STORE_ID placeholder) |
| i18n | `src/i18n/{en,ru,de,fr,es,pt,uk}.ts` — add keys to ALL locales |
| NW primitives | `src/tw/index.tsx` — View/Text/ScrollView/Pressable/TextInput source |
| SVG | `src/components/svg/` — StarField · PlanetOrbit · VerdictStar · ChartWheel |
| Mock / fixtures | `src/services/mockHoraryApi.ts` · `src/fixtures/` |
| Review prompt | `src/services/reviewPromptService.ts` |
| Notifications | `src/services/notificationService.ts` |

## Fallback Policy
If auto-fire fails: `/v:archaeology <topic>` · `/v:dispatch <plan-path>`
Recovery: hybrid — auto for standard failures; owner approval for partition conflicts, repeated failure, or provenance violations.

## Change Management
Governance updates require project owner approval + rationale + impacted gates/commands.

## Git / Commit Policy

**No automatic commits — ever.**

Before any `git commit`, Claude must:
1. Show `git diff --stat`
2. Propose a commit message following Hora conventions (`.claude/skills/git-commit/`)
3. Wait for explicit approval

**Exception:** owner's message contains an explicit commit instruction ("закоммить", "commit this", "сделай коммит") — proceed directly.

Agents do NOT commit — they write files only.

---

## Coding Conventions

### Imports — absolute `@/`
Full guide: `docs/IMPORT_CONVENTIONS.md`

```ts
// ✅ Always @/ for cross-directory imports
import { Button } from '@/components/ui/Button';
// ✅ @/tw — NOT react-native — for View, Text, ScrollView, Pressable, TextInput, TouchableOpacity
import { View, Text } from '@/tw';
// ✅ Same-directory: relative is fine
import { helper } from './helper';
```
ESLint `no-restricted-imports` bans `../**`. Run `npm run lint`.

### Styling
- No `StyleSheet.create()` — NativeWind `className` only
- No hardcoded hex colors — tokens from `src/constants/theme.ts`

### Strings / i18n
- No hardcoded JSX strings — `t('key')` from `react-i18next`

### TypeScript
- No `any` — interfaces from `src/types/`

### Verification
```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint src/
npm run test        # jest
```

---

### Reanimated 4 rules (`react-native-reanimated ^4.x`)

#### 1. Single-owner rule — each SharedValue written in exactly ONE `useEffect`
```ts
// ✅ One phase-driven switch-effect; cancelAnimation() clears prior animation
useEffect(() => {
  cancelAnimation(scale);
  switch (phase) {
    case 'intro': scale.value = withSpring(1); break;
    case 'exit':  scale.value = withTiming(0); break;
  }
}, [phase]);
```
Two effects writing the same value → compile-time Reanimated error.

#### 2. `runOnJS` required — callbacks run on UI/worklet thread
```ts
// ✅ Bridge back to JS thread
withTiming(1, { duration: 300 }, (finished) => {
  'worklet';
  if (finished) runOnJS(onComplete)();
});
```

#### 3. SharedValues must NOT appear in `useEffect` deps arrays
```ts
// ✅ SharedValues are stable refs — exclude from deps
useEffect(() => {
  opacity.value = withTiming(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

#### 4. `queueMicrotask` for `setState` inside effects
```ts
// ✅ Deferred setState avoids cascading renders / Reanimated lint error
useEffect(() => {
  if (phase === 'idle' && appReady) queueMicrotask(() => setPhase('exit'));
}, [phase, appReady]);
```

---

### react-native-svg 15.x — `transform` string only
```tsx
// ✅ SVG-standard transform string
<G transform={`rotate(${deg} ${cx} ${cy})`} />
// ✅ Animated transforms via useAnimatedProps
const props = useAnimatedProps(() => ({
  transform: `rotate(${rotation.value} ${cx} ${cy})`,
}));
// ❌ Removed in svg 15+: scale="1.07" origin="..." originX={} originY={} rotate={}
```
For static scaled shadows: pre-calculate polygon points instead of using scale transform.
