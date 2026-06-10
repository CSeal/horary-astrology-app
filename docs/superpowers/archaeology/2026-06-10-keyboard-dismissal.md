---
created_by: Claude (Compound V Phase 1A — Code Archaeologist)
updated_by: Claude
source_inputs:
  - Repo scan of src/ (rg/Read) at commit 19890a2 (+ uncommitted working tree)
  - "@gorhom/bottom-sheet ^5.2.14, react-native 0.83.6, expo-router ~55.0.16, react-native-reanimated 4.2.1"
reviewed_by: pending
---

# Keyboard Dismissal Code Archaeology

Scope: every place a `TextInput` / `BottomSheetTextInput` exists, plus all surrounding
keyboard-control plumbing, mapped so the plan author can decide the correct dismissal
strategy per surface. No prior archaeology audits exist in `_knowledge-base/` (empty).

## 1. Matrix

Dimensions the codebase actually branches by for keyboard behavior: **(a) input host**
(plain screen ScrollView vs gorhom BottomSheet), **(b) close trigger** (submit button /
return key / navigation / sheet pan-down / backdrop tap / step change), **(c) multiline**
(blocks `returnKeyType="done"` dismissal), **(d) existing dismiss present**.

| # | Input (file:line) | Host wrapper | Multiline | Close trigger(s) | Existing dismiss | New code must handle |
|---|---|---|---|---|---|---|
| 1 | Home Ask question — `ui/Input.tsx:69` via `AskForm.tsx:188` | screen `ScrollView` (`index.tsx:288`, `keyboardShouldPersistTaps="handled"`) | **YES** (`multiline`) | "Ask" `Button` (`AskForm.tsx:272` → `index.tsx:185 handleSubmit`); success nav `router.replace` (`useHoraryQuery.ts:92`) | **NONE** — not on submit, not on nav | dismiss on submit AND before/at navigation |
| 2 | Settings API-key edit — `settings.tsx:774` | screen `ScrollView` (`settings.tsx:379`) inside `KeyboardAvoidingView` (`:374`) | no | `onSubmitEditing` (`:782`), Save btn (`:792`), Cancel btn (`:799`), `keyboardDidHide` listener (`:160`) | **EXTENSIVE** — `Keyboard.dismiss()` in 10 handlers + listener | already handled; do NOT regress |
| 3 | Onboarding API-key — `onboarding.tsx:414` | screen `ScrollView` (`:297`) | no | `onSubmitEditing` (`:423`), Enter btn (`:463`), Skip btn (`:470`→`next`), Back link (`:496`→`back`), step dots | partial — `next`/`back` call `Keyboard.dismiss()` (`:240`,`:247`); `handleSaveKey` (`:253`) does NOT dismiss directly (relies on `next()`) | verify Skip path; `handleSaveKey` dismiss is indirect-only |
| 4 | LocationPicker search — `LocationPickerSheet.tsx:232` (`BottomSheetTextInput`) | gorhom `BottomSheet` (`:186`, `keyboardBehavior="interactive"`, `keyboardBlurBehavior="restore"`) → `BottomSheetFlatList` (`:265`, `keyboardShouldPersistTaps="handled"`) | no | result tap `handlePick` (`:153`→`sheet.close()`), GPS row `handleUseGps` (`:163`), pan-down (`enablePanDownToClose`), backdrop tap (`:170`) | sheet auto-dismisses keyboard on close (gorhom `keyboardBlurBehavior`) | likely OK via gorhom; verify result-tap path |
| 5 | DebugSheet PIN — `DebugSheet.tsx:307` (`BottomSheetTextInput`) | gorhom `BottomSheet` (`:279`, same keyboard props) → `BottomSheetScrollView` (`:292`) | no | PIN submit, pan-down, backdrop | gorhom-managed | likely OK; out of user-facing scope (hidden debug) |

Cell coverage warning: surfaces 2 (Settings) and 4/5 (gorhom sheets) are heavily handled.
Surface **1 (Home Ask)** is the unhandled cell — it is the primary user surface and has
ZERO keyboard dismissal. Surface 3 (Onboarding) has a partial gap. Do not assume the sheet
pattern (4/5) generalizes to the screen pattern (1/3): gorhom's `keyboardBlurBehavior`
auto-blurs on sheet close; plain screens have no equivalent — they need explicit
`Keyboard.dismiss()`.

## 2. Shared State

**`question` (local state, `index.tsx`, passed to `AskForm` → `Input`)**
- Read by: `handleSubmit` (`index.tsx:194` `question.trim()`), `Input` value (`AskForm.tsx:189`).
- Keyboard tie: focus drives `isFocused` local state (`AskForm.tsx:196-197`) → gold border glow only. No blur is forced anywhere.
- Gap: nothing in the Home flow calls `Keyboard.dismiss()`. On submit the mutation fires inline (loading replaces the form, `index.tsx:356`) then `router.replace` navigates (`useHoraryQuery.ts:92`) — **keyboard stays up across the loading view and rides onto the result screen** until iOS/Android happens to blur it on unmount. This is the core defect surface.

**`editingKey` + `apiKeyInput` (Settings, `settings.tsx:90,92`)**
- Set false on: Save (`:224`), Cancel (`:245`), and a `keyboardDidHide` listener (`:160-170`) that auto-exits edit mode whenever the keyboard hides for ANY reason.
- Edge: this listener means in Settings the keyboard hiding is itself a state trigger. Any new global "dismiss keyboard on X" logic that fires while Settings edit mode is open will **silently collapse the edit field and wipe `apiKeyInput`**. A blanket app-level dismissal must not run while `editingKey` is true, or it will regress the edit UX.

**`apiKeyInput` (Onboarding, `onboarding.tsx:229`)**
- `handleSaveKey` (`:253`) does NOT call `Keyboard.dismiss()` itself; it relies on `next()` (`:263`) which does (`:240`). If `handleSaveKey` ever short-circuits before `next()` (currently the empty-trim early return at `:255`), the keyboard stays up. Minor, but the dismiss is coupled to navigation, not to the save action.

**`scrollRef` (Settings, `settings.tsx:99`)** + `handleStartEditKey` `setTimeout(...scrollToEnd, 300)` (`:237`)
- Hardcoded 300ms assumes keyboard-open animation duration. Not a dismissal bug but a sibling timing assumption to be aware of if KeyboardAvoidingView behavior is touched.

## 3. Sibling Code

The well-handled sibling for screen inputs is **`settings.tsx`**. Read in full.
- Entry gate for the input: `editingKey === true` (`:771`).
- Inputs read: `apiKeyInput`.
- Edge cases handled: dismiss on every action handler (`:102,110,120,176,197,206,217,243,250,268,274`), `keyboardDidHide` auto-exit (`:160`), `KeyboardAvoidingView` with iOS-only `padding` behavior (`:374-377`), `keyboardShouldPersistTaps="handled"` (`:383`), `onSubmitEditing` (`:782`).
- Latent issue (not a bug, a pattern cost): dismiss is sprinkled across 10 handlers manually. Any new handler added to Settings that the author forgets to instrument will leave the keyboard up — there is no single choke point. If the plan introduces a reusable dismiss helper/hook, Settings is the candidate to refactor onto it (DRY, Section 6).
- Latent coupling: the `keyboardDidHide` listener (`:160`) conflates "keyboard hidden" with "user finished editing." Correct today, but fragile to any app-wide programmatic dismiss.

The sibling for sheet inputs is **`LocationPickerSheet.tsx`** / **`DebugSheet.tsx`**. Both use
identical gorhom keyboard props (`keyboardBehavior="interactive"`, `keyboardBlurBehavior="restore"`)
and `keyboardShouldPersistTaps="handled"` on their inner list/scroll. gorhom blurs the
input automatically when the sheet closes (pan-down / backdrop / `.close()`), so these need
no explicit `Keyboard.dismiss()`. **Do not add manual `Keyboard.dismiss()` inside gorhom
sheets** — it can fight `keyboardBlurBehavior="restore"`.

The MISSING sibling: there is **no shared keyboard-dismiss primitive** and **no
`TouchableWithoutFeedback`/tap-outside-to-dismiss anywhere** in the repo (grep returned
zero). Tap-outside dismissal does not exist as a pattern; if the spec wants it, it is
greenfield (and on `keyboardShouldPersistTaps="handled"` ScrollViews, a tap on empty scroll
area already dismisses — so a wrapper may be redundant or conflicting).

## 4. External APIs (via context7)

No third-party network API is involved in keyboard dismissal. The only libraries in play
are React Native core (`Keyboard`, `KeyboardAvoidingView`, `TextInput`,
`keyboardShouldPersistTaps`, `keyboardDismissMode`) and `@gorhom/bottom-sheet`
(`BottomSheetTextInput`, `keyboardBehavior`, `keyboardBlurBehavior`). These are UI-runtime
APIs, not remote service contracts, so context7 doc-fetch is out of scope for this audit
(that is Phase 1C's lane — verify gorhom v5 `keyboardBehavior`/`keyboardBlurBehavior`
signatures there if the plan changes them). Versions in tree: `@gorhom/bottom-sheet
^5.2.14`, `react-native 0.83.6`, `react-native-reanimated 4.2.1`, `expo-router ~55.0.16`.

Contract note carried from existing code (verified in-repo, not from memory): the codebase
relies on `keyboardBlurBehavior="restore"` to auto-blur on sheet close, and on
`keyboardShouldPersistTaps="handled"` so that taps on chips/results don't dismiss before
the press registers. Note `keyboardDismissMode` (the scroll-drag-dismiss prop) is used
NOWHERE — it is a free lever the plan can pull for surfaces 1 and 3.

## 5. Regression Surface

| Path | If new code mis-fires, what breaks |
|---|---|
| Settings edit mode (`settings.tsx:771`) + `keyboardDidHide` listener (`:160`) | An app-wide dismiss firing while editing collapses the field and erases `apiKeyInput` — user loses typed key silently |
| ChipScrollRow category/subcategory/role taps (`ChipScrollRow.tsx:130`, `keyboardShouldPersistTaps="handled"`) | If persistTaps is changed to `"never"`/default to enable tap-outside dismiss, first chip tap only dismisses keyboard and is swallowed — two taps needed to select a category |
| LocationPicker result tap (`LocationPickerSheet.tsx:270`) | Same: changing persistTaps swallows the city selection tap |
| Adding `Keyboard.dismiss()` inside gorhom sheets (4,5) | Fights `keyboardBlurBehavior="restore"`; can cause flicker / sheet snap glitches |
| Home submit nav (`useHoraryQuery.ts:92 router.replace`) | This is the fix target, but if a dismiss is added in `onSuccess` and the mutation errors (`:121` no-nav path), make sure dismiss still happens on the inline-error path so the keyboard isn't stuck over the error banner |
| Onboarding `next`/`back` (`onboarding.tsx:240,247`) already dismiss | A duplicate/global dismiss here is harmless but redundant — don't double-instrument |

## 6. DRY Findings

- **Duplicate pattern, no shared primitive:** `Keyboard.dismiss()` is hand-written 12 times
  (10× `settings.tsx`, 2× `onboarding.tsx`). There is no `useDismissKeyboard` hook, no
  `dismissKeyboard()` util, no `DismissKeyboardView` wrapper. **Decision for the plan:**
  before adding a 13th call on the Home surface, introduce ONE shared helper (hook or thin
  wrapper) and consider refactoring Settings/Onboarding onto it. Do NOT silently add another
  inline call. If a shared helper is created it belongs in `src/hooks/` or `src/utils/`
  (neither currently has one).
- **gorhom sheets already DRY** via shared keyboard props copy-pasted in two files
  (`LocationPickerSheet.tsx:198-199`, `DebugSheet.tsx:289-290`). Identical config — could be
  centralized but low value; out of scope unless the plan touches sheet keyboard behavior.
- `keyboardShouldPersistTaps="handled"` appears 6× (all correct, all intentional) — do not
  consolidate; each is a per-list prop.

## 7. Design constraints for the spec (non-negotiable)

1. **Home Ask is the primary defect.** The spec MUST add keyboard dismissal to the Home flow:
   on `handleSubmit` (`index.tsx:185`) AND ensure the keyboard is down before/at
   `router.replace` (`useHoraryQuery.ts:92`). Dismiss must also fire on the inline-error path
   (mutation `onError`, `useHoraryQuery.ts:121`) so the keyboard doesn't cover the error banner.
2. **The Home input is `multiline`** (`Input.tsx`/`AskForm.tsx:191`) — `returnKeyType="done"`
   + `onSubmitEditing` is NOT a viable dismissal path there (return inserts a newline). Must
   use button-press / programmatic dismiss / `keyboardDismissMode="on-drag"`.
3. **Do NOT add manual `Keyboard.dismiss()` inside gorhom BottomSheets** (surfaces 4, 5).
   gorhom's `keyboardBlurBehavior="restore"` already handles blur-on-close.
4. **Do NOT change `keyboardShouldPersistTaps` on ChipScrollRow / LocationPicker list / any
   list that the user taps while the keyboard is up** — it will swallow the first tap. If
   tap-outside dismiss is desired on Home, it must coexist with `persistTaps="handled"` (the
   handled mode already dismisses on empty-area scroll taps).
5. **Any app-wide/global dismiss must be guarded against Settings edit mode** — firing while
   `editingKey === true` triggers the `keyboardDidHide` listener (`settings.tsx:160`) and
   destroys `apiKeyInput`. Either scope the new logic to the Home surface or exclude Settings.
6. **DRY:** introduce a single dismiss helper rather than a 13th inline `Keyboard.dismiss()`;
   prefer refactoring the existing 12 calls onto it. New helper file is a SHARED RESOURCE.
7. **Onboarding `handleSaveKey`** (`onboarding.tsx:253`) currently dismisses only indirectly
   via `next()`. If the spec standardizes dismissal, make it explicit and not nav-coupled.
8. **`keyboardDismissMode` is unused everywhere** — it is the cleanest lever for surfaces 1
   and 3 (`keyboardDismissMode="on-drag"` / `"interactive"` on the screen ScrollViews) and
   the spec should evaluate it before hand-wiring dismiss into every handler.

## 8. File Touch Map (for Phase 2 partitioning)

| File | Why it will be touched | Shared? |
|---|---|---|
| `src/app/(tabs)/index.tsx` | Add dismiss on submit; possibly `keyboardDismissMode` on ScrollView (`:288`) | no |
| `src/hooks/useHoraryQuery.ts` | Dismiss before `router.replace` (`:92`) and on error path (`:121`) | no (but read by Home; behavior-shared) |
| `src/components/AskForm.tsx` | If dismiss is wired at the form/submit boundary (`:272`) | **SHARED RESOURCE** — also imported by Home; if a new prop is added, Home call site (`index.tsx:378`) must change in lockstep |
| `src/components/ui/Input.tsx` | Only if dismiss is built into the shared input (affects EVERY input that uses it) | **SHARED RESOURCE** — shared input component; changes ripple to Home + anything reusing `Input` |
| `src/app/onboarding.tsx` | Make `handleSaveKey` dismiss explicit (`:253`); optional `keyboardDismissMode` (`:297`) | no |
| `src/app/(tabs)/settings.tsx` | Only if refactoring the 12 inline dismisses onto a shared helper; otherwise DO NOT EDIT (regression risk via `:160` listener) | no (but high regression surface) |
| `src/hooks/useDismissKeyboard.ts` (NEW) or `src/utils/keyboard.ts` (NEW) | New shared dismiss primitive (DRY decision) | **SHARED RESOURCE** — new shared module consumed by multiple screens; create in Task 0 before parallel tasks import it |
| `src/components/LocationPickerSheet.tsx` | NO CHANGE expected (gorhom-managed). List only if spec explicitly revisits sheet keyboard behavior | **SHARED RESOURCE** — used by both Home and Settings; any change affects two screens |
| `src/components/DebugSheet.tsx` | NO CHANGE expected (gorhom-managed, hidden debug surface) | no |
| `src/components/ChipScrollRow.tsx` | NO CHANGE — keep `keyboardShouldPersistTaps="handled"` (`:130`); listed only to flag the regression trap | no |
| `src/tw/index.tsx` | NO CHANGE expected; the `TextInput`/`ScrollView` wrappers (`:78`,`:50`) already forward all props incl. keyboard props | **SHARED RESOURCE** — barrel of NW primitives; any prop-forwarding change ripples app-wide |
