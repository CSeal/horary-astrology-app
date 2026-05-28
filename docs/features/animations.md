# Feature: Animations & Visual System

**Status:** Implemented (Stage 5d — Polish)
**Created by:** claude-sonnet (2026-05-26)

All animations run exclusively on the UI thread via Reanimated 4 shared values. No JS-thread frame callbacks. SVG geometry uses static `transform` strings (react-native-svg 15 removed individual transform props).

---

## Components

| Component | File | Description |
|---|---|---|
| `CosmosBackground` | [src/components/CosmosBackground.tsx](../../src/components/CosmosBackground.tsx) | Full-screen animated backdrop — StarField + PlanetOrbit |
| `StarField` | [src/components/svg/StarField.tsx](../../src/components/svg/StarField.tsx) | 60 twinkling stars |
| `PlanetOrbit` | [src/components/svg/PlanetOrbit.tsx](../../src/components/svg/PlanetOrbit.tsx) | Rotating planet with pulsing center |
| `PlanetGlyph` | [src/components/svg/PlanetGlyph.tsx](../../src/components/svg/PlanetGlyph.tsx) | Unicode astrological glyph in SVG Text |
| `VerdictStar` | [src/components/svg/VerdictStar.tsx](../../src/components/svg/VerdictStar.tsx) | 8-point starburst that springs into view |
| `ChartWheel` | [src/components/svg/ChartWheel.tsx](../../src/components/svg/ChartWheel.tsx) | Phase 2 placeholder — 12 house dividers |
| `AnimatedSplash` | [src/components/AnimatedSplash.tsx](../../src/components/AnimatedSplash.tsx) | Boot splash with starburst + fade-in |
| `ForceUpdateScreen` | [src/components/ForceUpdateScreen.tsx](../../src/components/ForceUpdateScreen.tsx) | Force-update gate — same star geometry, fade+slide entrance |

---

## StarField

60 `Circle` elements positioned via a **seeded LCG** (linear congruential generator) so particle positions are deterministic across re-renders.

Each star independently cycles opacity with `withRepeat(withTiming(…), -1, true)`:
- Duration range: 2 000ms – 5 000ms (seeded offset per star)
- Opacity range: `0.1` → `0.9`
- All animations on the UI thread via `useAnimatedProps`

Particle colors use `colors.textPrimary` (`#F0EEFF`) from `theme.ts`.

---

## PlanetOrbit

One shared `rotation` value drives the orbit, one `corePulse` value drives the central circle radius.

```ts
// Orbit: 3-second full revolution
rotation.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1);

// Pulse: 1.5-second sine-like radius oscillation
corePulse.value = withRepeat(withTiming(12, { duration: 1500, easing: Easing.inOut(...) }), -1, true);
```

The animated `G` element uses a `transform` string (not deprecated `rotate` prop):
```ts
const animatedProps = useAnimatedProps(() => ({
  transform: `rotate(${rotation.value} ${cx} ${cy})`,
}));
```

---

## VerdictStar

8-point starburst polygon that springs into view when the Verdict screen mounts.

```ts
scale.value  = withSpring(1, { damping: 15, stiffness: 100 });   // 0 → 1
rotate.value = withTiming(180, { duration: 600 });               // 0° → 180°
```

Color is sourced from `VERDICT_COLOR` map keyed by `VerdictType`:
```ts
const VERDICT_COLOR: Record<VerdictType, string> = {
  YES:     colors.yes,
  NO:      colors.no,
  MAYBE:   colors.maybe,
  UNCLEAR: colors.unclear,
};
```

Shadow polygon: pre-calculated coordinates for 1.07× scale around center `(110, 110)` — avoids deprecated `scale` + `origin` SVG props.

---

## AnimatedSplash

Shown between the native splash image and the app content. Fades out once fonts, stores, and checks are ready.

Phases managed by a `phase` state: `'intro' | 'idle' | 'exit'`.

```
'intro'  → star scales in (withSpring), overlay fades in (withTiming)
'idle'   → hold (waits for appReady flag)
'exit'   → overlay fades out → onComplete() called → root renders app
```

Single `useEffect` per SharedValue (Reanimated 4 single-owner rule). Phase transitions use `queueMicrotask(() => setPhase(...))` to avoid synchronous setState in effect bodies.

---

## CosmosBackground

```tsx
<CosmosBackground>
  {children}
</CosmosBackground>
```

Renders:
1. A `View` with `backgroundColor: colors.bgBase` filling the screen.
2. An absolute `StarField` sized to `useWindowDimensions()`.
3. A semi-transparent overlay (`bg-bg-surface/20`) for vignette depth.
4. `{children}` on top.

`CosmosBackground` is the **only** consumer of `StarField` — it should not be used standalone.

---

## Reanimated 4 rules applied

1. **Single-owner rule** — each `SharedValue` written in exactly one `useEffect`, driven by a `phase` state.
2. **No `runOnJS`** — Reanimated 4 completion callbacks run on the JS thread automatically.
3. **SharedValues excluded from deps arrays** — stable refs, not listed in `useEffect` deps.
4. **`queueMicrotask`** for `setState` inside effects to avoid Reanimated lint errors.

---

## react-native-svg 15 rules applied

- No deprecated individual transform props (`rotate`, `scale`, `origin`, `originX/Y`).
- All transforms use SVG-standard `transform` string: `rotate(deg cx cy)`, `translate(x y)`.
- Shadow polygons pre-calculate scaled points at build time rather than using SVG `scale`.
