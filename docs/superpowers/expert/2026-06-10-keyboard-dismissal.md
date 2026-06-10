---
created_by: Compound V Phase 1B — Domain-Expert Advisor (keyboard dismissal)
updated_by: Compound V Phase 1B
source_inputs:
  - gorhom.dev/react-native-bottom-sheet/props (props reference, fetched 2026-06-10)
  - reactnative.dev/docs/keyboard (fetched 2026-06-10)
  - docs.expo.dev/guides/keyboard-handling (fetched 2026-06-10)
  - multiple gorhom/react-native-bottom-sheet GitHub issues (cited inline)
  - codebase grep of src/ (current keyboard usage)
reviewed_by: pending
date: 2026-06-10
domain: react-native-keyboard
stack: Expo SDK ~55.0.26 · React Native 0.83.6 · New Arch/Fabric (default on) · @gorhom/bottom-sheet ^5.2.14 · react-native-gesture-handler ~2.30.0 · NativeWind v5 / react-native-css ^3.0.7 · expo-router ~55.0.16
---

# Keyboard Dismissal Domain Audit — Hora App

## 1. Domain(s) Identified

- **react-native-keyboard** (primary) — keyboard dismissal, avoidance, and focus across iOS/Android on RN 0.83 New Architecture.
- Sub-surfaces: `@gorhom/bottom-sheet` v5 keyboard props, Android edge-to-edge + `softwareKeyboardLayoutMode`, expo-router navigation focus retention.

No prior KB file existed for this domain. `react-native-keyboard.md` created this pass.

## 2. Sources Consulted

**KB reused:** none (no `react-native-keyboard.md` existed before this pass). Related: `_knowledge-base/rn-expo-testing.md` (stack versions confirmed consistent).

**Codebase reality (grep of `src/`):**
- `onboarding.tsx`, `settings.tsx`, `index.tsx`: plain screens use `ScrollView keyboardShouldPersistTaps="handled"` + manual `Keyboard.dismiss()`.
- `settings.tsx`: uses `KeyboardAvoidingView` + a `Keyboard.addListener('keyboardDidHide', …)`.
- `LocationPickerSheet.tsx`, `DebugSheet.tsx`: gorhom `BottomSheet` with `keyboardBehavior="interactive"` + `keyboardBlurBehavior="restore"`, `BottomSheetScrollView keyboardShouldPersistTaps="handled"`, `BottomSheetTextInput`. **Neither sheet sets `android_keyboardInputMode`** (defaults to `adjustPan`).
- `app.json`: `android.softwareKeyboardLayoutMode: "pan"`; `newArchEnabled` NOT set → **defaults ON** in SDK 55; edge-to-edge NOT explicitly configured → **defaults ON** for Android in SDK 53+.

**Official / authoritative:**
- gorhom props reference — [keyboardBehavior/keyboardBlurBehavior/android_keyboardInputMode](https://gorhom.dev/react-native-bottom-sheet/props)
- [RN Keyboard module docs](https://reactnative.dev/docs/keyboard)
- [RN KeyboardAvoidingView docs](https://reactnative.dev/docs/keyboardavoidingview)
- [Expo Keyboard handling guide](https://docs.expo.dev/guides/keyboard-handling/)
- [gorhom Discussion #233 — Keyboard Handling (released spec)](https://github.com/gorhom/react-native-bottom-sheet/discussions/233)

**Practitioner / community:**
- [gorhom #2544 — v5 keyboardBlurBehavior="restore" broken in BottomSheetModal](https://github.com/gorhom/react-native-bottom-sheet/issues/2544)
- [gorhom #2545 — iOS restore + extend regression](https://github.com/gorhom/react-native-bottom-sheet/issues/2545)
- [gorhom #1887 — v5 restore alpha.10 regression](https://github.com/gorhom/react-native-bottom-sheet/issues/1887)
- [gorhom #2661 — keyboard overlaps sheet with autoFocus](https://github.com/gorhom/react-native-bottom-sheet/issues/2661)
- [gorhom #1934 — Android: TextInput at bottom of scrollview falls behind keyboard](https://github.com/gorhom/react-native-bottom-sheet/issues/1934)
- [gorhom #1602 — Android: keyboard closes sheet with enableDynamicSizing](https://github.com/gorhom/react-native-bottom-sheet/issues/1602)
- [gorhom #1787 — controlled BottomSheetTextInput dismisses keyboard on value change](https://github.com/gorhom/react-native-bottom-sheet/issues/1787)
- [RN #45798 — TextInput keyboard dismissed automatically on New Arch](https://github.com/facebook/react-native/issues/45798)
- [react-native-screens #1342 — keyboard closes immediately in stack screen (Android)](https://github.com/software-mansion/react-native-screens/issues/1342)
- [react-navigation #10706 — keyboard dismiss while navigating back](https://github.com/react-navigation/react-navigation/issues/10706)
- [keyboard-controller #1411 — Expo 55 / RN 0.83 / Fabric toolbar + scroll regression](https://github.com/kirillzyusko/react-native-keyboard-controller/issues/1411)
- [Android 15 edge-to-edge in RN/Expo fix guide](https://www.72technologies.com/blog/android-15-edge-to-edge-react-native-expo)
- [RN community proposal #827 — Android 15 edge-to-edge enforcement](https://github.com/react-native-community/discussions-and-proposals/discussions/827)

**Search queries run (parallel, 2026-06-10):** gorhom v5 keyboard props; RN 0.83 Fabric keyboard dismiss; Android edge-to-edge softwareKeyboardLayoutMode pan/resize; gorhom keyboard-not-dismissing issues; keyboardShouldPersistTaps onPress (no SO hits); keyboard-controller vs KeyboardAvoidingView; ScrollView keyboardDismissMode iOS/Android; reddit KeyboardAvoidingView edge-to-edge; expo-router navigation keyboard focus; gorhom android_keyboardInputMode.

---

## 3. Domain Constraints the Brainstorm Probably Missed (MUST / MUST NOT / SHOULD)

1. **MUST set `keyboardShouldPersistTaps="handled"` on every ScrollView/FlatList that contains both a TextInput and tappable elements (buttons, list rows).** Default is `"never"`: the first outside tap is consumed purely to dismiss the keyboard, so the button's `onPress` does NOT fire on that tap — the user must tap twice. The codebase already does this on its plain screens; the sheets do too. Keep this invariant on any NEW container. Source: [RN ScrollView keyboardShouldPersistTaps](https://reactnative.dev/docs/scrollview#keyboardshouldpersisttaps).

2. **MUST NOT call `Keyboard.dismiss()` (or anything that blurs) BEFORE the submit/select callback reads the input value or fires.** With `keyboardShouldPersistTaps="handled"`, a submit button tap fires `onPress` directly — good. But an outer `Pressable`/`TouchableWithoutFeedback` that wraps the screen and calls `Keyboard.dismiss()` can swallow or race the inner button press. Order of operations: read value → run callback → then dismiss.

3. **MUST treat `keyboardWillShow` / `keyboardWillHide` / `keyboardWillChangeFrame` as iOS-only.** On Android only `keyboardDidShow` / `keyboardDidHide` fire. `settings.tsx` already uses `keyboardDidHide` (correct, cross-platform). Any new logic that listens for `keyboardWillHide` will silently no-op on Android. Source: [RN Keyboard docs](https://reactnative.dev/docs/keyboard) — "Only `keyboardDidShow` and `keyboardDidHide` are available on Android."

4. **MUST use `keyboardDismissMode="on-drag"` (NOT `"interactive"`) when the goal is cross-platform scroll-to-dismiss.** `"interactive"` works on iOS only; on Android it behaves like `"none"` (no dismiss on scroll). Source: [RN ScrollView keyboardDismissMode](https://reactnative.dev/docs/scrollview#keyboarddismissmode); corroborated by community summary that "interactive mode is exclusive to iOS."

5. **MUST account for New Architecture (Fabric) being ON by default.** `app.json` does not set `newArchEnabled`; SDK 55 / RN 0.83 default it to `true`. There are open RN/Fabric keyboard regressions (see Traps #5, #6). Verify keyboard focus/dismiss on a real Fabric build, not Expo Go assumptions.

6. **MUST account for Android edge-to-edge being ON by default (SDK 53+).** Edge-to-edge changes how IME insets are delivered. With edge-to-edge + `adjustResize`, the window is NOT auto-resized — behavior approaches `adjustNothing`, i.e. the app must handle keyboard avoidance itself (matching iOS). Source: [keyboard-controller docs via search summary] + [72technologies edge-to-edge guide](https://www.72technologies.com/blog/android-15-edge-to-edge-react-native-expo).

7. **SHOULD use `padding` behavior (not `height`) for `KeyboardAvoidingView` on Android under edge-to-edge.** `settings.tsx` already wraps in `KeyboardAvoidingView` — verify its `behavior` prop is `padding`/`undefined` per platform, not `height`, or it will jump/black-bar under edge-to-edge. Source: [Expo keyboard guide](https://docs.expo.dev/guides/keyboard-handling/) (iOS `"padding"`, Android `undefined`).

8. **SHOULD hide bottom tabs on keyboard via `tabBarHideOnKeyboard` (Android) rather than relying on `pan`.** With `softwareKeyboardLayoutMode: "pan"` the whole window pans up, which can push the tab bar above the keyboard. The Hora app uses `(tabs)` — if a TextInput lives on a tab screen (Home/Ask `index.tsx`, settings), set `tabBarHideOnKeyboard: true` in the tab screen options. Source: [Expo keyboard guide](https://docs.expo.dev/guides/keyboard-handling/).

---

## 4. Common Traps in This Domain

1. **Double-tap dead button.** Missing `keyboardShouldPersistTaps="handled"` → first tap only dismisses keyboard, `onPress` ignored. Most common keyboard bug in RN. (Codebase already guards its current containers; the trap is for new code.)

2. **Wrapping the whole screen in `TouchableWithoutFeedback` to dismiss.** Historically `TouchableWithoutFeedback onPress={Keyboard.dismiss}` stopped working/became flaky in Expo; it also blocks scroll and can eat child presses. Prefer `keyboardShouldPersistTaps="handled"` on the ScrollView + explicit dismiss on real outside taps, or a `Pressable` overlay that does NOT cover interactive children. Source: [expo #10667 — TouchableWithoutFeedback not dismissing keyboard](https://github.com/expo/expo/issues/10667).

3. **gorhom v5 `keyboardBlurBehavior="restore"` is partially broken.** Multiple open v5 issues: `restore` does not return the sheet to its prior snap point in `BottomSheetModal`, and `restore` + `extend` misbehaves on iOS. The Hora sheets use `interactive` + `restore` (not `extend`), which is the safer combo, but VERIFY restore actually restores after dismiss on both platforms. If broken, drop `keyboardBlurBehavior` (default `none`) and let the sheet stay put. Sources: [#2544](https://github.com/gorhom/react-native-bottom-sheet/issues/2544), [#2545](https://github.com/gorhom/react-native-bottom-sheet/issues/2545), [#1887](https://github.com/gorhom/react-native-bottom-sheet/issues/1887). (≥3 distinct v5 threads — treat as real, not isolated.)

4. **Android `BottomSheetTextInput` at the bottom of `BottomSheetScrollView` falls behind the keyboard.** With default `android_keyboardInputMode="adjustPan"`, the last input can be hidden by the keyboard on Android. The Hora sheets do NOT set `android_keyboardInputMode`. Inputs near the bottom of `LocationPickerSheet`/`DebugSheet` are at risk on Android. Fix: set `android_keyboardInputMode="adjustResize"` on the sheet (combined with `keyboardBehavior="interactive"`). Sources: [#1934](https://github.com/gorhom/react-native-bottom-sheet/issues/1934), [#1981](https://github.com/gorhom/react-native-bottom-sheet/issues/1981). (2 distinct threads spanning v4/v5.)

5. **Controlled `BottomSheetTextInput` dismisses keyboard on every value change.** Reported: controlled inputs (`value` + `onChangeText`) inside a sheet drop the keyboard on change; uncontrolled inputs are fine. If `LocationPickerSheet` search filters as you type with a controlled input, watch for this. Source: [#1787](https://github.com/gorhom/react-native-bottom-sheet/issues/1787). (Isolated-to-few report — verify on this version 5.2.14 before treating as constraint.)

6. **New Arch: TextInput auto-dismisses on focus when wrapped in a conditionally-styled View.** On Fabric (both platforms), a TextInput inside a View whose style changes on focus can drop the keyboard the instant it's tapped. NativeWind className changes on focus (`focus:` variants) can trigger this. Source: [RN #45798](https://github.com/facebook/react-native/issues/45798). (Single high-traffic RN issue — credible signal; verify on RN 0.83.6.)

7. **Stack-screen keyboard closes immediately (Android).** react-native-screens regression where keyboard opens then instantly closes for a TextInput inside a navigation stack screen on Android; historically fixed by aligning `react-native-screens` version. Hora is on `react-native-screens ^4.25.2`. Source: [react-native-screens #1342](https://github.com/software-mansion/react-native-screens/issues/1342). (Verify, version-dependent.)

8. **`autoFocus` on `BottomSheetTextInput` fights the sheet/keyboard animation.** autoFocus opens the keyboard before the sheet animation settles, causing overlap/jump. If any sheet input auto-focuses on open, focus it AFTER the sheet's open animation completes instead. Source: [#2661](https://github.com/gorhom/react-native-bottom-sheet/issues/2661).

9. **`enableDynamicSizing` + keyboard collapses the sheet on Android.** `LocationPickerSheet` already sets `enableDynamicSizing={false}` (good — the in-code comment cites the 0-height collapse bug). Keep dynamic sizing OFF on any keyboard-bearing sheet. Source: [#1602](https://github.com/gorhom/react-native-bottom-sheet/issues/1602).

10. **Backdrop press dismisses the modal before the keyboard, leaving a ghost keyboard.** Tapping the sheet backdrop while a `BottomSheetTextInput` is focused can close the sheet but leave the keyboard up briefly. Dismiss keyboard explicitly in the backdrop/close handler before/with the sheet close.

---

## 5. Regulatory / Compliance Notes

None. Keyboard dismissal is a pure UX/platform-behavior domain with no regulatory, privacy, or accessibility-mandated rules beyond general usability. (Accessibility note, non-regulatory: do not auto-dismiss the keyboard on focus changes that a screen-reader user is navigating — but this is not triggered by current scope.)

---

## 6. Recent Breaking Changes (last 12 months)

1. **Android edge-to-edge default ON (Expo SDK 53, carried into 54/55).** Changes IME inset delivery; `adjustResize` no longer auto-resizes the window under edge-to-edge → app must handle avoidance like iOS. Affects every Android keyboard surface in this app. Source: [Expo SDK 53 edge-to-edge](https://www.72technologies.com/blog/android-15-edge-to-edge-react-native-expo), [community #827](https://github.com/react-native-community/discussions-and-proposals/discussions/827).

2. **New Architecture (Fabric) default ON (SDK 55 / RN 0.83).** Surfaced new keyboard regressions: TextInput auto-dismiss on focus ([RN #45798](https://github.com/facebook/react-native/issues/45798)), and keyboard-controller toolbar/scroll regressions specifically on Expo 55 / RN 0.83 / Fabric ([keyboard-controller #1411](https://github.com/kirillzyusko/react-native-keyboard-controller/issues/1411)).

3. **gorhom v5 (the app's `^5.2.14`) keyboard prop API + regressions.** v5 keeps `keyboardBehavior` (`extend` | `fillParent` | `interactive`, default `interactive`), `keyboardBlurBehavior` (`none` | `restore`, default `none`), `android_keyboardInputMode` (`adjustPan` | `adjustResize`, default `adjustPan`). `restore` regressions are open in v5 ([#2544](https://github.com/gorhom/react-native-bottom-sheet/issues/2544), [#1887](https://github.com/gorhom/react-native-bottom-sheet/issues/1887)). Note: v5's docs list `interactive` / `extend` / `fillParent`; older docs only showed `interactive`/`fillParent`.

---

## 7. Design Constraints for the Plan (NON-NEGOTIABLE)

The plan author MUST satisfy every item:

- **C1.** Every new ScrollView/FlatList/BottomSheetScrollView containing inputs + tappable elements sets `keyboardShouldPersistTaps="handled"`.
- **C2.** Cross-platform scroll-to-dismiss uses `keyboardDismissMode="on-drag"`. `"interactive"` is permitted ONLY when explicitly iOS-gated.
- **C3.** Any keyboard listener uses `keyboardDidShow` / `keyboardDidHide` (cross-platform). `keyboardWill*` is allowed only inside `Platform.OS === 'ios'` branches.
- **C4.** Submit/select handlers read the input value and run their callback BEFORE any `Keyboard.dismiss()` / blur. No screen-level outside-tap dismisser may sit above interactive children in a way that swallows their press.
- **C5.** Every gorhom sheet with a `BottomSheetTextInput` sets `android_keyboardInputMode="adjustResize"` (to keep bottom inputs visible on Android) and keeps `enableDynamicSizing={false}`. Standardize on `keyboardBehavior="interactive"`.
- **C6.** `keyboardBlurBehavior="restore"` may be kept ONLY if verified working on the target version for both platforms; otherwise default to `none`. Do not pair `restore` with `extend`.
- **C7.** `KeyboardAvoidingView` uses `behavior="padding"` on iOS and `undefined` on Android (never `height` under edge-to-edge).
- **C8.** TextInputs that change container style on focus (NativeWind `focus:` variants) are verified on a Fabric build to not self-dismiss (RN #45798).
- **C9.** Tab screens with inputs set `tabBarHideOnKeyboard: true` rather than relying solely on `softwareKeyboardLayoutMode: "pan"`.
- **C10.** Verification is done on a New-Architecture EAS build (not Expo Go), on both a physical Android (edge-to-edge) and iOS device. Keyboard behavior under Fabric ≠ legacy.

---

## 8. Open Questions for the Human

1. **Is `react-native-keyboard-controller` in scope?** Expo and the community now recommend it over `KeyboardAvoidingView` for multi-input/edge-to-edge consistency, but it has its own open Expo-55/Fabric regressions ([#1411](https://github.com/kirillzyusko/react-native-keyboard-controller/issues/1411)) and adds a native dependency (dev build + reanimated, both already present). Adopt now, or stick with built-in `Keyboard` + `KeyboardAvoidingView`? — Product/architecture call.
2. **Keep `softwareKeyboardLayoutMode: "pan"` or switch to `"resize"`?** `pan` fixed the tab-bar-pushed-up problem but conflicts with edge-to-edge IME insets and can hide bottom inputs. `resize` + edge-to-edge effectively becomes manual avoidance (iOS-like). Which trade-off does the team want app-wide?
3. **Should outside-tap-to-dismiss be a global behavior or per-screen?** Defines whether we need a shared wrapper component or leave it to each ScrollView's `keyboardDismissMode`.
4. **Desired dismiss-on-navigation behavior:** when the user navigates (router.push/back) with a focused input, should the keyboard always dismiss explicitly before navigating? RN does not guarantee this consistently across platforms — needs a product decision to standardize.

---

## 9. Knowledge Base Updates

Created `docs/superpowers/expert/_knowledge-base/react-native-keyboard.md` with: keyboard-event platform matrix (iOS-only Will* events), `keyboardDismissMode` cross-platform matrix, gorhom v5 keyboard-prop matrix + defaults + open-regression table, Android edge-to-edge × `softwareKeyboardLayoutMode` interaction notes, and the `keyboardShouldPersistTaps` trap. All entries cited.
