# Store-Review Plan — "Apple + Google Reviewer" Pass
## Build · run on emulators · walk every screen · test live API under latency · judge animation/perf · WOW verdict

*Compiled 2026-06-26. Goal: review the whole app as a hostile App Store / Play Store reviewer
WOULD, then as a demanding user judging the "вау" factor (juicy, smooth, responsive, beautiful).*

> **Approved scope — full run, BOTH platforms.** Status: **NOT STARTED (locked as plan).**
> Do not build/run until explicitly told to start. When started: Phase 0 inline, then build iOS
> (iPhone 17 Pro Max) + Android (Pixel 9 Pro), walk every screen on both, then latency/perf/compliance
> and the findings report.
>
> **Owner additions baked in (must be checked on the walkthrough, with common sense):**
> 1. **Тактильность** — every interaction's haptic actually fires and lands ON the visual beat.
> 2. **Плавность анимаций** — no jank, no harsh/«резкие» cuts; springs feel organic.
> 3. **i18n layout integrity** — content must NOT overflow, truncate, or break layout across all
>    **7 locales** (en/ru/de/fr/es/pt/uk); word length/width differs per language (German longest,
>    Cyrillic wider).
> 4. **Keyboard behaviour** — the soft keyboard must never cover the active input or submit button;
>    dismiss/scroll/return-key all sane.
> 5. **API testing on the LIVE public host for all cases, but THROTTLED** (sequential, ~1.5–2s
>    between calls, no parallel bursts) so we are never rate-limited / banned.
> 6. **Common sense over checkbox-ticking** — flag anything that simply feels off.

---

## 0. Environment grounding (verified on this machine — the plan is real, not aspirational)

| Capability | State |
|---|---|
| **Xcode** | 26.5 (Build 17F42), macOS 26.5 |
| **iOS simulators** | iPhone 17 / 17 Pro / 17 Pro Max / 17e / Air, iPads (all iOS 26) |
| **Android SDK** | `~/Library/Android/sdk` — platform-tools, emulator, ndk all present; Java 17 |
| **Android AVDs** | `Pixel_9_Pro`, `Pixel_XL_API_33` (Android 13) |
| **Run path** | `scripts/dev-session.sh start --platform ios --device simulator --sim NAME` / `--platform android --device emulator --avd NAME`; under the hood `expo run:ios` / `expo run:android` |
| **App targets** | iOS deployment 16.0 · Android minSdk 24 (Android 7.0) · portrait-only · dark-only · `supportsTablet: false` |
| **Stack** | Expo ~55.0.26 · RN 0.83.6 · Reanimated 4.2.1 · expo-router ~55 |
| **API (live, keyless)** | `https://api-public.astrology-api.io/api/v3/horary/analyze` — **HTTP 200, TTFB 0.33s, 11.8 KB**, envelope `{success,data,...}`, app correctly unwraps `envelope.data`. Sample: answer `yes`, band `medium`, 3 significators, radicality 84. |
| **Latency tool** | `mockHoraryApi` honours `debugStore.mockDelayMs` (default 600ms) — our latency injector |
| **Demo mode** | `demoService` (`demo-` ids) + DebugSheet (7-tap + PIN gated, unreachable in prod) — deterministic screen states without the network |
| **e2e tooling** | none (no Detox/Maestro) → walkthrough is screenshot-driven via `simctl` / `adb` + expo-router deep links |

### Preliminary findings already surfaced during grounding
- 🟠 **MAJOR — `APP_STORE_ID = '000000000'`** (`src/constants/config.ts:54`). Breaks `APP_STORE_URL`,
  the "rate us" prompt, and any share-to-store link. Should be `6784362149` (per deploy memory).
- 🟢 **OK — Debug menu** is gated behind a 7-tap + PIN and is unreachable in a production binary.
- 🟢 **OK — API envelope** unwrapping is correct; live host is fast.
- 🟡 **WATCH — fertility/pregnancy categories** exist in the picker → Apple 1.4.1 medical-scrutiny
  risk; must confirm no pseudo-medical claim (no `fertility_score`) surfaces and a disclaimer exists.

---

## 1. Device / emulator matrix (what to run on, and why)

### iOS (4 simulators)
| Device | Why |
|---|---|
| **iPhone 17 Pro Max** (6.9") | Largest layout + the **required 6.9" App Store screenshot** size. 120Hz ProMotion → the truth-test for whether springs feel smooth. |
| **iPhone 17** (standard 6.1") | The most common physical size; primary "does it look right" device. |
| **iPhone 17e** (smallest available) | Cramped-layout / text-overflow stress; closest stand-in for budget iPhones. |
| **iPad (A16)** — smoke only | `supportsTablet:false` ⇒ runs in iPhone-compat; just confirm it launches without crashing (Apple tests this). |

> Limitation: only iOS 26 sims are installed. Deployment target is 16.0 — we cannot validate iOS 16/17
> behaviour here. Flag as a gap; validate on a physical iOS 16/17 device or an older sim runtime before submit.

### Android (recommend 4 emulators — 2 exist, add 2)
| AVD | API / size | Why |
|---|---|---|
| **Pixel_9_Pro** (have) | API 35, large, 120Hz | Flagship truth-test for animation smoothness + latest-API behaviour. |
| **Pixel_XL_API_33** (have) | API 33 (Android 13), 1440×2560 | Mid/older OS; gesture+button nav; high-DPI text. |
| **ADD: API 24 floor** (e.g. Nexus 5X / Pixel, API 24) | Android 7.0 = our **minSdkVersion** | Must prove the app launches and Reanimated 4 + Hermes work on the floor. Highest-risk omission. |
| **ADD: small low-end** (e.g. Pixel 4a, 720×1600, 2–3 GB) | small screen, weak GPU | Catches cramping AND judges "wow on a cheap phone" — the app ships to 7 locales incl. emerging markets. 60Hz reveals jank the 120Hz flagships hide. |

> Android rationale: fragmentation is screen-size × density × API × refresh-rate. Highest-value
> coverage = newest flagship × minSdk floor × small/low-end. Create the two new AVDs with
> `avdmanager` (system images via `sdkmanager`).

---

## 2. Screen & state inventory (the walkthrough checklist)

**Screens (11 routes):** onboarding · (tabs) home/ask · journal · stats · settings ·
result/[id] verdict · result/[id]/full · result/[id]/timing · result/[id]/chart · + tab layout · root layout.

**States to force on each relevant screen:**
- Home: empty (first run) · with streak · OnThisDay banner · location granted / denied / picker sheet open · loading (skeleton) · submit error
- Verdict: YES / NO / MAYBE / UNCLEAR · high vs **low confidence** banner · **non-radical** chart (CTA swap) · **VOC moon** banner · strong chart (radicality ≥ 80 → ChartStrengthBar **Success haptic** fires) · timing teaser present vs absent
- Full reading: significators expanded/collapsed · aspects 0 vs many (show-all toggle) · reception present · perfection path · radicality flags (preview vs show-all) · key factors stagger
- Timing: with/without timing windows · Chart: chart wheel render
- Journal: empty state · populated list · scroll FPS · entry → result nav
- Stats: empty (`stats.noData`) · populated (verdict bars, count-up, streak, **best-streak** block, activity, accuracy) · floating-star empty animation
- Settings: language switch (all 7 locales) · API key add/remove · disclaimer · debug gate (verify unreachable)
- Onboarding: full sequence + StarField/orbit animations

**Capture method:** drive navigation with expo-router deep links (`xcrun simctl openurl <udid> hora://result/<demo-id>` / `adb shell am start -a android.intent.action.VIEW -d "hora://..."`), seed deterministic state via demo mode, then
`xcrun simctl io <udid> screenshot` / `adb exec-out screencap -p`. Assemble per-device contact sheets.

### Cross-cutting checks on EVERY screen (owner additions — apply with common sense)
On each screen, on each device, additionally verify:
- **Тактильность** — fire every tappable element and confirm the haptic actually triggers and matches
  the intent (Light for toggles/nav, Medium for navigation CTAs, Success for the strong-chart milestone).
  On simulators haptics don't *feel* — verify they're *wired* and flag "needs physical-device feel pass".
- **Плавность** — entrance, scroll, toggle and press animations hold 60/120fps with no stutter or
  «резкий» jump; data arriving must not snap the layout.
- **i18n overflow** — switch through all **7 locales** and watch for clipped/overflowing/ wrapped-ugly
  text in: tab bar labels, the verdict CTA («See full reading» → DE «Die vollständige Deutung ansehen»),
  buttons, chips (subject roles, categories, dignity/severity/confidence badges), uppercase tracked
  section headers, the big verdict badge, stat labels, onboarding copy. Worst case = **German/Russian on
  the smallest device** (iPhone 17e / small Android). Truncation that hides meaning = 🟠; layout break = 🔴.
- **Keyboard** — on every screen with a TextInput (AskForm question, LocationPicker city search,
  Settings API-key, onboarding): keyboard must not cover the input or the submit button; content
  scrolls/avoids; tap-outside or scroll dismisses; return/submit key behaves. `src/utils/keyboard.ts`
  + KeyboardAvoidingView exist — verify they actually work, don't just trust they're present.
- **Common sense** — anything that just looks/feels wrong (misalignment, contrast, dead taps,
  off-center, jank, awkward empty state) gets logged even if no rule names it.

---

## 3. API · latency · error matrix — LIVE host, throttled ("на публичном хосте, с задержками, чтоб не забанили")

**Rule: all data cases hit the LIVE public host with real values — but THROTTLED.**
- **Sequential only**, ~**1.5–2s spacing** between calls; never fire parallel bursts.
- Cap total volume per session; reuse a saved response (journal/demo) when re-checking the same UI
  state instead of re-calling. If we see 429/`Retry-After`, back off hard.
- A small helper (or just the test driver pacing itself) enforces the gap — getting rate-limited or
  banned mid-review is a self-inflicted blocker.

1. **Live archetypes (≥6, throttled)** — pick question times/categories that populate every section:
   career/get_position (answer + significators), one yielding **applying aspects**, one yielding
   **timing windows**, a **VOC-moon** time, a **non-radical** (early/late ascendant) time, and a
   **low-confidence** one. Capture each real response so the UI states can be re-reviewed offline.
2. **Slow-network UX** via `debugStore.mockDelayMs` (**0 / 600 / 2000 / 6000 ms** + forced error) —
   this does NOT touch the network, so use it freely to judge skeleton/spinner quality, no layout jump
   on resolve, button locked state, no double-submit, graceful timeout + retry copy.
3. **Offline / 4xx / 5xx / malformed envelope**: airplane mode, bad key (authed host 401),
   server-fault path (`!envelope.data`). Verify `EmptyState`/error UI, no white screen, no crash.

UX bar: under 600ms the spinner shouldn't flash awkwardly; at 2–6s the wait must feel intentional
(skeleton + a cosmic micro-animation), never frozen.

---

## 3b. Layout integrity — i18n overflow & keyboard (owner-priority dimension)

**i18n overflow sweep (all 7 locales × smallest device first):**
- Drive each screen in en → ru → de → fr → es → pt → uk; German and Russian/Ukrainian are the
  stress cases (longer words, wider Cyrillic). Smallest device (iPhone 17e / small Android) first.
- High-risk surfaces: verdict CTA button (DE «Die vollständige Deutung ansehen»), tab labels,
  subject-role / category chips, dignity / severity / confidence badges, uppercase tracked section
  headers, the verdict badge text, stats labels, onboarding paragraphs, Settings rows.
- Verdict per surface: clean / wraps-ok / **truncates meaning (🟠)** / **breaks layout — pushes,
  clips, overlaps (🔴)**. Note exact locale+device+screen for each.

**Keyboard behaviour (every TextInput):**
- AskForm question input, LocationPicker city search, Settings API-key, onboarding inputs.
- Check: keyboard never covers the active field or the primary button; surrounding content
  scrolls/avoids (KeyboardAvoidingView / `src/utils/keyboard.ts` actually working); tap-outside and
  scroll dismiss; return/submit key does the sensible thing; no jump when keyboard opens/closes;
  works with both iOS and Android soft keyboards (and Android back-button dismiss).

---

## 4. Animation & performance audit (the heart of "вау")

**Profile RELEASE builds** — dev builds carry JS-thread + bridge overhead and lie about FPS.

Objective metrics:
| Metric | Tool | Bar |
|---|---|---|
| Cold start | iOS `simctl launch` console / Android `adb shell am start -W io.hora.app` | < 2.0s to interactive |
| Sustained FPS (verdict entrance, journal scroll, stats bars) | iOS Instruments Core Animation · Android `adb shell dumpsys gfxinfo io.hora.app` | 60fps floor; 120fps on ProMotion/Pixel |
| Jank % | `gfxinfo` "Janky frames" | < 1% on flagship, < 5% on low-end |
| JS thread during animation | RN Perf Monitor | Reanimated 4 runs on **UI thread** (verified in code) → JS stays free; confirm no `runOnJS` storms |
| Memory / leaks | Instruments Allocations / Android Profiler | no growth across 20 ask→result cycles |

Subjective "juicy" rubric (score each screen 1–5):
- **Choreography** — entrance stagger reads as intentional, not random or "резкое"
- **Easing** — spring damping feels organic (no overshoot wobble, no robotic linearity)
- **Haptic alignment** — impact lands ON the visual beat (press squeeze, milestone success, toggles)
- **Continuity** — shared motion between screens, no hard cuts/flashes, no layout shift on data load
- **Palette richness** — gold/violet on deep-space bg reads premium; StarField/orbit alive but not noisy
- **Responsiveness** — every tap has < 100ms feedback (press scale already added)

Specific things to watch (from the code we just shipped): verdict 3-group entrance (nav/body/CTA),
TimingTeaser breathe loop (battery? keep subtle), RadicalityFlags reveal stagger, stats count-up
timing on low-end, ChartWheel SVG render cost, StarField particle count on weak GPUs.

---

## 5. Compliance lens (review as Apple + Google literally would)

**Apple App Review Guidelines**
- 2.1 Completeness — no crashes, no placeholders → **fix `APP_STORE_ID`**; verify on all 4 sims.
- 1.4.1 / 2.3 — astrology = entertainment; **fertility/pregnancy must not imply medical advice**;
  confirm disclaimer (store:finalize adds a Settings one) and that no `fertility_score` is shown.
- 5.1.1 — privacy: location purpose string ✓, privacy-policy URL ✓; Privacy "Nutrition Label" matches.
- 2.3.1 — no hidden/undocumented features reachable in prod → debug gate ✓ (re-verify).
- 4.0/4.2 — rich enough (journal+stats+charts) ✓; 4+ age rating ✓.

**Google Play**
- Target API level current (Play floor) — verify `targetSdkVersion` meets the latest requirement.
- Data Safety form matches actual collection (location only, on-device journal).
- 64-bit + App Bundle ✓ (AAB pipeline exists). Permissions justified (location). IARC content rating.
- No broken store links (`APP_STORE_ID` again), no deceptive metadata.

Also run `npx expo-doctor` and the existing `npm run typecheck/lint/test` (currently green) as the
static pre-flight gate.

---

## 5b. Copy quality — AI-writing audit (`npm run copy-audit`)

Automated gate over every i18n locale + store-listing draft, using the vendored
avoid-ai-writing detector (`scripts/vendor/avoid-ai-writing/`, MIT). Blocks on actionable
English AI-vocabulary slop (tier1/tier2, hashtag-stuffing, unfilled placeholders); reports
em-dash/formatting/bullet-list habits as warnings; ignores multilingual homoglyph and string-table
diversity false positives.

**Baseline (2026-06-30): 0 FAIL across all 14 sources** — copy reads human, not AI, in all 7
languages. Only soft signals present:
- **em-dash habit** everywhere (≈18 per locale file, 5–12 per store draft) — the one consistent tell.
- `bullet-np-list` on es/ru/uk store feature lists (standard store convention; low concern).
- The EN store description's "13 homoglyph swaps" flag is a **false positive** (legit `Русский ·
  Français · Português` + typography; no hidden homoglyph inside any English word — verified).

Run before every store submission; treat new tier1/tier2 hits as blockers, em-dash as a
style review (do NOT mass-strip — em-dash is valid typography and stripping flattens the voice).

---

## 5c. Compliance gate — Apple + Google (`npm run store-compliance`)

Two-sided pre-submission scanner, one command (`scripts/store-compliance.js`):
- **Apple** → `greenlight` (RevylAI, MIT) — App Store Review Guidelines: metadata, code patterns
  (private API / secrets / payments), privacy manifest, Required Reason APIs, tracking SDKs.
- **Google** → `gpc` (yasserstudio, MIT) — Play policy code scan: secrets, non-Play billing SDKs,
  tracking libraries.

Both scan broadly and over-report; the gate **filters noise by path** (docs/scripts/plugins/tests/
Pods/prototype) and applies **documented, visible suppressions** for verified false positives —
suppressed items print with their reason, never silently dropped.

**Install (one-time):**
```
greenlight:  brew install go && go install github.com/RevylAI/greenlight/cmd/greenlight@latest
gpc:         npm install -g @gpc-cli/cli
```
> CLT note: `greenlight` is built with `go install` (uses the working Xcode 26.5 clang). Homebrew's
> "Command Line Tools too outdated" complaint is a stale standalone-CLT-package check, **not** a real
> toolchain problem — no CLT update needed.

**Baseline (2026-06-30): no blocking findings.**
- Apple: 1 WARN — privacy-policy URL not in app.json (it is set in App Store Connect; informational).
  The "Amplitude tracking without ATT" CRITICAL is a **verified false positive** (amplitude appears
  only in the `docs/html-prototype` vendored react-dom bundle, not in deps/`src/`) — suppressed with reason.
  Fixed live: added `expo.description` to app.json.
- Google: clean (the lone hit is a mock token in a `__tests__` fixture — filtered).

**Tool caveats:** greenlight v0.1.0 has no ignore/`--config` (README is ahead of the release) → we
filter its JSON by path; gpc's full `preflight <aab>` zip reader crashes on our bundle → we use
`codescan` on `src/`. Re-run `--ci` to gate; a real CRITICAL/ERROR after filtering blocks.

**`--live` mode** (`npm run store-compliance -- --live`) also scans the *published* listings:
`greenlight scan` (App Store Connect) + `gpc listings analyze` (Play). greenlight byte-counts
non-Latin text, so it false-flags ru/uk length — the gate suppresses those with a reason; trust gpc
for length. Live audit + the metadata fixes applied (Support URL ×7, app.json description, APP_STORE_ID)
are recorded in [docs/store-drafts/live-audit.md](../store-drafts/live-audit.md). Live gate is down to
2 blocking findings, both Apple assets/build (screenshots + uploaded build).

---

## 6. Execution phases (how to actually realize this)

```
Phase 0  Static pre-flight (NO build, do first, inline)
         expo-doctor · typecheck/lint/test · copy-audit (AI-writing tells) ·
         store-compliance (greenlight + gpc) · audit APP_STORE_ID, fertility disclaimer,
         targetSdk, app.json compliance, debug-gate. → quick-win findings.

Phase 1  Builds
         1a iOS debug → iPhone 17 Pro Max sim (expo run:ios)
         1b Android debug → Pixel_9_Pro (expo run:android)
         1c create API-24 + small low-end AVDs (sdkmanager/avdmanager)
         1d RELEASE builds for honest perf numbers
         (heavy/long — gate before starting)

Phase 2  Screen walkthrough capture (fan-out per device once builds exist)
         deep-link + demo-mode nav → screenshot every screen×state → contact sheets.
         PER SCREEN also assert: haptics wired, animation smoothness, i18n overflow
         across 7 locales (smallest device first), keyboard never covers content.

Phase 3  API / latency / error matrix
         ≥6 LIVE archetypes THROTTLED (sequential, 1.5–2s apart — no ban) + capture each;
         mockDelayMs 0/600/2000/6000ms for slow-network UX (offline) + error/offline cases

Phase 4  Animation & perf profiling (release builds)
         cold start · gfxinfo/Instruments · jank% · juicy rubric per screen

Phase 5  Compliance audit (Apple + Google checklists)

Phase 6  Synthesis → findings report
         severity = 🔴 blocker / 🟠 major / 🟡 minor / 🟢 polish, + per-screen WOW score 1–5,
         + prioritized fix backlog
```

**Parallelization:** Phase 0 inline now. Phases 2–5 are embarrassingly parallel once Phase 1
builds exist — fan out via Workflow: one stream per (platform × screen-batch) for capture,
one per latency/error case, one per guideline cluster, then an adversarial "what did we miss"
critic before the Phase 6 synthesis.

**Hard limitations to state honestly in the final report:**
- Emulators ≠ real devices for haptics feel, true thermal/battery, GPU behaviour → flag anything
  that needs a physical-device pass before submit.
- Only iOS 26 sims installed → iOS 16/17 (our floor) unverified here.
- No automated UI driver → walkthrough is screenshot/deep-link based, not gesture-fuzzed.

---

*Deliverable of the run: `docs/orchestration/store-review-findings.md` — severity-ranked findings,
per-device contact sheets, latency/perf numbers, an **i18n-overflow matrix (7 locales × screens)**,
a **keyboard-behaviour checklist**, a **haptics-wired + smoothness log**, the compliance checklist,
and the WOW verdict (per-screen 1–5).*
