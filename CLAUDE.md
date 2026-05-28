# CLAUDE.md

## Mission
Build an internal MVP of a horary astrology mobile app with controlled Claude-driven orchestration.

## Core Governance
- Claude-only edits for all core project artifacts.
- External AI/docs are input-only context, never direct artifact edits.
- Every artifact must include provenance metadata:
  - `created_by`
  - `updated_by`
  - `source_inputs`
  - `reviewed_by`

## Orchestration Flow
1. DiscoveryInputs
2. MarketAndCompetitorResearch
3. MvpAndPhaseDefinition
4. UxUiSpecAndHtmlPrototype
5. MobileArchitectureAndApiContracts
6. ImplementationSprints
   - 6a. Foundation (Batch A)
   - 6b. Services (Batch B)
   - 6c. Screens (Batch C) ∥ 6d. Polish (Batch D)
   - **6e. Pre-QA Cleanup (Batch E)** — auto-fix version drift, lint, TS, deferred items
7. QaAndReleaseReadiness
8. DemoAndStakeholderReview

Required handoff fields at each stage:
- Inputs
- Deliverable
- Assumptions
- Risks
- NextAgent

## Superpowers + superpowers-v (Mandatory)
Use Superpowers workflow with `superpowers-v` as transition layer.

Trigger 1 (post-spec):
- phase-1a code archaeology
- phase-1b domain expert + audience search
- phase-1c documentation/library validation via Context7

Trigger 2 (during writing-plans):
- partition review for disjoint file map

Trigger 3 (execution):
- parallel dispatch of implementation batches

## Gate System
- Gate 1: ICP, MVP boundaries, KPI approved
- Gate 2: API constraints, budget, data policy approved
- Gate 3: `prd-v1.md` approved
- Gate 4: UX flows and design direction approved
- Gate 5: architecture, test strategy, roadmap approved
- Gate 6: provenance confirms Claude-only edits
- Gate 7: valid briefing + acceptance checks per stage
- Gate 8: Trigger 1/2/3 outputs verified

Gate mode: semi-strict
- Must-pass criteria are required.
- Conditional-pass is allowed only with owner, action owner, and follow-up record.

## Required Artifacts
- `CLAUDE.md`
- `project-brief.md`
- `competitor-research.md`
- `prd-v1.md`
- `mvp-scope.md`
- `kpi-and-economics.md`
- `api-integration-spec.md`
- `ux-flows.md`
- `design-system-brief.md`
- `technical-architecture.md`
- `quality-gates.md`
- `delivery-roadmap.md`

superpowers-v output locations:
- `docs/superpowers/archaeology/`
- `docs/superpowers/expert/`
- `docs/superpowers/library-audit/`
- `docs/superpowers/specs/`
- `docs/superpowers/plans/`

## Command Interface

### Orchestration (feature development flow)
- `/orchestrate:start`
- `/orchestrate:research`      → Stage 1
- `/orchestrate:prd`           → Stage 2
- `/orchestrate:design`        → Stage 3
- `/orchestrate:architecture`  → Stage 4
- `/orchestrate:implement`     → Stage 5 (runs 5a→5b→5c∥5d→5e automatically)
- `/orchestrate-stage5e`       → Stage 5e only (re-run cleanup without full Stage 5)
- `/orchestrate:qa`            → Stage 6
- `/orchestrate:status`        → show all stages table

### Dependency management (run anytime)
- `/deps:audit`                → analyse outdated packages, classify tiers, research changelogs,
                                 check SDK upgrade availability, sync expo.install.exclude
- `/sdk:upgrade`               → create SDK migration plan (read-only, safe)
- `/sdk:upgrade execute`       → apply approved SDK migration plan (modifies project)

Each command must define:
- required inputs
- expected outputs
- gate linkage
- fallback path

## Documentation System

Central index: `docs/INDEX.md` — single entry point for all project docs.

Doc structure:
- `docs/` — product artifacts (PRD, brief, architecture, design system, etc.)
- `docs/features/` — per-feature technical guides (one file per feature)
- `docs/ops/` — operational runbooks (deployment, env vars, secrets)
- `docs/orchestration/` — internal process artifacts (handoff log, plans)
- `docs/superpowers/` — pre-flight research outputs
- `docs/deps/` — dependency audit reports (`audit-YYYY-MM-DD.md`) and SDK upgrade plans (`sdk-upgrade-plan-YYYY-MM-DD.md`)

### `/doc:feature <name>`

Trigger `doc-writer` agent to create or update `docs/features/<name>.md`.
Use after any non-trivial feature is implemented or modified.

Inputs: feature name + relevant source file paths (optional)
Output: `docs/features/<name>.md` + updated `docs/INDEX.md`

### When to write docs

| Event | Action |
|---|---|
| New service or hook implemented | `/doc:feature <name>` |
| New screen completed | `/doc:feature <screen-name>` |
| Operational config required (env, deploy) | `/doc:feature <ops-topic>` → goes to `docs/ops/` |
| Existing feature changed significantly | Re-run `/doc:feature` to update the doc |

## Fallback Policy
If auto-fire fails:
- `/v:archaeology <topic>`
- `/v:dispatch <plan-path>`

Do not rerun manually if auto-fire already completed correctly.

Recovery mode: hybrid
- Auto recovery for standard failures.
- Manual owner approval for critical failures:
  - core-file partition conflicts
  - repeated failure after fallback
  - any Claude-only/provenance violation

## Secrets and Access Policy
Keep this section updated before coding starts:
- Required secrets list and environment mapping
- Storage and rotation rules
- Access levels (read/write/admin)
- Explicit prohibition of secret exposure in artifacts/prompts

## Core-MVP Cutline
If PRD + UX flows + architecture + partition map are not ready, switch to core-MVP scope:
- keep `ask -> verdict -> save journal`
- defer non-critical screens/settings
- keep critical QA only (smoke + critical path)

## Definition of Ready for Coding (Binary)
Coding phase can open only when all required checks are true:
- Required gates passed
- `CLAUDE.md` approved by owner
- `/orchestrate:*` command contracts documented
- secrets/access section completed
- hybrid recovery documented
- provenance and Trigger 1/2/3 outputs verified

If any required item is not complete, coding remains closed.

## Change Management
- Baseline and governance updates are approved by project owner only.
- Any governance change must include rationale and impacted gates/commands.

## Git / Commit Policy

**No automatic commits — ever.**

Before any `git commit`, Claude must:
1. Show `git diff --stat` (what changed)
2. Propose a commit message following AstraSk conventions (see `.claude/skills/git-commit/`)
3. Wait for explicit approval from the project owner

**The only exception:** if the owner's message itself contains an explicit commit instruction ("закоммить", "commit this", "сделай коммит"), that message is the approval — proceed directly.

This applies to:
- Main conversation (Claude working directly)
- Orchestration commands (after each stage completes, show diff + proposed message, wait)
- Agents do NOT commit — they write files only; the orchestration command layer handles commit approval

---

## Coding Conventions (enforced by ESLint + TypeScript)

### Imports — absolute only (no relative parent imports)
**ALWAYS use absolute `@/` imports for modules outside the current directory. Never use relative parent imports (`../../../`).**

```ts
// ✅ Correct — absolute imports
import { Button } from '@/components/ui/Button';
import { horaryApi } from '@/services/horaryApi';
import type { HoraryRequest } from '@/types/horary';

// ❌ Wrong — relative imports break on file moves
import { Button } from '../../../components/ui/Button';
import { horaryApi } from '../../services/horaryApi';
```

**Why:** Relative imports are fragile during refactoring. Moving a file one level up/down breaks all relative paths. Absolute imports (`@/`) always work regardless of file location. `tsconfig.json` is configured with `@/*: ./src/*` alias.

**Exception:** Same-directory imports (`./) are OK as an alternative to absolute imports.

```ts
// ✅ Both are acceptable for same-directory imports
import { helper } from './helper';
import { helper } from '@/hooks/helper'; // if file is in src/hooks/
```

**Enforcement:** ESLint rule `no-restricted-imports` forbids `../**` patterns. Run `npm run lint` to verify.

### Imports — CSS components
**ALWAYS import `View`, `Text`, `ScrollView`, `Pressable`, `TextInput`, `TouchableOpacity` from `@/tw`, NOT from `react-native`.**

```ts
// ✅ Correct
import { View, Text, ScrollView } from '@/tw';

// ❌ Wrong — className won't work, ESLint error
import { View, Text } from 'react-native';
```

**Why:** `globalClassNamePolyfill` is disabled in `metro.config.js` to preserve `PlatformColor` in CSS variables. Without it, `className` prop has no effect on plain RN components. `src/tw/index.tsx` wraps them with `useCssElement` from `react-native-css`.

### Styling
- No `StyleSheet.create()` — NativeWind `className` only
- No hardcoded hex colors (ESLint warns) — use tokens from `src/constants/theme.ts`
- No inline `style={{ color: '#...' }}` — use `className="text-accent-gold"` instead

### Strings / i18n
- No hardcoded JSX strings — all via `t('key')` from `react-i18next`

### TypeScript
- No `any` — use proper interfaces from `src/types/`
- SVG color props from `theme.ts` — never inline

### Verification commands
```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint src/
npm run test        # jest
```

---

### Reanimated 4 rules (`react-native-reanimated ^4.x`)

#### 1. Single-owner rule — each SharedValue written in exactly ONE `useEffect`
```ts
// ✅ One effect, all writes to the same value
useEffect(() => {
  switch (phase) {
    case 'intro': scale.value = withSpring(1); break;
    case 'exit':  scale.value = withTiming(0); break;
  }
}, [phase]);

// ❌ Two effects both writing `scale` → compile-time Reanimated error
useEffect(() => { scale.value = withSpring(1); }, []);
useEffect(() => { scale.value = withTiming(0); }, [done]); // ERROR
```
**Fix pattern:** use a `phase` state (`'intro' | 'idle' | 'exit'`) to drive a single switch-effect. Call `cancelAnimation(value)` at the top of the effect to clear the previous animation before starting the next.

#### 2. `runOnJS` deprecated — callbacks already run on JS thread
```ts
// ✅ Reanimated 4 — callback is automatically on JS thread
withTiming(1, { duration: 300 }, (finished) => {
  if (finished) onComplete();
});

// ❌ Old pattern — runOnJS no longer needed
withTiming(1, { duration: 300 }, (finished) => {
  if (finished) runOnJS(onComplete)();
});
```

#### 3. SharedValues must NOT appear in `useEffect` deps arrays
SharedValues are stable refs (like `useRef`) — they never change identity, so listing them as deps is wrong and triggers Reanimated's static analysis errors.
```ts
// ✅ Correct — suppress exhaustive-deps for SharedValues
useEffect(() => {
  opacity.value = withTiming(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // opacity excluded — stable Reanimated ref

// ❌ Wrong — triggers "cannot be modified" if another effect also uses this value
useEffect(() => {
  opacity.value = withTiming(1);
}, [opacity]); // listing SharedValue as dep
```
**Exception:** if ONE effect both reads AND writes the same SharedValue with no other effect touching it, listing it as dep is safe (but unnecessary).

#### 4. Phase transitions — use `queueMicrotask` for `setState` inside effects
```ts
// ✅ Deferred setState avoids cascading renders
useEffect(() => {
  if (phase === 'idle' && appReady) {
    queueMicrotask(() => setPhase('exit'));
  }
}, [phase, appReady]);

// ❌ Synchronous setState in effect body triggers Reanimated lint error
useEffect(() => {
  if (phase === 'idle' && appReady) setPhase('exit'); // ERROR
}, [phase, appReady]);
```

---

### react-native-svg 15.x rules

#### Deprecated individual transform props — use SVG `transform` string instead
```tsx
// ✅ SVG-standard transform string (react-native-svg 15+)
<Polygon transform={`translate(${cx} ${cy}) rotate(${angle}) translate(${-cx} ${-cy})`} />
<G transform={`rotate(${deg} ${cx} ${cy})`} />

// ❌ Deprecated individual props — removed in svg 15+
<Polygon scale="1.07" origin="110, 110" />       // ESLint hint
<G originX={cx} originY={cy} rotate={angle} />   // ESLint hint
```

**For animated transforms with `useAnimatedProps`:** use a template-literal `transform` string — Reanimated's worklet engine evaluates `.value` reads inline.
```ts
const props = useAnimatedProps(() => ({
  transform: `rotate(${rotation.value} ${cx} ${cy})`,
}));
```

**For static scaled shadows** (e.g., shadow polygon 1.07× scaled around a center): pre-calculate the polygon points at build time instead of using SVG scale transform. This avoids both the deprecated props and any runtime transform overhead.

---

## Active Expo Skills

Installed via `npx skills add expo/skills` into `.claude/skills/`. Auto-discovered by Claude Code based on context.

| Skill | When it activates |
|---|---|
| `expo-tailwind-setup` | NativeWind v5, `className`, CSS variables, `@/tw` imports |
| `building-native-ui` | UI components, navigation, animations, Expo Router |
| `native-data-fetching` | `fetch`, React Query, axios, SecureStore, offline |
| `expo-deployment` | EAS Build, App Store, Play Store, `eas.json` |
| `upgrading-expo` | SDK upgrades, dependency conflicts |
| `expo-dev-client` | Custom dev builds, TestFlight |
| `expo-cicd-workflows` | EAS Workflows, CI/CD YAML |
| `expo-api-routes` | Expo Router API routes, EAS Hosting |
| `expo-module` | Native modules, Swift, Kotlin |
| `expo-brownfield` | Embedding RN in existing native apps |
| `expo-ui-swiftui` | SwiftUI components via `@expo/ui` |
| `expo-ui-jetpack-compose` | Jetpack Compose via `@expo/ui` |
| `eas-update-insights` | OTA update health, crash rates |
| `use-dom` | Expo DOM components, webviews |
| `add-app-clip` | iOS App Clip targets |
