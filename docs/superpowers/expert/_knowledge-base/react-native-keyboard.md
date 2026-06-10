# React Native Keyboard Knowledge Base

Maintained by Compound V Phase 1B advisor. Append at the bottom on each pass.

---

## Updated 2026-06-10 — Keyboard dismissal (Expo 55 / RN 0.83 / Fabric / gorhom v5)

### Keyboard event platform matrix
Source: [reactnative.dev/docs/keyboard](https://reactnative.dev/docs/keyboard) (fetched 2026-06-10).

| Event | iOS | Android |
|---|---|---|
| `keyboardDidShow` | yes | yes |
| `keyboardDidHide` | yes | yes |
| `keyboardWillShow` | yes | **no** |
| `keyboardWillHide` | yes | **no** |
| `keyboardWillChangeFrame` | yes | **no** |
| `keyboardDidChangeFrame` | yes | **no (effectively)** |

Rule: cross-platform listeners use `keyboardDidShow`/`keyboardDidHide` only. `Will*` belongs inside `Platform.OS === 'ios'`.
Android caveat: events may not fire on Android 10 and below when `windowSoftInputMode` is `adjustResize`/`adjustNothing`.

`Keyboard.dismiss()` dismisses the active keyboard AND removes focus from the focused input. Docs do not document a New-Arch behavior difference (treat as same; verify on Fabric).

### ScrollView keyboardDismissMode matrix
Source: [reactnative.dev/docs/scrollview](https://reactnative.dev/docs/scrollview#keyboarddismissmode).

| Value | iOS | Android | Use when |
|---|---|---|---|
| `none` (default) | no dismiss on scroll | no dismiss on scroll | dismissal handled elsewhere |
| `on-drag` | dismiss when drag begins | dismiss when drag begins | **cross-platform scroll-to-dismiss** |
| `interactive` | keyboard follows finger, drag-up cancels | **behaves like `none`** | iOS-only premium feel (gate with Platform.OS) |

### keyboardShouldPersistTaps (the #1 keyboard bug)
Default `"never"`: first outside tap is consumed to dismiss keyboard, so buttons/rows need a SECOND tap (`onPress` doesn't fire on tap 1). Set `"handled"` on any ScrollView/FlatList/BottomSheetScrollView that holds both an input and tappable elements. Source: [RN ScrollView props](https://reactnative.dev/docs/scrollview#keyboardshouldpersisttaps).

### gorhom/bottom-sheet v5 keyboard prop matrix
Source: [gorhom.dev/react-native-bottom-sheet/props](https://gorhom.dev/react-native-bottom-sheet/props) (fetched 2026-06-10).

| Prop | Default | Options | Meaning |
|---|---|---|---|
| `keyboardBehavior` | `interactive` | `extend` / `fillParent` / `interactive` | extend=to max snap point; fillParent=fill parent view; interactive=offset sheet by keyboard size |
| `keyboardBlurBehavior` | `none` | `none` / `restore` | restore=return sheet to prior position on blur |
| `android_keyboardInputMode` | `adjustPan` | `adjustPan` / `adjustResize` | Android windowSoftInputMode for the sheet |

Recommended baseline for a sheet with a `BottomSheetTextInput`:
`keyboardBehavior="interactive"` + `android_keyboardInputMode="adjustResize"` + `enableDynamicSizing={false}`. Add `keyboardBlurBehavior="restore"` only after verifying it works (see regressions).

### gorhom v5 open regressions / traps (2026-06)
| Issue | Symptom | Status |
|---|---|---|
| [#2544](https://github.com/gorhom/react-native-bottom-sheet/issues/2544) | `restore` doesn't restore in BottomSheetModal | open v5 |
| [#2545](https://github.com/gorhom/react-native-bottom-sheet/issues/2545) | iOS `restore`+`extend` doesn't return position | open v5 |
| [#1887](https://github.com/gorhom/react-native-bottom-sheet/issues/1887) | `restore` regressed alpha.10 | v5 |
| [#1934](https://github.com/gorhom/react-native-bottom-sheet/issues/1934) | Android: bottom TextInput in scrollview hidden by keyboard | v4/v5 — fix via adjustResize |
| [#1602](https://github.com/gorhom/react-native-bottom-sheet/issues/1602) | Android: enableDynamicSizing + keyboard collapses sheet | keep dynamic sizing OFF |
| [#1787](https://github.com/gorhom/react-native-bottom-sheet/issues/1787) | controlled BottomSheetTextInput dismisses keyboard on value change | use uncontrolled if hit |
| [#2661](https://github.com/gorhom/react-native-bottom-sheet/issues/2661) | autoFocus overlaps keyboard with sheet anim | focus after open anim |

### Android edge-to-edge × softwareKeyboardLayoutMode
- Expo SDK 53+ enables edge-to-edge by default (carried into 54/55). Changes IME inset delivery.
- Under edge-to-edge, `adjustResize` no longer auto-resizes the window → behaves like `adjustNothing`; the app must handle keyboard avoidance itself (iOS-like). Source: [72technologies edge-to-edge guide](https://www.72technologies.com/blog/android-15-edge-to-edge-react-native-expo), [community #827](https://github.com/react-native-community/discussions-and-proposals/discussions/827).
- `softwareKeyboardLayoutMode: "pan"` pans the whole window up → can push bottom tab bar above keyboard. Counter with `tabBarHideOnKeyboard: true` per tab screen. Source: [Expo keyboard guide](https://docs.expo.dev/guides/keyboard-handling/).
- `KeyboardAvoidingView`: use `behavior="padding"` (iOS) / `undefined` (Android), never `height` under edge-to-edge.

### New Architecture (Fabric) keyboard regressions
- Default ON in SDK 55 / RN 0.83.
- [RN #45798](https://github.com/facebook/react-native/issues/45798): TextInput inside a View with focus-conditional style auto-dismisses keyboard on focus (both platforms, New Arch only). Risk with NativeWind `focus:` variants.
- [keyboard-controller #1411](https://github.com/kirillzyusko/react-native-keyboard-controller/issues/1411): toolbar persists + KeyboardAwareScrollView doesn't scroll to focused input on Expo 55 / RN 0.83 / Fabric.
- Always verify keyboard behavior on a Fabric EAS build, not Expo Go.

### Library recommendation (2025–2026)
Expo + community now recommend `react-native-keyboard-controller` over built-in `KeyboardAvoidingView` for multi-input/edge-to-edge consistency (requires dev build + reanimated, both common). Trade-off: it has its own Fabric/Expo-55 regressions. Source: [Expo keyboard guide](https://docs.expo.dev/guides/keyboard-handling/), [keyboard-controller repo](https://github.com/kirillzyusko/react-native-keyboard-controller).

### Container → recommended pattern cheat-sheet
- **Plain View screen:** `Pressable`/ScrollView wrapper; dismiss via `Keyboard.dismiss()`. Prefer ScrollView with `keyboardShouldPersistTaps="handled"` over full-screen `TouchableWithoutFeedback` (latter flaky in Expo — [expo #10667](https://github.com/expo/expo/issues/10667)).
- **ScrollView with inputs:** `keyboardShouldPersistTaps="handled"` + `keyboardDismissMode="on-drag"`.
- **gorhom sheet:** `keyboardBehavior="interactive"` + `android_keyboardInputMode="adjustResize"` + `enableDynamicSizing={false}`; `BottomSheetScrollView keyboardShouldPersistTaps="handled"`.
- **FlatList in sheet:** same as scrollview; watch bottom-input-behind-keyboard on Android.
- **Submit:** read value + run callback BEFORE dismissing; rely on `keyboardShouldPersistTaps="handled"` so the button's first tap fires.
