# CLAUDE.md

Horary astrology mobile app — Expo 55, TypeScript, NativeWind v5, iOS + Android.

## Git / Commit Policy

**No automatic commits — ever.**

Before any `git commit`:
1. Show `git diff --stat`
2. Propose a commit message (`.claude/skills/git-commit/`)
3. Wait for explicit approval

**Exception:** explicit instruction from owner ("закоммить", "commit this", "сделай коммит").

Agents write files only — never commit.

---

## Coding Conventions

### Imports — absolute `@/`
```ts
import { Button } from '@/components/ui/Button'; // cross-directory: always @/
import { View, Text } from '@/tw';               // RN primitives: @/tw, never react-native directly
import { helper } from './helper';               // same-directory: relative OK
```
ESLint `no-restricted-imports` bans `../**`. Full guide: `docs/IMPORT_CONVENTIONS.md`

### Rules
- **Styling:** `className` only (NativeWind). No `StyleSheet.create()`. No hardcoded hex — tokens from `src/constants/theme.ts`.
- **Strings:** `t('key')` from `react-i18next`. No hardcoded JSX strings. Add keys to ALL 7 locales: `src/i18n/{en,ru,de,fr,es,pt,uk}.ts`
- **TypeScript:** No `any` — interfaces from `src/types/`

### Verify
```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint src/
npm run test        # jest
```

---

### Reanimated 4 (`react-native-reanimated ^4.x`)

1. **Single-owner** — each `SharedValue` written in exactly one `useEffect`; call `cancelAnimation()` before writing.
2. **`runOnJS` required** — animation callbacks run on UI thread; bridge back with `'worklet';` directive: `if (finished) runOnJS(fn)();`
3. **No SharedValues in `useEffect` deps** — stable refs, exclude from array (`// eslint-disable-next-line react-hooks/exhaustive-deps`).
4. **`queueMicrotask` for `setState` in effects** — defers update to avoid cascading renders / Reanimated lint error.
5. **Never `useAnimatedProps` with a CSS `transform` string on SVG elements** — crashes Android (`mappers.ts` rejects CSS strings). Use `Animated.View` + `useAnimatedStyle` outside the `<Svg>`:

```tsx
// ✅ Animated.View wrapper — works on Android + iOS
const animStyle = useAnimatedStyle(() => ({
  transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
}));
return (
  <Animated.View style={animStyle}>
    <Svg width={size} height={size}><Polygon points={points} /></Svg>
  </Animated.View>
);
// ❌ Crashes Android — CSS string rejected by mappers.ts
// useAnimatedProps(() => ({ transform: `rotate(${rotation.value} ${cx} ${cy})` }))
```
`useAnimatedProps` with `opacity` only on SVG elements is fine.

### react-native-svg 15.x
```tsx
<G transform={`rotate(${deg} ${cx} ${cy})`} />  // ✅ static string OK
// ❌ Removed: scale="1.07"  origin="..."  originX={}  originY={}  rotate={}
```
Static scaled shadows: pre-calculate polygon points instead of scale transform.

---

## Code Map

| Layer | Key files |
|---|---|
| Screens | `src/app/(tabs)/index.tsx` · `journal.tsx` · `settings.tsx` · `onboarding.tsx` · `result/[id]/` |
| API + mapper | `src/services/horaryApi.ts` · `horaryMapper.ts` |
| Journal | `src/services/journalService.ts` · `src/hooks/useJournal.ts` |
| Location | `src/services/locationService.ts` · `geocodingService.ts` |
| Stores | `src/stores/settingsStore.ts` · `questionsStore.ts` · `debugStore.ts` |
| Types | `src/types/horary.ts` · `journal.ts` |
| Theme + config | `src/constants/theme.ts` · `config.ts` (APP_STORE_ID placeholder) |
| i18n | `src/i18n/{en,ru,de,fr,es,pt,uk}.ts` |
| NW primitives | `src/tw/index.tsx` — View · Text · ScrollView · Pressable · TextInput |
| SVG | `src/components/svg/` — StarField · PlanetOrbit · VerdictStar · ChartWheel |
| Mock / fixtures | `src/services/mockHoraryApi.ts` · `src/fixtures/` |

---

## Dev Session

```bash
bash scripts/dev-session.sh status                                          # Metro + ADB + симуляторы
bash scripts/dev-session.sh start --platform android --device wifi --port PORT
bash scripts/dev-session.sh logs all --lines 100
bash scripts/dev-session.sh stop
```
Logs: `/tmp/hora-metro.log` (JS) · `/tmp/hora-native.log` (native) · `/tmp/hora-session.json`

Workflow: found error → describe → wait OK → fix → re-check log.

---

## Orchestration

| Command | Stage |
|---|---|
| `/orchestrate:start` | Init |
| `/orchestrate:research` | Stage 1 |
| `/orchestrate:prd` | Stage 2 |
| `/orchestrate:design` | Stage 3 |
| `/orchestrate:architecture` | Stage 4 |
| `/orchestrate:implement` | Stage 5 (5a→5b→5c∥5d→5e) |
| `/orchestrate:qa` | Stage 6 |
| `/orchestrate:status` | Status |
| `/deps:audit` | Dep audit |
| `/sdk:upgrade [execute]` | Migration plan / apply |

Superpowers-v spec: `docs/orchestration/superpowers-v-preflight.md` · Gates: `docs/orchestration/gate-criteria.md` · Docs index: `docs/INDEX.md`

After any non-trivial feature: `/doc:feature <name>`
