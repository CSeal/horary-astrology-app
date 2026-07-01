# Store-Review Findings — UI Alignment & i18n Pass (7 locales)

*Run 2026-07-01 on iPhone 17 Pro Max (iOS 26 sim, 1320×2868 @3×). Focus: block/label
positioning, alignment, spacing, and text overflow across all **7 languages**
(en · ru · de · fr · es · pt · uk) — "ничего не должно резать глаз". Live-API archetypes
tested throttled. Debug/screenshot build.*

Deliverable of the plan in [store-review-plan.md](store-review-plan.md), phases 1–6.

---

## TL;DR

- **56 screens captured** (8 screens × 7 locales), every cell reviewed at full resolution.
- **7 real defects found → all 7 fixed** (typecheck + lint green; each fix re-captured and
  visually confirmed). 6 were i18n/alignment; the 7th (tab-bar icon centering, spotted by the
  owner) was measured at **19 pt off → 0.3 pt** after the fix.
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

## Honest limitations of THIS pass

- **Performance not profiled** — this was a debug/screenshot build; simulator FPS is not
  representative. A **release-build pass** (cold start, sustained 60/120 fps, jank %, memory
  across ask→result cycles) is still required before submit.
- **Haptics** are wired in code (Button impact styles, milestone Success) but **cannot be felt
  on a simulator** — needs a physical-device pass.
- **Keyboard behavior** (AskForm / city search / API-key inputs never covered by the soft
  keyboard) was **not exercised** this pass — no reliable text-entry automation; needs a manual pass.
- **iOS floor unverified** — only iOS 26 sims installed; deployment target is 16.0.
- **Android not run** this pass (iOS only). The 6 fixes are in shared JS so they apply to both,
  but Android-specific rendering (fonts, safe-area, soft keyboard) was not visually audited.

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
