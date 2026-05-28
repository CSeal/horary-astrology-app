# Feature: Onboarding

**Status:** Implemented (Stage 5d — Polish)
**Created by:** claude-sonnet (2026-05-26)

A 3-step first-run flow that introduces the app, explains how horary astrology works, and requests location permission. Shown once — gated by an AsyncStorage flag.

---

## How it works

```
Root _layout.tsx (boot)
  └─ reads AsyncStorage 'horary_onboarding_complete'
        ├─ '1' found  → navigate to '/' (Home)
        └─ not found  → navigate to '/onboarding'

OnboardingScreen
  ├─ Step 0: Welcome — app name + tagline
  ├─ Step 1: How it works — Ask / Cast / Verdict cards + bullet points
  └─ Step 2: Location — request permission → write flag → navigate Home
```

Completion writes `ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETE = '1'` to AsyncStorage regardless of whether location was granted or denied. The user can grant location later from Settings.

---

## Source files

| File | Role |
|---|---|
| [src/app/onboarding.tsx](../../src/app/onboarding.tsx) | Full onboarding screen (all 3 steps) |
| [src/app/_layout.tsx](../../src/app/_layout.tsx) | Boot gate — reads flag, redirects |
| [src/services/locationService.ts](../../src/services/locationService.ts) | `requestPermission()` called on Step 3 |
| [src/constants/config.ts](../../src/constants/config.ts) | `ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETE` |

---

## Steps

### Step 0 — Welcome
- App name in Cormorant Garamond (display)
- Tagline: *"Ask a sincere question. The sky will answer."*
- Navigation: Skip (goes to completion) + Next / Get Started button

### Step 1 — How it works
- Title: "How It Works"
- 3 HowCards in a horizontal row: Ask (HelpCircle icon) / Cast (Jupiter glyph, violet) / Verdict (Star icon)
- 3 numbered bullet points below the cards
- Navigation: Skip + Next, Back link

### Step 2 — Location permission
- MapPin icon (gold, 56px)
- Title: "Allow Location"
- Body: why location is needed for horary (exact birth-moment place)
- Privacy note: coordinates are not stored, only used for chart calculation
- "Allow Location" primary button → calls `locationService.requestPermission()` → finish
- "Maybe Later" secondary button → finish without requesting

---

## Navigation guards

The root `_layout.tsx` runs this logic once on boot, after fonts and stores are hydrated:

```ts
const onboardingComplete = await AsyncStorage.getItem(
  ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETE
);
if (!onboardingComplete && segments[0] !== 'onboarding') {
  router.replace('/onboarding');
} else if (onboardingComplete && segments[0] === 'onboarding') {
  router.replace('/');
}
```

This prevents the user from being sent back to onboarding after completion, and prevents direct URL access to `/onboarding` after it's done.

---

## Completion flag

`finish()` function:
```ts
await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETE, '1');
router.replace('/');
```

Non-fatal: if `AsyncStorage.setItem` throws, the catch block still calls `router.replace('/')`. On next boot, the flag will still be absent and onboarding will show again — acceptable edge case.

---

## Skip behavior

- Steps 0 and 1 show a "Skip" button in the top-right corner that calls `finish()` directly.
- Step 2 shows no Skip button — only "Maybe Later" (same effect: calls `finish()` without requesting location).

---

## CosmosBackground

All three steps render inside `<CosmosBackground>` — the same animated star field used throughout the app. This makes the onboarding feel like part of the same visual world rather than a standalone flow.
