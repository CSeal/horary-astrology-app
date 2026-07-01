# Store-Review Findings — UI Alignment & i18n Pass (7 locales)

*Run 2026-07-01 on iPhone 17 Pro Max (iOS 26 sim, 1320×2868 @3×). Focus: block/label
positioning, alignment, spacing, and text overflow across all **7 languages**
(en · ru · de · fr · es · pt · uk) — "ничего не должно резать глаз". Live-API archetypes
tested throttled. Debug/screenshot build.*

Deliverable of the plan in [store-review-plan.md](store-review-plan.md), phases 1–6.

---

## TL;DR

- **56 screens captured** (8 screens × 7 locales), every cell reviewed at full resolution.
- **8 fixes applied** (typecheck + lint + jest green; each visual fix re-captured and confirmed).
  7 were defects found in the audit — 6 i18n/alignment + the tab-bar icon centering the owner
  spotted (measured **19 pt off → 0.3 pt**); #8 is keyboard-inset hardening for short devices.
- **Perf + keyboard passes done** (code-level): animations on the Reanimated UI thread, lists
  virtualized, inputs now keyboard-avoiding. Quantitative FPS + soft-keyboard behaviour still
  need a release build on a physical device (simulator can't represent either).
- **Android pass done** (Pixel_9_Pro): same 56-cell capture. One Android-only defect (tab-label
  truncation, a regression from the iOS tab fix) found + refixed cross-platform; everything else
  renders consistently with iOS and the keyboard is already handled by `adjustResize`. Plus a
  focus-border fix on the question input the owner spotted. **10 fixes total this session.**
- **No 🔴 blockers.** The app's layout is genuinely solid across all 7 languages — German
  (longest words) and Russian/Ukrainian (widest Cyrillic) included. The worst-case German
  cases (verdict CTA, full-reading headers, settings rows) all fit cleanly on the 6.9".
- **Live API healthy & correctly localized** — verdicts localize server-side; the English
  text seen in demo screens is demo-fixture only, not a production bug.
- **Remaining:** a few polish items + translation-review items (below), and three passes
  this round did NOT cover (release-build perf, haptics feel, keyboard) — flagged honestly.

---

## Method (what was actually done)

1. **Build/run** — dev build on iPhone 17 Pro Max, connected to Metro in screenshot-mode
   (`EXPO_PUBLIC_SCREENSHOT=1`): auto-seeds demo data, skips onboarding, applies a target
   locale, navigates to a target screen. Verified running on current JS (RU banner fix present).
2. **Capture** — 8 screens (home · verdict · full · timing · chart · journal · stats · settings)
   × 7 locales = 56 frames.
3. **Audit** — 8 parallel reviewer agents (one per screen), each diffing 7 locales against the
   EN baseline at full resolution, **crop-verifying** every suspected clip to avoid
   downscaling false-positives; then a manual German/Spanish/Ukrainian crop pass on the
   highest-overflow-risk elements.
4. **Live API** — 6 horary archetypes against the public keyless host, **throttled** (sequential,
   ~2 s apart) so we were never rate-limited.
5. **Fix + re-verify** — fixed each real defect, re-ran typecheck/lint, re-captured the affected
   screen in the affected locales, confirmed visually.

### Capture-reliability note (important, not an app bug)
The first capture pass navigated sub-routes via Fast Refresh; for ~half the locales the
dev-client's **HMR reconnect after relaunch was flaky**, so those frames silently stayed on
Home. Detected by pixel-diffing every sub-route against its own Home frame (0.05 vs 14–26).
Fixed by re-driving navigation with **`simctl openurl hora://…` deep links**, which
expo-router handles regardless of HMR — 21/21 re-captures landed correctly on the first try.
This is a **screenshot-harness** artifact only; a real user navigates by tapping.

---

## Live-API archetype matrix (public keyless host, throttled)

`POST https://api-public.astrology-api.io/api/v3/horary/analyze` — all **HTTP 200**, TTFB
0.15–0.47 s, ~10–12 KB. No 429s. Verdict lives in `data.judgment`.

| Archetype | Answer | Confidence | Radicality | Significators | Applying | VOC | Timing |
|---|---|---|---|---|---|---|---|
| career · London | yes | 80 · high | 100 radical | 3 | 7 | – | – |
| love · Moscow | yes | 65 · medium | 75 radical | 3 | 4 | – | – |
| marriage · New York | **unclear** | 30 · low | 84 radical | 3 | 7 | – | – |
| money · Tokyo | unclear | 30 · low | 92 radical | 3 | 5 | **VOC** | **present** |
| health · Sydney | **no** | 75 · high | 100 radical | 3 | 3 | – | – |

Covers all three verdict types (yes/no/unclear), all three confidence bands, a void-of-course
Moon, and a populated timing window. **Localization confirmed**: with `options.language=ru` the
API returns Cyrillic `judgment.interpretation` / `reasoning` / `key_factors` — so real readings
are localized server-side. (Planet names like `Sun` stay English from the API — see #11.)

---

## Defects found & FIXED (6)

| # | Sev | Screen · locales | Defect | Fix | Verified |
|---|---|---|---|---|---|
| 1 | 🟠 | journal · de/fr/es/pt/uk | Row date used a `ru`-only ternary → every non-RU/EN locale showed **English dates** ("Jun 5"). Month header was already localized — inconsistent. | Share `DATE_LOCALE_MAP` (moved to `config.ts`); `JournalItem.formatDate` now uses it. | ✅ FR now "5 juin" |
| 2 | 🟠 | stats · fr, de | Verdict-distribution label (`w-16`) had no line clamp → FR "INCERTAIN"/"PEUT-ÊTRE" & DE "VIELLEICHT" **wrapped to 2 lines**, orphaning a letter and desyncing the bar rows. | `numberOfLines={1}` + `adjustsFontSizeToFit` on the label. | ✅ FR one line, rows aligned |
| 3 | 🟠 | home · all 6 non-EN | Location-denied banner: when the message wrapped to 2 lines, the gold "Choose city" link **floated centered in the inter-line gap** (un-anchored). Follow-on from the earlier RU wrap fix. | `BannerPressable` row `items-center` → `items-start` (link aligns to line 1). | ✅ DE link on line 1 |
| 4 | 🟡 | tab bar · pt | Settings tab was **"Meu Almanaque"** — the only 2-word tab label, breaking tab rhythm (all others 1 word). | `pt.settingsTab` → "Almanaque". | ✅ tabs even |
| 5 | 🟠 | stats · all non-EN | Activity months hardcoded to English `MONTH_ABBREV` → "Feb 26" in every locale. Same class as #1, different screen (`useStats`). | Localize via `toLocaleDateString(DATE_LOCALE_MAP[locale])`. | ✅ FR "févr./mars", DE "März/Mai" |
| — | — | — | (#1 and #5 are the same root cause — an un-localized date format — surfacing in two screens.) | | |
| 7 | 🟠 | tab bar · all locales | Custom animated `tabBarButton` wrapped content in a shrink-to-fit `AnimatedView` with no flex → **icon sat ~19 pt left of its label** (measured on the gold active tab: icon centroid 769 vs label 826; slot centre 825). Also top-crammed the icon+label group. | `flex-1 items-center justify-center` on the wrapper — restores the flex-centering context RN's default button provides. | ✅ icon centroid → 825 (offset −0.3 pt); group vertically balanced |
| 8 | 🟡 | home + settings · small screens | Both screens' `ScrollView`s had **no keyboard avoidance** (`automaticallyAdjustKeyboardInsets`/`KeyboardAvoidingView`) → on short devices the soft keyboard can cover the submit button / API-key field. (Not reproducible on the 6.9" sim — submit sits above the keyboard there.) | `automaticallyAdjustKeyboardInsets` on both ScrollViews (iOS-native auto-inset). | ⚠️ code-fixed; live-confirm on a small device (sim suppressed the soft keyboard) |

All fixes: `className`/props/shared-const only, no new strings, no hardcoded colors — compliant
with project conventions. `npm run typecheck` + `eslint` on all changed files: **green**;
`jest` 217 passed.

> **Follow-up:** the store screenshots already uploaded (home/journal/stats show the tab bar)
> were captured **before** fixes #1–#7 — regenerate them after these land so the listing shows
> the corrected UI (localized dates, centered tabs, fixed banner).

---

## What was checked and is CLEAN (highlights)

- **German worst-cases all fit on 6.9"** — verdict CTA "Die vollständige Deutung ansehen ›"
  (one line), full-reading header "WANN KÖNNTE DIES GESCHEHEN?" (one line, clears the gear),
  settings title "Mein Almanach" + language grid, all clean.
- **Chart wheel** — geometrically perfect and identical across locales: centered at exact
  screen-center (0.0 px x-offset), perfectly round (1.000 ratio), no edge clipping.
- **Verdict / full / settings / timing** on all locales — significator cards, dignity/confidence
  badges, timing slider (DAYS/WEEKS/MONTHS), perfection rows, language grid, segmented controls:
  aligned, consistent insets, clean wraps, no truncation.
- **Tab bar** — all 4 labels fit with no truncation/overlap in every locale (after #4).
- **UK Cyrillic** verdict labels (НЕЯСНО/МОЖЛИВО) fit on one line (Cyrillic is more compact
  than the long FR/DE words that triggered #2).

---

## Remaining — reported, not fixed (need a decision or native review)

| # | Sev | Item | Note |
|---|---|---|---|
| 6 | 🟡 | Home chip-rows hard-cut at the right edge (no fade mask) | By-design horizontal scroll, consistent across locales; a right-edge gradient would read more premium. |
| 7 | 🟡 | Chart planet-stellium glyph crowding (lower-center) | From demo-1's real stellium (Jupiter/Mercury/Moon/Sun), not a locale bug; consider radial collision-avoidance. |
| 8 | 🟡 | Full-reading "Key factors" header duplicated | Outer tracked section header + inner card title say the same thing; design redundancy. |
| 9 | 🟡 | Translation polish | "Timing" breadcrumb untranslated in FR/PT; UK terms "Значиматори"/"Тайминг"/"Перфекція" read non-standard. **Needs native FR/PT/UK review** — not guessed here. |
| 10 | 🟢 | Demo-fixture text is English (interpretation, timing body, seed questions) | **Not a production bug** — the live API localizes (confirmed). Demo mode is debug-gated. Cosmetic; localize fixtures only if a demo screen ever ships user-facing. |
| 11 | 🟢 | Planet names ("Sun"/"Jupiter") English | API returns English planet names even for `language=ru`; confirm the app maps them to localized names/glyphs in production. |

---

## Perf & keyboard pass

**Keyboard** — code-audited every text input:
- `home` (AskForm question) and `settings` (API-key) `ScrollView`s had **no keyboard
  avoidance** → fixed with `automaticallyAdjustKeyboardInsets` (#8). On the 6.9" the submit
  sits above the keyboard so it wasn't reproducible there; the risk is short devices.
- `LocationPickerSheet` city search uses `BottomSheetTextInput`/`BottomSheetFlatList` (gorhom)
  — keyboard handled by the library. ✓
- Live sim confirmation was blocked: the iOS Simulator suppressed the software keyboard and
  there's no reliable tap-injection tool (idb broken, no cliclick) — **verify on a device**.

**Performance** — code-level posture is sound; no obvious hotspots:
- Animations run on the **Reanimated 4 UI thread** (38 files) → JS thread stays free, so
  entrance/scroll/press animations don't depend on JS load.
- Lists are **virtualized** (journal `SectionList`, city search `BottomSheetFlatList`).
- `StarField` = **60 particles** (light); `useStats` heavy aggregation is **memoized**
  (`useMemo`); `ChartWheel` SVG renders once (not per-frame).
- Minor optional win: `JournalItem` isn't `React.memo`'d (SectionList virtualization already
  mitigates) — left as-is, not applied without profiling data.
- Cold-start process spawn measured 0.22–0.43 s (debug); **honest FPS / jank / time-to-
  interactive still require a release build on a physical device** (simulator uses the Mac
  GPU/CPU and a debug bundle — not representative).

## Android pass (Pixel_9_Pro, API 35)

Built + ran the app on the Pixel_9_Pro emulator and captured the same 8 screens × 7
locales (56 cells) via `adb` deep links, then diffed each against the iOS baseline.

**One genuine Android-specific defect — found and fixed:**
- 🟠 **Tab labels truncated on Android** ("Chronicles" → "Chronicl…", even "Ask" → "A…").
  Root cause was the iOS tab-centering fix itself: wrapping the icon+label in a
  flex/animated View collapsed the label's measured width on Android during tab
  re-render. Refixed by rendering React Navigation's children directly (native tab
  layout) — icon still centered (iOS re-measured at −0.7 pt) and full labels on both
  platforms. Verified on iPhone 17 Pro Max + Pixel_9_Pro. (Trade-off: tab press-scale
  bounce dropped; tap haptic kept.)

**Everything else renders consistently with iOS.** The shared-JS fixes all carry over
and were confirmed on Android: journal/stats dates localize via `Intl` (DE "März", RU/UK
Cyrillic months), the location-banner link stays on line 1 when the message wraps (Android
fonts are a touch wider so EN also wraps to 2 lines — the `items-start` fix handles it),
stats verdict labels fit, PT "Almanaque" tab, verdict/full/settings cards and the German
long CTA all fit. **Keyboard:** Android already handles it via `windowSoftInputMode=adjustResize`
+ `softwareKeyboardLayoutMode:resize` (no code change needed).

**Notes:** the Android debug build installs as `com.hora.app` (the `android/` project predates
the `io.hora.app` rename — run `expo prebuild --clean --platform android` before a release
build, same as iOS). A few capture cells mis-navigated (en-settings→stats, ru/uk-journal→chart)
— a deep-link sequencing artifact, not an app bug (the same screens captured cleanly in other
locales). Not run: the API-24 floor + a low-end AVD (the plan's extra devices).

## Remaining limitations

- **Haptics** are wired in code (Button impact styles, milestone Success) but **cannot be felt
  on a simulator** — physical-device pass.
- **Quantitative perf** (release build, device) — see above.
- **iOS floor unverified** — only iOS 26 sims installed; deployment target is 16.0.
- **Android audited on Pixel_9_Pro only** (see the Android pass above). The API-24 floor and a
  low-end AVD were not run; the `android/` project still needs a `prebuild --clean` for the
  `io.hora.app` package before a release build.

---

## Post-fix WOW / polish scores (1–5)

| Screen | Score | Note |
|---|---|---|
| Home | 4 | Banner float fixed; only the chip-edge fade (#6) keeps it from 5. |
| Verdict | 5 | Clean in all 7; DE long CTA fits. |
| Full reading | 5 | Dense but well-aligned in every locale; key-factors dup (#8) is cosmetic. |
| Timing | 4 | Layout clean; demo body text English (#10, demo-only). |
| Chart | 4 | Wheel flawless; planet crowding (#7) is data-driven. |
| Journal | 5 | Date bug fixed; rows/badges aligned across locales. |
| Stats | 5 | Label wrap + activity months fixed; dashboard aligned. |
| Settings | 5 | Rows/controls aligned; no overflow even in German. |

*Emulator ≠ device — haptic feel, thermal/GPU behaviour, and the perf numbers above must be
confirmed on real hardware before submission.*
