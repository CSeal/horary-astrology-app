# Stage 5 + 6 Implementation Plan
## Quality · Performance · Animation · Haptics

*Compiled 2026-06-26. Priority: juicy, impressive, tactile.*

---

## Actual Codebase State (post-audit, June 26)

The gap spec (api-gap-spec.md, 2026-06-04) is **partially outdated**. The mapper has been
significantly updated since then. Real status:

| GAP | Description | Actual state |
|---|---|---|
| GAP-1 | aspect_perfections[] | ✅ DONE — mapper line 311 |
| GAP-3 | lunar_rich / voc detail | ✅ DONE — mapVocDetail() |
| GAP-4 | radicality_score + flags | ✅ DONE — mapper lines 316, 323 |
| GAP-5 | timing[] extraction | ✅ DONE — mapTiming() first window |
| GAP-6 | dignity_score / domicile_ruler | ❌ NOT DONE — mapSignificator never copies them |
| GAP-7 | SUBJECT_ROLES missing 2 values | ❌ NOT DONE — config.ts line 109 |
| GAP-8 | Significators collapsible toggle | ❌ NOT DONE — aspects toggle exists, sigs don't |

Stats & retention:
- `useStats`, `useStreak` hooks: ✅ DONE
- `stats.tsx` screen: ✅ DONE (animated bars, count-up, floating star empty state)
- `StreakBadge` integration: ✅ DONE — index.tsx + journal.tsx
- `OnThisDayBanner` integration: ✅ DONE — index.tsx + onThisDayService.ts
- `onThisDayService.ts`: ✅ DONE

Animation state of existing components:

| Component | Animation level | Needs upgrade |
|---|---|---|
| `ChartStrengthBar` | ✅ Reanimated withTiming fill | — |
| `TestimonyBar` | ✅ Reanimated withTiming segments | — |
| `StreakBadge` | ✅ withSpring + withRepeat + haptics | — |
| `OnThisDayBanner` | ✅ withSpring + withDelay + haptics | — |
| `SignificatorRow` | ✅ withDelay stagger | — |
| `AspectRow` | ✅ used inside StaggerIn in full.tsx | — |
| `VocMoonBanner` | check | verify |
| `ReceptionBlock` | ❌ zero animations | **UPGRADE** |
| `PerfectionPathBlock` | ❌ zero animations | **UPGRADE** |
| `KeyFactorsBlock` | ❌ zero animations | **UPGRADE** |
| `RadicalityFlagsBlock` | ❌ useState-only collapse | **UPGRADE** |
| `TimingBlock` | ❌ zero animations | **UPGRADE** |
| `TimingTeaser` | ❌ zero animations | **UPGRADE** |

---

## Quality Bar — Reference Patterns

Before touching anything, study these existing high-quality components:

**Standard stagger entrance** (from `StaggerIn` in `result/[id]/full.tsx`):
```tsx
const enterY = useSharedValue(16);
const enterOp = useSharedValue(0);
useEffect(() => {
  enterY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 110 }));
  enterOp.value = withDelay(delay, withTiming(1, { duration: 320 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
const animStyle = useAnimatedStyle(() => ({
  opacity: enterOp.value,
  transform: [{ translateY: enterY.value }],
}));
```

**Standard animated bar fill** (from `ChartStrengthBar`):
```tsx
const progress = useSharedValue(0);
useEffect(() => {
  progress.value = withDelay(delay, withTiming(targetPct, { duration, easing: Easing.out(Easing.ease) }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
const animStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));
```

**Scale pop on mount** (from `StatBlock` in `stats.tsx`):
```tsx
const scale = useSharedValue(0.8);
const opacity = useSharedValue(0);
useEffect(() => {
  scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 100 }));
  opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**Animated collapse toggle** (from `full.tsx` chevron pattern):
```tsx
const rotation = useSharedValue(0);
useEffect(() => {
  rotation.value = withTiming(expanded ? 180 : 0, { duration: 200 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [expanded]);
const chevronStyle = useAnimatedStyle(() => ({
  transform: [{ rotate: `${rotation.value}deg` }],
}));
```

**CLAUDE.md Reanimated 4 rules** (enforce on every component):
1. Each SharedValue written in exactly one `useEffect`; call `cancelAnimation()` before writing
2. Animation callbacks bridge back with `runOnJS` + `'worklet'` directive
3. SharedValues excluded from `useEffect` deps (`// eslint-disable-next-line react-hooks/exhaustive-deps`)
4. `queueMicrotask` for `setState` inside animated callbacks

---

## Stage 5a — Data Layer Remaining Fixes

### 5a-1: GAP-7 — SUBJECT_ROLES (XS, ~30 min)

**`src/constants/config.ts`** (line 109):
```ts
export const SUBJECT_ROLES = [
  'self',
  'spouse_partner',
  'third_party_friend',
  'third_party_employer',
  'third_party_parent',
  'third_party_child',
  'third_party_sibling',   // ADD — 3rd house (sibling, neighbour, short journey)
  'third_party_enemy',     // ADD — 7th house (open enemy, opponent, rival)
  'third_party_other',
] as const;
```

**`src/i18n/{en,ru,de,fr,es,pt,uk}.ts`** — add to `subjectRoles` map:
```ts
third_party_sibling: 'For sibling',   // ru: 'За брата/сестру', de: 'Für Geschwister', ...
third_party_enemy:   'For opponent',  // ru: 'За оппонента', de: 'Für Gegner', ...
```

### 5a-2: GAP-6 — dignity_score + domicile_ruler in SignificatorRow (S, ~45 min)

**`src/services/horaryMapper.ts`** (function `mapSignificator`, line 88):
```ts
function mapSignificator(s: WireSignificator): SignificatorData {
  const dignityInfo = s.dignity_info;
  return {
    planet: s.planet,
    role: s.role,
    sign: dignityInfo?.sign ?? '',
    house: s.house,
    dignity: toDignity(dignityInfo?.essential_dignity),
    retrograde: dignityInfo?.accidental_conditions?.includes('retrograde') ?? false,
    accidentalConditions: dignityInfo?.accidental_conditions,
    aspect: null,
    dignity_score: dignityInfo?.dignity_score,     // ADD
    domicile_ruler: dignityInfo?.domicile_ruler,   // ADD
  };
}
```

Types `dignity_score?: number` and `domicile_ruler?: string` already exist in
`SignificatorData` (`src/types/horary.ts` lines 169-170) — no type changes needed.

**`src/components/SignificatorRow.tsx`** — after the dignity badge, add ruler hint:
```tsx
{data.domicile_ruler && !data.dignity && (
  <Text className="font-inter text-[10px] text-text-secondary ml-1">
    {`r:${PLANET_GLYPHS[data.domicile_ruler] ?? data.domicile_ruler}`}
  </Text>
)}
```
Show only when dignity is null/peregrine (i.e. planet is not in its own sign), giving
the astrologer context on who actually rules the sign.

### 5a-3: GAP-8 — Significators Collapsible Toggle (S, ~1 hr)

**`src/app/result/[id]/full.tsx`** — the aspects section already has a toggle (line 89–103).
Add the same pattern for significators (lines 203-210):

1. Add: `const [sigsExpanded, setSigsExpanded] = useState(true)`
2. Add SharedValue + useEffect for chevron rotation (same pattern as `chevronRotation`)
3. Replace the static `SectionHeader` for significators with a `TouchableOpacity` that
   calls `Haptics.impactAsync(ImpactFeedbackStyle.Light)` + `setSigsExpanded(v => !v)`
4. Conditional render: `{sigsExpanded && entry.significators.map(...)}`
5. Add `accessibilityState={{ expanded: sigsExpanded }}` to the pressable

---

## Stage 5b — Animation & Haptics Polish

This is the heart of "juicy and impressive". Six components need Reanimated upgrades.

### 5b-1: ReceptionBlock — Entrance + Stagger (S, ~1.5 hr)

**Current state:** Static text, no animations.

**Target:** Card-level spring pop (same as StatBlock in stats.tsx) + row items stagger.

Implementation:
- The outer card view: scale 0.95→1 + opacity 0→1 via `withSpring` (damping 12, stiffness 100)
- For each `ReceptionItem` in the list: `withDelay(index * 70, withSpring(0, { damping: 14, stiffness: 110 }))` on translateX 12→0 + opacity 0→1 (items slide in from right)
- Mutual reception badge: scale 0.8→1 via `withSpring({ damping: 8, stiffness: 200 })` — bouncy
- Haptics: **none** (no interaction — it's informational)

### 5b-2: PerfectionPathBlock — Step-by-Step Reveal (S, ~1 hr)

**Current state:** Static list, no animations.

**Target:** Each path step appears with stagger, creating a "narrative unfolding" effect.

Implementation:
- Path summary text: opacity 0→1 via `withTiming(1, { duration: 400 })`
- Each path step (if rendered as items): `withDelay(index * 100, withSpring(0, ...))` translateY 12→0 + opacity
- If the block has a connecting arrow/line between steps: draw via `withTiming` on `scaleY` or `height`

### 5b-3: KeyFactorsBlock — Slide-From-Left Stagger (S, ~1 hr)

**Current state:** Bullet list, no animations.

**Target:** Each bullet "slides in from the left" with stagger — typewriter-like effect.

Implementation:
- Each factor item: `withDelay(index * 60, ...)` with `translateX: -12 → 0` + `opacity 0→1`
- Use `withSpring` for the position (not `withTiming`) — spring feels more alive
- The section header (if any): fade in first with `withTiming(1, { duration: 300 })`

### 5b-4: RadicalityFlagsBlock — Animated Collapse (M, ~2 hr)

**Current state:** Collapsed/expanded via `useState` → instant show/hide.

**Target:** Smooth animated height collapse + chevron rotation. This is the most complex
animation upgrade because it requires measuring content height.

Implementation approach — `onLayout` + `maxHeight`:
```tsx
const [contentHeight, setContentHeight] = useState(0);
const [expanded, setExpanded] = useState(false);
const heightProgress = useSharedValue(0); // 0=collapsed, 1=expanded
const chevronRot = useSharedValue(0);

useEffect(() => {
  cancelAnimation(heightProgress);
  cancelAnimation(chevronRot);
  heightProgress.value = withTiming(expanded ? 1 : 0, {
    duration: 250,
    easing: Easing.out(Easing.ease),
  });
  chevronRot.value = withTiming(expanded ? 180 : 0, { duration: 220 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [expanded]);

const containerStyle = useAnimatedStyle(() => ({
  maxHeight: heightProgress.value * (contentHeight + 16), // +padding
  overflow: 'hidden',
}));
const chevronStyle = useAnimatedStyle(() => ({
  transform: [{ rotate: `${chevronRot.value}deg` }],
}));
```

The content `View` uses `onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}`
with `position: 'absolute'` or renders once to measure, then animates.

Alternative simpler approach: use `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)`
before `setExpanded` — no height measurement needed, works reliably in RN. But this is JS-driven
(not UI-thread), so prefer the Reanimated approach for premium feel.

Haptics: `Haptics.impactAsync(ImpactFeedbackStyle.Light)` on toggle.

### 5b-5: TimingBlock — Animated Confidence Bar + Count-Up (S, ~1.5 hr)

**Current state:** Static confidence pills, static progress bar.

**Target:** The bar fills from 0% to actual confidence width on mount (same pattern as
`ChartStrengthBar` and `AnimatedBar` in stats.tsx). The value count-up (same `useCountUp`
from stats.tsx if applicable).

Implementation:
- Import or inline the `AnimatedBar` pattern from stats.tsx
- Confidence bar: `withDelay(200, withTiming(targetPct, { duration: 600, easing: Easing.out(Easing.ease) }))`
- Confidence pill badge: scale 0.8→1 + opacity 0→1 via `withSpring` with 100ms delay after bar
- Timing value (e.g. "3 months"): fade in after bar animation — `withDelay(400, withTiming(1, ...))`

### 5b-6: TimingTeaser — Entrance + Press Feedback + Pulse (S, ~1 hr)

**Current state:** Static view with no animations.

**Target:** Entrance spring + border glow pulse + press scale.

Implementation:
- Mount entrance: `withDelay(160, withSpring(0, { damping: 12, stiffness: 90 }))` translateY + opacity (same delay as ctaY in index.tsx)
- Border pulse: `withRepeat(withTiming(0.35, { duration: 1800 }), -1, true)` on a border opacity SharedValue — subtle, not distracting
- Press in: `backScale.value = withSpring(0.97, { damping: 18, stiffness: 320 })`
- Press out: `backScale.value = withSpring(1, { damping: 14, stiffness: 240 })`
- Haptics: `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` on press (navigates to timing screen)
- Apply scale via `useAnimatedStyle` on an `AnimatedView` wrapping the pressable content

### 5b-7: Haptics Audit (XS, ~30 min)

Check every meaningful interaction has the right haptic. Target:

| Screen / Component | Trigger | Haptic Level |
|---|---|---|
| `full.tsx` back button | press | Light |
| `full.tsx` significators toggle (new) | toggle | Light |
| `full.tsx` show-all aspects | toggle | Light |
| `full.tsx` "View Chart" row | press | Light |
| `RadicalityFlagsBlock` expand/collapse | toggle | Light |
| `TimingTeaser` | press | **Medium** (navigates) |
| `ChartStrengthBar` | mount, score ≥ 80 | Notification.Success (once, guarded by `hasTriggeredRef`) |
| `StreakBadge` milestones | already implemented | — |
| `OnThisDayBanner` | already implemented | — |

`ChartStrengthBar` milestone haptic pattern:
```tsx
const hasTriggered = useRef(false);
useEffect(() => {
  if (!hasTriggered.current && score >= 80) {
    hasTriggered.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

---

## Stage 6 — Remaining Integration

### 6a: Stats Screen — maxStreak Display

**`src/app/(tabs)/stats.tsx`** — `useStats()` returns `maxStreak` but it's not displayed.

In the summary card `flex-row`, add a third `StatBlock`:
```tsx
{stats.maxStreak > 1 && (
  <StatBlock
    delay={240}
    value={stats.maxStreak}
    suffix=" max"
    label={t('stats.maxStreakLabel')}
  />
)}
```

Add `maxStreakLabel` i18n key: "best streak" / "рекорд" / ...

### 6b: VocMoonBanner — Animation Verify

The VocMoonBanner is used in index.tsx. Confirm it has a smooth entrance animation
matching the `bodyStyle` group it's wrapped in. If the component has no internal
animation, it inherits the `AnimatedView style={bodyStyle}` from index.tsx — that's fine.
No changes needed unless it looks flat compared to other cards.

---

## Implementation Order

```
┌── 5a-1 (GAP-7 config, XS)
├── 5a-2 (GAP-6 mapper, S)
└── 5a-3 (GAP-8 sigs toggle, S)
       │
       ▼ (data layer done, UI tests pass)
┌── 5b-1 (ReceptionBlock)   ─┐
├── 5b-2 (PerfectionPath)    ├── parallel (independent components)
├── 5b-3 (KeyFactors)        │
└── 5b-6 (TimingTeaser)     ─┘
       │
       ▼
├── 5b-4 (RadicalityFlags animated collapse)   ← most complex, do after simpler ones
└── 5b-5 (TimingBlock bar animation)
       │
       ▼
└── 5b-7 (haptics audit)
       │
       ▼
└── 6a (stats maxStreak) + 6b (VocMoonBanner verify)
```

---

## File Change Matrix

| File | Stage | Change |
|---|---|---|
| `src/constants/config.ts` | 5a-1 | +2 SUBJECT_ROLES values |
| `src/i18n/{en,ru,de,fr,es,pt,uk}.ts` | 5a-1, 6a | +4 keys (2 roles + maxStreak + domicile ruler hint) |
| `src/services/horaryMapper.ts` | 5a-2 | mapSignificator: +dignity_score, +domicile_ruler |
| `src/components/SignificatorRow.tsx` | 5a-2 | +domicile_ruler ruler hint text |
| `src/app/result/[id]/full.tsx` | 5a-3 | +significators collapsible toggle (useState + chevron) |
| `src/components/ReceptionBlock.tsx` | 5b-1 | +spring pop + stagger slide-in for items |
| `src/components/PerfectionPathBlock.tsx` | 5b-2 | +stagger-in for steps |
| `src/components/KeyFactorsBlock.tsx` | 5b-3 | +translateX stagger for bullets |
| `src/components/TimingTeaser.tsx` | 5b-6 | +entrance + border pulse + press scale + haptic |
| `src/components/RadicalityFlagsBlock.tsx` | 5b-4 | useState → Reanimated animated height + chevron |
| `src/components/TimingBlock.tsx` | 5b-5 | +bar fill animation + confidence pill scale |
| `src/components/ChartStrengthBar.tsx` | 5b-7 | +milestone haptic on score ≥ 80 |
| `src/app/(tabs)/stats.tsx` | 6a | +maxStreak StatBlock |

Total: 13 files changed, 2 new patterns (animated collapse, border pulse), 0 new files.

---

## Verify After Each Stage

```bash
npm run typecheck   # zero errors — mandatory gate
npm run lint        # zero warnings on changed files
npm run test        # no regressions
```

For animation quality: run on a physical device (not simulator). Spring animations and
haptics require real hardware to evaluate properly.
