# Feature: Hidden Developer Debug Mode

**Status:** Implemented (2026-05-28)
**Created by:** claude-opus
**Related:** [ask-flow.md](ask-flow.md), [force-update.md](force-update.md), [settings.md](settings.md)

A hidden QA/developer menu, reached the way Android's Developer Options are: **tap the version label in Settings 7 times**, then enter a build-time **PIN**. It exposes local-only debug actions — reset the monthly counter, clear the journal, re-run onboarding, force the update gate, and stub API responses — so QA can exercise the app without consuming API quota or waiting for month rollovers.

> ⚠️ **App Store note:** Apple Guideline 2.3.1 forbids "hidden, dormant, or undocumented features." Before submitting a binary that ships with `EXPO_PUBLIC_DEBUG_PIN` set, **disclose this mode in App Store Connect → Notes for Review** (template at the bottom of this doc). The safest path is to leave the PIN unset in production builds — see [Activation gating](#activation-gating).

---

## Activation flow

```
Settings screen
─────────────────────────────
  Settings
  Version 1.0.0           ← tap 7× within a 3s rolling window
                            taps 1-5: silent
                            tap 6:    Haptics.Light
                            tap 7:    Haptics.Heavy → DebugSheet opens

DebugSheet (locked)
─────────────────────────────
  ⚙ Debug Mode
  Enter developer PIN to continue.
  [ • • • • ]              ← number-pad, secureTextEntry
  [ Unlock ]
        │
        ├─ PIN === DEBUG_PIN → debugStore.activate() → action menu
        └─ wrong / DEBUG_PIN null → "Incorrect PIN", input clears
```

Once unlocked, `debugStore.isActive` stays `true` for the rest of the app session (in-memory). A cold restart re-locks everything.

---

## Activation gating

Two independent gates must both pass:

| Gate | Mechanism | Purpose |
|---|---|---|
| **Gesture** | 7 taps in 3s on the version label | Casual-discovery barrier |
| **PIN** | Entered PIN must equal `DEBUG_PIN` | Second factor; keeps the bundle string useless on its own |

`DEBUG_PIN` comes from `process.env.EXPO_PUBLIC_DEBUG_PIN` (see [config.ts](../../src/constants/config.ts)):

```ts
export const DEBUG_PIN = process.env.EXPO_PUBLIC_DEBUG_PIN ?? null;
```

- **`DEBUG_PIN === null`** (env var unset) → the PIN comparison can never succeed → **debug mode is unreachable.** This is the intended production default.
- **`DEBUG_PIN` set** → QA can unlock with that PIN.

### How to set the PIN

| Context | How |
|---|---|
| Local dev | `.env.local` → `EXPO_PUBLIC_DEBUG_PIN=4242` (auto-loaded by `npm start`) |
| Explicit debug run | `npm run start:debug` (sets the var inline) |
| QA / TestFlight builds | _Future:_ set in an EAS build profile (`eas.json` → `build.qa.env`) |
| Production | **Leave unset** — debug mode then cannot be entered |

> `.env.local` is gitignored. The committed `.env.local.example` documents the variable.

---

## Why `__DEV__` is NOT used as the gate

`__DEV__` is `true` only when running through Metro (`expo start`). It is **`false` in every EAS-built binary** — including TestFlight/internal QA builds, which is exactly where QA needs the debug menu. Gating on `__DEV__` would make the mode unavailable to testers. The PIN-via-env-var approach lets a specific QA build carry the capability while the public release does not.

---

## Why the flag is in-memory (not AsyncStorage)

`debugStore` is a plain in-memory Zustand store with **no persistence**. If `isActive` were written to AsyncStorage, a tester (or a curious user) who activated it once would keep debug mode on across every future launch — a real footgun in a production binary. In-memory means **every cold start re-locks the mode**, which is the safe default for a capability that mutates local state.

This mirrors the [debugStore.ts](../../src/stores/debugStore.ts) design: `mockMode`, `skipMinLoading`, and `forceUpdateOverride` all reset on restart too.

---

## Source files

| File | Role |
|---|---|
| [src/constants/config.ts](../../src/constants/config.ts) | `DEBUG_PIN` from env |
| [src/stores/debugStore.ts](../../src/stores/debugStore.ts) | In-memory flags: `isActive`, `mockMode`, `mockVerdict`, `skipMinLoading`, `forceUpdateOverride` |
| [src/hooks/useDebugTrigger.ts](../../src/hooks/useDebugTrigger.ts) | 7-tap-in-3s detector + progressive haptics |
| [src/components/DebugSheet.tsx](../../src/components/DebugSheet.tsx) | PIN gate + action menu (bottom sheet) |
| [src/services/mockHoraryApi.ts](../../src/services/mockHoraryApi.ts) | Stubbed `HoraryResponse` builder |
| [src/hooks/useHoraryQuery.ts](../../src/hooks/useHoraryQuery.ts) | Real/mock switch based on `debugStore.mockMode` |
| [src/stores/questionsStore.ts](../../src/stores/questionsStore.ts) | `resetMonthlyCount()`, `clearAllEntries()` actions |
| [src/app/_layout.tsx](../../src/app/_layout.tsx) | Renders force-update gate when `forceUpdateOverride` is set |
| [src/app/(tabs)/settings.tsx](../../src/app/(tabs)/settings.tsx) | Version label + tap handler + `<DebugSheet />` |

No new native modules — the feature is **OTA-safe**. (Reuses the already-installed `@gorhom/bottom-sheet` and `expo-haptics`.)

---

## Debug actions

| Section | Action | Effect | Scope |
|---|---|---|---|
| **STATE** | Reset monthly counter → 0 | `questionsStore.resetMonthlyCount()` | Local AsyncStorage |
| **STATE** | Clear all journal entries | `questionsStore.clearAllEntries()` (with confirm Alert) | Local AsyncStorage |
| **NAVIGATION** | Reset onboarding | Removes `ONBOARDING_COMPLETE` flag → `router.replace('/onboarding')` | Local AsyncStorage |
| **NAVIGATION** | Trigger force-update screen | `debugStore.triggerForceUpdate()` → `_layout` renders the gate | In-memory (restart to clear) |
| **MOCK API** | Mock toggle + verdict picker | `debugStore.mockMode` / `mockVerdict` | In-memory |
| **PERFORMANCE** | Skip min loading delay | `debugStore.skipMinLoading` | In-memory |

Every action touches **local device state only**. There is no server-side bypass — the monthly limit is a soft client-side counter, so resetting it changes nothing on the backend.

---

## Mock API responses

When **Mock API** is toggled on, [useHoraryQuery](../../src/hooks/useHoraryQuery.ts) routes the mutation to `mockHoraryApi.ask()` instead of the real `horaryApi.ask()`:

```ts
const { mockMode, mockVerdict, skipMinLoading } = useDebugStore.getState();
const call = mockMode
  ? mockHoraryApi.ask(request, mockVerdict)
  : horaryApi.ask(request);
return skipMinLoading ? call : withMinDuration(call, LOADING_MIN_DURATION);
```

The stub returns a fully-formed `HoraryResponse` (verdict, confidence band, three significators, VOC moon for `UNCLEAR`) after a short delay. All downstream behaviour is unchanged: the journal entry is written, navigation runs, animations play. Summaries are prefixed `[MOCK]` so a mocked reading is never mistaken for a real one.

**What it unlocks for QA:**
- Tap YES/NO/MAYBE/UNCLEAR repeatedly to test journal grouping and VerdictCard variants
- Test VOC-moon and low-confidence banners on demand (`UNCLEAR` verdict)
- Offline QA — no network or API key required
- No API quota consumed

Verdict → response mapping lives in [mockHoraryApi.ts](../../src/services/mockHoraryApi.ts).

---

## Security model

| Concern | Mitigation |
|---|---|
| Casual discovery | 7-tap gesture + PIN; no "debug" string in the user-facing i18n bundle |
| PIN in JS bundle | PIN is an env var resolved at build time; production builds omit it entirely |
| Persistent accidental activation | In-memory flag — cleared on every cold start |
| Worst case if a user unlocks it | They reset their own local counter / journal; no other user's data, no server state, no secret exposure |
| API key leak | No "network log dump" action exists in this MVP. **If one is added later, the Authorization header MUST be redacted** before display (the astrology-api.io key rides in `Authorization: Bearer …`). |
| Birth/location PII | No debug action surfaces or transmits PII; keep it that way if extending |

**Debug strings are deliberately hardcoded English in `DebugSheet.tsx`, NOT in `src/i18n/*`** — this keeps debug vocabulary out of the shipped translation files. The only i18n addition is the innocuous `settings.appVersion` label.

---

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 errors
npm test            # 10/10 pass
```

Manual smoke test (run with `npm run start:debug`, PIN `4242`):

- [ ] Settings → tap version label 7× quickly → haptic on 6th & 7th → sheet opens
- [ ] Pause >3s mid-sequence → counter resets, sheet does not open
- [ ] Enter wrong PIN → "Incorrect PIN", input clears
- [ ] Enter `4242` → action menu appears
- [ ] Reset monthly counter → Home counter shows 0/5
- [ ] Clear journal → confirm → Journal tab is empty
- [ ] Reset onboarding → app navigates to first-launch flow
- [ ] Trigger force-update → update gate appears; restart app → gate gone
- [ ] Mock API ON, pick NO → ask any question → verdict screen shows `[MOCK]` NO
- [ ] Skip min loading ON + mock → verdict appears almost instantly
- [ ] Run `npm start` (no PIN env) → version unset case: PIN gate cannot be passed

---

## App Store Connect — Notes for Review template

> This build contains a developer diagnostic mode for QA, accessed by tapping the version number in Settings seven times and entering a numeric PIN. It modifies only local on-device state (resets a local question counter, clears the local journal, replays onboarding, and stubs API responses for offline testing). It performs no server-side actions and bypasses no purchases or entitlements. The production release omits the PIN and the mode is unreachable.

---

## Future considerations (out of scope)

- Move the PIN to an EAS build-profile env (`eas.json`) so QA and prod builds diverge cleanly
- Optional biometric/extra-PIN gate **if** sensitive actions (network log, API key view) are ever added
- A visible "DEBUG" watermark while `isActive` so testers never confuse a mocked session with production
