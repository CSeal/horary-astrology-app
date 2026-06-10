---
created_by: compound-v-phase1c-library-validator
updated_by: compound-v-phase1c-library-validator
source_inputs:
  - Context7 MCP (/facebook/react-native-website, /gorhom/react-native-bottom-sheet, /websites/swmansion_react-native-gesture-handler, /expo/expo sdk-55)
  - WebSearch (npmjs.com, github.com)
  - package.json @ project root
reviewed_by: pending
date: 2026-06-10
topic: keyboard-dismissal-api-surface
---

# Library Audit — Keyboard Dismissal API Surface (2026-06-10)

Scope: validate the current, live API surface for keyboard dismissal across the
five libraries the Expo project uses. Findings only — no implementation.

---

## 1. Tools Available

| Tool | Status |
|---|---|
| Context7 MCP | ✅ Available (RN, bottom-sheet, RNGH, Expo all indexed) |
| WebSearch fallback | ✅ Used to confirm latest registry versions + open issues |
| Manifest found | ✅ `/Users/user/Dev/react-native/horary-astrology-v1-app/package.json` |

Not degraded. Context7 primary, WebSearch used only for live version numbers and
GitHub issue currency that Context7 does not track.

Note: Context7's bottom-sheet index snapshot is v5.2.6; RN docs snapshot is
v0.85/0.86 (RN website is ahead of the project's 0.83.6, so the documented
surface is forward-compatible — nothing in scope was removed between 0.83 and
0.86).

---

## 2. Libraries Mentioned

| Library | Spec context | Pinned (package.json) | Current stable | Last release | Maintenance | Status |
|---|---|---|---|---|---|---|
| react-native | Keyboard API, KeyboardAvoidingView, ScrollView | `0.83.6` | 0.83.x line current; 0.85/0.86 docs published | 0.83.6 is a recent patch | Active (Meta) | 🟢 OK |
| @gorhom/bottom-sheet | keyboardBehavior / keyboardBlurBehavior / BottomSheetTextInput | `^5.2.14` | **5.2.14** | ~May 2026 | Active | 🟢 OK (pinned == latest) |
| react-native-gesture-handler | RNGH ScrollView / Pressable | `~2.30.0` | **3.0.0** | Jun 2026 (hours old) | Active (Software Mansion) | 🟡 MEDIUM (one major behind) |
| expo-router | nav-driven keyboard dismiss | `~55.0.16` (SDK 55) | SDK 55 current | current | Active (Expo) | 🟢 OK |
| react-native Keyboard (sub-module) | Keyboard.dismiss / addListener | bundled w/ RN 0.83.6 | n/a | n/a | Active | 🟢 OK |

---

## 3. API Signatures Verified

All signatures below confirmed against live Context7 docs (RN website v0.85/0.86,
forward-compatible with 0.83.6) and bottom-sheet `src/constants.ts` @ master.

| API | Signature / valid values (verified) | Status | Notes |
|---|---|---|---|
| `Keyboard.dismiss()` | `Keyboard.dismiss(): void` — no args | 🟢 | Unchanged since RN 0.36. Still the canonical programmatic dismiss. |
| `Keyboard.addListener(event, cb)` | returns `EmitterSubscription` with `.remove()` | 🟢 | Events: `keyboardWillShow`, `keyboardDidShow`, `keyboardWillHide`, `keyboardDidHide`, `keyboardWillChangeFrame`, `keyboardDidChangeFrame`. `will*` events are **iOS-only** (Android has no pre-animation callback unless `android:windowSoftInputMode=adjustResize` + edge-to-edge). Use `.remove()` on the subscription — `Keyboard.removeListener` was removed in RN 0.65+. |
| `KeyboardAvoidingView` `behavior` | `enum('height' \| 'position' \| 'padding')` | 🟢 | iOS: `'padding'` recommended. Android: `'height'` (legacy) — but see §6, with edge-to-edge default in SDK 55 `'padding'` often works on both. Also: `enabled`, `keyboardVerticalOffset` (number, default 0), `contentContainerStyle` (only when `behavior='position'`). |
| `TouchableWithoutFeedback` + `Keyboard.dismiss` | `<TouchableWithoutFeedback onPress={Keyboard.dismiss}>` | 🟢 | Still the documented RN pattern (verified in RN 0.85/0.86 KeyboardAvoidingView example). NOT deprecated. See §5 for the newer-alternative note. |
| `ScrollView.keyboardDismissMode` | iOS: `'none' \| 'on-drag' \| 'interactive'` · Android: `'none' \| 'on-drag'` | 🟢 | `'interactive'` is **iOS-only**; on Android it silently behaves as `'none'`. Default `'none'`. |
| `ScrollView.keyboardShouldPersistTaps` | `'never' \| 'always' \| 'handled'` (+ deprecated `false`/`true`) | 🟢 | `false`→use `'never'`; `true`→use `'always'`. Default `'never'`. Cross-platform. |
| bottom-sheet `keyboardBehavior` | `'interactive' \| 'extend' \| 'fillParent'` | 🟢 | Confirmed from `src/constants.ts` KEYBOARD_BEHAVIOR. **No `'none'` value exists** — see §4. Default is `'interactive'`. |
| bottom-sheet `keyboardBlurBehavior` | `'none' \| 'restore'` | 🟢 | Confirmed from KEYBOARD_BLUR_BEHAVIOR. Default `'none'`. `'restore'` has open correctness bugs — see §5. |
| bottom-sheet `android_keyboardInputMode` | `'adjustPan' \| 'adjustResize'` | 🟢 | KEYBOARD_INPUT_MODE. Relevant: with `adjustResize` on Android, the `interactive` behavior's position math is intentionally skipped (verified in BottomSheet.tsx). |
| `BottomSheetTextInput` | drop-in TextInput with built-in sheet keyboard coordination | 🟢 | Use this, NOT raw `TextInput`, inside a sheet so position tracking works. |
| RNGH `Pressable` | `onPress?: (event: PressableEvent) => void` | 🟢 | Calling `Keyboard.dismiss()` inside `onPress` is safe — runs on JS thread. |
| RNGH `ScrollView` keyboard props | accepts `keyboardDismissMode` / `keyboardShouldPersistTaps` (passthrough to RN ScrollView) | 🟠 | Props exist and pass through, BUT `keyboardShouldPersistTaps="handled"` does not register RNGH `Pressable`/`Gesture.Tap()` taps as "handled" — open bug, see §5. |
| expo-router `useFocusEffect` | `useFocusEffect(callback)` from `'expo-router'` | 🟢 | Valid import + pattern for run-on-focus / cleanup-on-blur. |

---

## 4. Critical Findings 🔴

**None.** No removed or broken APIs in the keyboard-dismissal surface for the
pinned versions.

One clarification that prevents a runtime crash (not a 🔴 because nothing in the
repo currently uses it, but flag it for the plan):

- **bottom-sheet `keyboardBehavior` has NO `'none'` value.** The valid enum is
  exactly `'interactive' | 'extend' | 'fillParent'` (verified
  `src/constants.ts`). The task brief listed `"none"` as a candidate — that value
  does not exist and TypeScript will reject it. To disable adjustment, omit the
  prop behavior coordination via `BottomSheetTextInput` or use `'extend'`.
  Source: https://github.com/gorhom/react-native-bottom-sheet/blob/master/src/constants.ts

---

## 5. High-Priority Findings 🟠

### 5.1 — RNGH `ScrollView` `keyboardShouldPersistTaps="handled"` does not honor RNGH Pressable taps
- Issue #3926, opened 2026-01-19, **OPEN** as of 2026-06-10 (verified via search).
- Symptom: a tap on an RNGH `Pressable` (or `Gesture.Tap()`) inside an RNGH
  `ScrollView` is not counted as "handled", so the keyboard dismisses and the
  child sometimes does not receive the tap — the exact opposite of the
  `"handled"` contract.
- Affects iOS + Android.
- Mitigation for the plan: for taps-while-keyboard-open inside a scroll context,
  prefer **RN core `ScrollView`** (not the RNGH one) when you need
  `keyboardShouldPersistTaps="handled"` to interact correctly with buttons. The
  RN core ScrollView honors `"handled"` correctly.
- Source: https://github.com/software-mansion/react-native-gesture-handler/issues/3926

### 5.2 — bottom-sheet `keyboardBlurBehavior="restore"` correctness bugs
- Open issues #1887 (v5) "Incorrect restore behavior" and #2465 "restore not
  working" — the sheet does not return to its prior detent after the keyboard
  dismisses in several configurations.
- Affects the project's pinned `5.2.14`.
- Mitigation: do not rely on `"restore"` for critical UX; if a sheet must return
  to a fixed snap point after keyboard close, drive it explicitly via the sheet
  ref (`snapToIndex`) on a `keyboardDidHide` listener rather than trusting
  `"restore"`.
- Sources:
  https://github.com/gorhom/react-native-bottom-sheet/issues/1887
  https://github.com/gorhom/react-native-bottom-sheet/issues/2465

### 5.3 — `BottomSheetScrollView` + keyboard leaves residual blank space / sheet won't lower
- Open issues #2509 (sheet does not go back down after keyboard close when using
  `BottomSheetScrollView`) and #2093 (extra blank space on Android).
- `BottomSheetScrollView` does NOT fully inherit/auto-correct for the sheet's
  keyboard behavior on close in these cases — the scroll content can retain the
  keyboard's vacated height.
- Mitigation: pair `BottomSheetTextInput` with `keyboardBehavior` deliberately,
  test the close path on Android specifically, and consider an explicit
  `snapToIndex` reset on `keyboardDidHide`.
- Sources:
  https://github.com/gorhom/react-native-bottom-sheet/issues/2509
  https://github.com/gorhom/react-native-bottom-sheet/issues/2093

### 5.4 — `TouchableWithoutFeedback` + `Keyboard.dismiss` is valid but not the modern best-practice for complex forms
- The pattern is still documented and correct in RN 0.85/0.86 — NOT deprecated.
- However, for multi-input forms the Expo SDK 55 keyboard-handling guide now
  steers toward `react-native-keyboard-controller`
  (`KeyboardAwareScrollView` + `KeyboardToolbar`) for focus-following and
  toolbar dismiss. That library is NOT currently a dependency. This is an
  alternative to evaluate, not a required migration — the core
  `TouchableWithoutFeedback` + `Keyboard.dismiss` tap-to-dismiss remains fine for
  simple screens.
- Source: https://github.com/expo/expo/blob/sdk-55/docs/pages/guides/keyboard-handling.mdx

---

## 6. Medium Findings 🟡

### 6.1 — react-native-gesture-handler is one major version behind
- Pinned `~2.30.0`; current stable is **3.0.0** (released June 2026).
- 2.30.0 is fully functional and still receives the keyboard prop passthrough;
  this is not a blocker for keyboard work. Migration to 3.0.0 is out of scope for
  this audit (that's `/sdk:upgrade` territory) and the #3926 bug (§5.1) is
  unfixed in 3.0.0 anyway, so upgrading does NOT resolve the keyboard issue.
- Source: https://www.npmjs.com/package/react-native-gesture-handler

### 6.2 — `KeyboardAvoidingView` `behavior` per-platform + edge-to-edge in SDK 55
- The classic guidance is iOS `'padding'`, Android `'height'`. With Expo SDK 55
  defaulting to edge-to-edge on Android, `behavior='padding'` frequently behaves
  better on Android than the legacy `'height'`. Test both on a real Android
  device before locking the value in the plan. `'position'` is the most
  finicky and only useful with `contentContainerStyle`.
- Source (forward-compatible RN docs):
  https://github.com/facebook/react-native-website/blob/main/website/versioned_docs/version-0.86/keyboardavoidingview.md

### 6.3 — `Keyboard` `will*` events are iOS-only
- `keyboardWillShow` / `keyboardWillHide` / `keyboardWillChangeFrame` fire on iOS
  only. On Android, only the `did*` variants are reliable. Any pre-animation
  keyboard logic must not depend on `will*` for Android parity.

### 6.4 — expo-router navigation does NOT guarantee keyboard auto-dismiss
- There is no documented expo-router/React Navigation API that auto-dismisses the
  keyboard on `router.push` / `router.replace`. Behavior is platform-incidental:
  on iOS a screen transition often resigns first-responder (keyboard closes); on
  Android the keyboard frequently persists across navigation.
- Do NOT assume navigation closes the keyboard. The reliable pattern is an
  explicit `Keyboard.dismiss()` before navigating, or a `useFocusEffect` cleanup
  that calls `Keyboard.dismiss()` on blur:
  `useFocusEffect(() => () => Keyboard.dismiss())` (verified `useFocusEffect`
  import + cleanup signature from `'expo-router'`).
- Source: https://github.com/expo/expo/blob/sdk-55/docs/pages/router/advanced/native-tabs.mdx

---

## 7. Design Constraints for the Plan

MUST:
- MUST call `Keyboard.dismiss()` explicitly before `router.push`/`router.replace`
  (or in a `useFocusEffect` blur-cleanup) — navigation does not reliably dismiss
  on Android (§6.4).
- MUST use `BottomSheetTextInput` (not raw `@/tw` TextInput / RN TextInput) for
  any text field inside a `@gorhom/bottom-sheet`, so the sheet's keyboard
  position tracking engages (§3, §5.3).
- MUST use `'interactive' | 'extend' | 'fillParent'` for bottom-sheet
  `keyboardBehavior` — `'none'` is not a valid value and will fail typecheck (§4).
- MUST remove `Keyboard.addListener` subscriptions via the returned
  subscription's `.remove()` in the effect cleanup (`Keyboard.removeListener` is
  gone) (§3).
- MUST treat `keyboardDismissMode='interactive'` as iOS-only; provide
  `'on-drag'` as the Android-acceptable fallback if drag-dismiss is desired (§3).
- MUST test the bottom-sheet keyboard close path on a real Android device before
  sign-off (residual-space bug #2509/#2093) (§5.3).

MUST NOT:
- MUST NOT rely on bottom-sheet `keyboardBlurBehavior='restore'` to return the
  sheet to its prior snap point — drive it explicitly via the sheet ref instead
  (§5.2).
- MUST NOT use the RNGH `ScrollView` when you need
  `keyboardShouldPersistTaps='handled'` to keep buttons tappable while the
  keyboard is open — use RN core `ScrollView` for that case (#3926) (§5.1).
- MUST NOT depend on `keyboardWill*` events for Android keyboard timing (§6.3).
- MUST NOT assume RNGH `Pressable` tap registers as "handled" against
  `keyboardShouldPersistTaps` (§5.1).

---

## 8. Open Questions for the Human

1. **Forms vs. simple dismiss.** Does any keyboard-bearing screen have
   multiple stacked inputs where the keyboard would obscure a field? If yes,
   evaluate adding `react-native-keyboard-controller` (not a current dep) for
   `KeyboardAwareScrollView`/`KeyboardToolbar`. If all screens are single-input
   (Home/Ask, journal note), the core `TouchableWithoutFeedback` +
   `Keyboard.dismiss` pattern is sufficient — no new dependency. ESCALATE: scope
   decision, adds a dependency.
2. **RNGH 2.30 → 3.0 upgrade.** Out of scope here, but flagging: a major bump is
   available. It does NOT fix the keyboard bug (#3926), so there is no
   keyboard-driven reason to upgrade now. Confirm whether the upgrade is tracked
   separately via `/sdk:upgrade`.

---

## 9. Knowledge Base Updates

Appended to:
`/Users/user/Dev/react-native/horary-astrology-v1-app/docs/superpowers/library-audit/_knowledge-base/expo-react-native.md`
under `## Updated 2026-06-10 — Keyboard dismissal API surface`.

Captured: Keyboard.dismiss/addListener currency, removeListener removal,
KeyboardAvoidingView behavior enum + edge-to-edge note, ScrollView
keyboardDismissMode/keyboardShouldPersistTaps valid values + platform splits,
bottom-sheet keyboardBehavior/keyboardBlurBehavior enums (no 'none'), the three
open bottom-sheet keyboard bugs (#1887/#2465/#2509/#2093), RNGH ScrollView
keyboardShouldPersistTaps="handled" bug (#3926), RNGH now at 3.0.0, and
expo-router non-auto-dismiss behavior.
