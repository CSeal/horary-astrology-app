---
created_by: claude-sonnet
updated_by: claude-sonnet-4-6
source_inputs: [CLAUDE.md, gate-criteria.md]
reviewed_by: owner-pending
---

# Handoff Log

Records completed stage transitions, gate status, and next-stage routing for the Horary Astrology app orchestration.

---

## Stage Entries

```json
{
  "stage": "Stage1-Research",
  "status": "COMPLETE",
  "completed_at": "2026-05-25",
  "gate1": "PASS",
  "gate2": "PASS",
  "artifacts": [
    "docs/project-brief.md",
    "docs/competitor-research.md",
    "docs/kpi-and-economics.md",
    "docs/superpowers/expert/horary-domain-brief.md",
    "docs/superpowers/library-audit/expo-libraries.md"
  ],
  "next_stage": "Stage2-PRD",
  "blockers": []
}
```

```json
{
  "stage": "Stage2-PRD",
  "status": "COMPLETE",
  "completed_at": "2026-05-25",
  "gate3": "PASS",
  "artifacts": [
    "docs/prd-v1.md",
    "docs/mvp-scope.md",
    "docs/ux-flows.md"
  ],
  "next_stage": "Stage3-Design",
  "key_decisions": {
    "default_language": "English",
    "iap": "deferred_to_phase2",
    "monthly_limit": 5,
    "screens": ["Home", "Loading", "Verdict", "Journal", "Settings", "Onboarding"]
  },
  "blockers": []
}
```

```json
{
  "stage": "Stage3-Design",
  "status": "COMPLETE",
  "completed_at": "2026-05-25",
  "gate4": "PASS",
  "artifacts": [
    "docs/design-system-brief.md",
    "docs/html-prototype/index.html"
  ],
  "next_stage": "Stage4-Architecture",
  "key_decisions": {
    "theme": "Cosmos Dark",
    "primary_font": "Cormorant Garamond",
    "body_font": "Inter",
    "accent_color": "#F5C842",
    "yes_color": "#22D3A4",
    "no_color": "#F87171"
  },
  "blockers": []
}
```

## Stage4-Architecture — 2026-05-26
status: COMPLETE
gate5: PASS
gate6: PASS
artifacts: [docs/technical-architecture.md, docs/api-integration-spec.md, docs/quality-gates.md, docs/delivery-roadmap.md, docs/superpowers/plans/partition-map.md]
expo_initialized: true
next_stage: Stage5a-Foundation
blockers: []

## Stage5a-Foundation — 2026-05-26
status: COMPLETE
artifacts: [app.json, tailwind.config.js, global.css, src/constants/theme.ts, src/constants/planets.ts, src/constants/config.ts, src/i18n/index.ts, src/i18n/en.ts, src/i18n/ru.ts, src/components/ui/Button.tsx, src/components/ui/Card.tsx, src/components/ui/Input.tsx, src/components/ui/Badge.tsx, src/components/ui/Banner.tsx, src/app/_layout.tsx, src/app/(tabs)/_layout.tsx]
dependencies_added: [expo-localization, lottie-react-native, @expo-google-fonts/inter, @expo-google-fonts/cormorant-garamond]
fonts: "@expo-google-fonts (Inter 400/500/600, CormorantGaramond 400/500/700) — loaded at runtime in src/app/_layout.tsx; replaces missing local TTFs"
verification: "tsc --noEmit PASS; eslint Batch A scope PASS (1 pre-existing i18next idiomatic warning)"
next_stage: Stage5b-Services
blockers: []

## Stage5c-Screens — 2026-05-26
status: COMPLETE
artifacts: [src/components/AskForm.tsx, src/components/VerdictCard.tsx, src/components/SignificatorRow.tsx, src/components/JournalItem.tsx, src/app/(tabs)/index.tsx, src/app/(tabs)/result/[id].tsx, src/app/(tabs)/journal.tsx, src/stores/questionsStore.ts]
key_decisions:
  swipe_delete: "react-native-gesture-handler is not installed; JournalItem uses TouchableOpacity onLongPress + Alert confirmation as MVP-friendly replacement for swipe-to-delete. Swap to Swipeable in a follow-up when gesture-handler is added."
  questions_store_ownership: "Consumed as-is from Batch B (per partition-map note 4 + Batch B handoff deviation). No modifications. Shape: { entries, monthlyCount, monthlyResetDate, addEntry, deleteEntry, incrementMonthlyCount, checkAndResetMonthlyCounter, hydrate }."
  verdict_animation: "Reanimated useSharedValue + withSpring (damping 14, stiffness 100) for scale 0.8→1.0; withTiming 400ms for opacity. Haptics.notificationAsync (Success for YES/MAYBE, Warning for NO, none for UNCLEAR)."
  navigation: "useHoraryQuery (Batch B) handles router.replace('/result/[id]') in onSuccess; Home screen does not navigate directly. Result screen uses router.back() with router.replace('/') fallback."
  loading_state: "ActivityIndicator (large, accent-gold) shown in place of AskForm while mutation.isPending. PlanetOrbit SVG (Batch D) deferred."
  error_states: "Home screen shows Banner for NETWORK_ERROR (noInternet), TIMEOUT (timeout), and other (apiError); location-denied banner with Linking.openSettings; limit-reached banner non-blocking and dismissible."
  empty_state: "Journal empty state has Sparkles icon + title/subtitle + CTA → router.push('/')."
  loading_min_duration_not_enforced: "LOADING_MIN_DURATION (1.5s) from config not enforced at screen layer in this batch — relies on natural API latency; can be added in QA polish if needed."
verification: "tsc --noEmit PASS; eslint src/ on Batch C files PASS (no warnings)"
next_stage: Stage5d-Polish
blockers: []

## Stage5b-Services — 2026-05-26
status: COMPLETE
artifacts: [src/types/horary.ts, src/types/journal.ts, src/types/navigation.ts, src/services/horaryApi.ts, src/services/locationService.ts, src/services/journalService.ts, src/services/secureKeyService.ts, src/hooks/useHoraryQuery.ts, src/hooks/useLocation.ts, src/hooks/useJournal.ts, src/stores/settingsStore.ts, src/stores/questionsStore.ts, src/services/__tests__/horaryApi.test.ts, src/stores/__tests__/questionsStore.test.ts]
key_decisions:
  api_client: "axios instance with request interceptor (Bearer token from SecureStore → env fallback) + response interceptor (normalizes AxiosError → HoraryAPIError)"
  retry_policy: "3 attempts, exponential backoff 1s/2s/4s; retryable=true only for 5xx + network errors (4xx never retried)"
  api_key_priority: "SecureStore('horary_api_key') → process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY → empty string (will 401)"
  monthly_counter: "5/month per prd-v1.md; auto-reset on month boundary via checkAndResetMonthlyCounter(); incremented AFTER successful API response"
  store_shape: "settingsStore exposes hydrate() + locale selector (consumed by src/app/_layout.tsx Batch A); questionsStore exposes hydrate() with auto monthly reset"
  storage_split: "AsyncStorage = journal entries + counter + locale; SecureStore = API key only (never AsyncStorage, never logged)"
  timezone: "Intl.DateTimeFormat().resolvedOptions().timeZone — IANA string, captured at API call submission"
  location_service: "expo-location foreground-only + reverseGeocodeAsync for city display; non-fatal on geocode failure"
note_partition_deviation: "src/stores/questionsStore.ts implemented in Batch B (depended on by useHoraryQuery + useJournal); partition-map placed it in Batch C but Batch B agent owns shape since both hooks consume it. Batch C agent only needs to consume, not modify."
verification: "tsc --noEmit PASS; eslint Batch B scope PASS (1 idiomatic axios.create warning, non-blocking); test suite has pre-existing babel/jest config issue outside Batch B scope (defer to QA stage)"
next_stage: Stage5c-Screens (∥ Stage5d-Polish)
blockers: []

## Stage5d-Polish — 2026-05-26
status: COMPLETE
artifacts: [src/components/svg/StarField.tsx, src/components/svg/PlanetOrbit.tsx, src/components/svg/PlanetGlyph.tsx, src/components/svg/VerdictStar.tsx, src/components/svg/ChartWheel.tsx, src/components/CosmosBackground.tsx, src/app/(tabs)/settings.tsx, src/app/onboarding.tsx, src/components/ui/ErrorBanner.tsx, src/components/ui/EmptyState.tsx, src/components/ui/SkeletonItem.tsx, src/app/_layout.tsx, src/i18n/en.ts, src/i18n/ru.ts]
key_decisions:
  starfield: "60 SVG Circle elements (react-native-svg) animated via Reanimated useSharedValue + withRepeat(withTiming(opacity, 2-5s), -1, true) — UI thread only, no per-render re-renders. Particle layout is deterministic via seeded LCG so positions stay stable across re-renders. Fill color = colors.textPrimary from theme.ts."
  cosmos_background: "Now renders StarField sized to useWindowDimensions() inside an absolute layer with bg-bg-surface/20 overlay for subtle vignette. CosmosBackground accepts children for compositing."
  planet_orbit: "Single shared rotation value drives a transform string on Animated G; corePulse drives the central radius via animatedProps on Circle. 3s revolution + 1.5s pulse, both Reanimated withRepeat."
  planet_glyph: "Rewritten as SVG Text element (was RN Text). Accepts PlanetKey enum ('sun'|'moon'|...) mapped onto PLANET_GLYPHS keys; color prop defaults to colors.textPrimary."
  verdict_star: "8-point starburst Polygon, scale 0→1 via withSpring(damping 15, stiffness 100), rotation 0→180° via withTiming 600ms; color sourced from VERDICT_COLOR map keyed by VerdictType."
  chart_wheel: "Phase 2 placeholder — empty outer/inner circles with 12 radial dividers + 'Chart wheel — Phase 2' label, all using theme tokens."
  settings_screen: "Segmented EN/RU toggle calls settingsStore.setLocale + i18n.changeLanguage in parallel. Timezone read-only via Intl.DateTimeFormat resolvedOptions. Question counter shows monthlyCount / MONTHLY_QUESTION_LIMIT with a gold-fill progress bar (width as inline % style). API key uses secureKeyService.setKey/deleteKey/getKey; source indicator reflects apiKeySource from settingsStore."
  onboarding: "3-step flow per agent brief (Welcome → How it works → Location). Step 3 calls locationService.requestPermission() then writes ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETE='1' regardless of grant/deny. Skip button on steps 0/1, Back link from step 1 onward, StepDots indicator at bottom."
  onboarding_gating: "Root layout (_layout.tsx) reads ONBOARDING_COMPLETE on boot and uses useSegments/useRouter to redirect: if not complete and not in /onboarding → replace('/onboarding'); if complete and in /onboarding → replace('/'). Splash held until fonts + stores + onboarding flag all ready."
  error_banner: "Distinct from existing Banner component — accepts action: { label, onPress } that renders an inline text button (no dismiss × ). Used for cases needing primary recovery action (e.g. 'Open Settings')."
  empty_state: "Generic icon + title + subtitle + optional children (typically a CTA button). Replaces ad-hoc empty states in Journal."
  skeleton_item: "Reanimated opacity shimmer (0.4↔0.8, 1s) inside a bg-bg-card rounded surface. Height prop is the only dynamic dimension (Tailwind class names with arbitrary numeric h-[N] would defeat tree-shaking)."
  anti_patterns_respected: "No StyleSheet.create anywhere; all SVG colors via theme.ts (colors.textPrimary, colors.accentViolet, colors.accentGold, colors.yes/no/maybe/unclear); all SVG sizes via props with sensible defaults; CosmosBackground is the only consumer of StarField; inline styles used ONLY for Reanimated useAnimatedStyle outputs and the dynamic progress-bar width %."
verification: "tsc --noEmit PASS; eslint src/ — 0 errors, 2 pre-existing idiomatic warnings (i18n.use, axios.create) outside Batch D scope. All Batch D files clean."
next_stage: Stage6-QA
blockers: []

## Stage5e-Cleanup — 2026-05-26
status: COMPLETE
scope: "Pre-QA hardening — auto-fix version drift, lint, TypeScript, and deferred batch items."
note: "Originally recorded as informal 'Stage5-Cleanup'. Formalised as Stage5e on 2026-05-28 with dedicated agent (horary-cleanup-agent) and command (/orchestrate-stage5e)."
automated_fixes:
  expo_install_fix: "npx expo install --fix — aligned @types/jest → 29.5.14 and eslint-config-expo → ~55.0.1 to SDK 55 expected versions."
  gesture_handler: "Installed react-native-gesture-handler. Wrapped root layout in GestureHandlerRootView. Replaced JournalItem long-press+Alert fallback with ReanimatedSwipeable."
  jest_runtime: "Installed jest-expo@~55.0.x + babel-preset-expo. Test suite now runs."
  lint_autofix: "Disabled import/no-named-as-default-member (i18n.use, axios.create canonical idioms)."
  expo_doctor: "19/19 checks PASS (was 18/19)."
p0_issues: "none"
p1_issues:
  npm_audit: "13 moderate vulnerabilities — ALL transitive within Expo SDK 55 (uuid<11.1.1 → @expo/cli). npm audit fix --force would downgrade Expo to v46 (breaking). Upstream issue, not actionable at app level."
  loading_min_duration: "1.5s LOADING_MIN_DURATION not enforced at screen layer (relies on natural API latency). Acceptable for MVP."
final_verification: "expo doctor PASS (19/19); tsc PASS; lint 0 errors 0 warnings; jest 9 suites / 54 tests PASS"
next_stage: Stage6-QA
blockers: []

## Stage6-QA — 2026-06-04
status: COMPLETE
gate7: PASS
gate8: PASS
p0_issues: none
p1_issues:
  - StyleSheet.create in AnimatedSplash.tsx (layout-only, no hex, low risk)
  - Unused import SUPPORTED_LOCALES in journal.tsx (ESLint warning)
  - Array<T> style warning in horary.ts (ESLint warning)
  - Jest worker force-exit warning (timer leak, does not affect results)
  - secureKeyService.ts 14% coverage (expected — thin SecureStore wrapper)
  - loading_min_duration withMinDuration hook exists but not wired to mutation
  - npm audit 13 moderate vulns (all transitive Expo SDK 55, not actionable)
  - docs/features/testing.md baseline stale (documents 9/54, actual is 10/71)
artifacts: [docs/qa-summary.md, docs/demo-readiness.md]
test_result: "10 suites / 71 tests PASS (baseline was 9/54 — suite grew, no regression)"
blockers: []

## StageM1-MarketResearch — 2026-06-04
status: COMPLETE
gateM1: PASS
artifacts: [docs/competitor-research.md, docs/aso-brief.md]
reviews_mined: 60+
keywords_identified: 50
key_findings:
  - Horary Chart (iOS) price increased $15.99 → $23.99, rating dropped to 3.8 — market opportunity widening
  - Lunaton added tarot/runes in 2026 — diluting its horary positioning, leaving pure-horary niche open
  - New competitor: Horary Astrology Pro (Android) — most feature-complete Android horary app; lacks AI interpretation, Russian, premium UI
  - Top competitor pain points confirmed: complexity, no explanation, slow answers, expensive, no Russian
  - 7 Hora differentiators identified and documented (AI interpretation, instant answer, Russian, free tier, beginner UX, journal, premium UI)
  - 50 keywords ranked across 5 groups: English horary, technique, use-case, broad, Russian
  - 5 app name candidates generated; Candidate A recommended ("Hora: Horary Chart" / "Ask. Get an Instant Answer.")
  - Apple 4.3(b) compliance requirements documented and addressed in all ASO copy
next_stage: StageM2-GrowthSpec || StageM3-APIAudit
blockers: []

## StageM2-GrowthSpec — 2026-06-04
status: COMPLETE
gateM2: PASS
artifacts: [docs/viral-features-spec.md, docs/growth-features-spec.md]
next_stage: StageM4-DocRefresh (after StageM3 also COMPLETE)
blockers: []

## StageM3-APIAudit — 2026-06-04
status: COMPLETE
gateM3: PASS
artifacts: [docs/api-gap-spec.md]
gaps_identified: 10
gaps_specced_phase15: 8
next_stage: StageM4-DocRefresh (after StageM2 also COMPLETE)
blockers: []

## StageM4-DocRefresh — 2026-06-04
status: COMPLETE
gateM4: PASS
artifacts: [docs/prd-v1.md, docs/mvp-scope.md, docs/design-prompts/prototype-update-v2.md, docs/INDEX.md]
prd_frs_added: FR-G01 through FR-G07
prototype_brief: docs/design-prompts/prototype-update-v2.md
next_stage: /orchestrate:design (prototype update) OR /orchestrate:implement-growth (feature implementation)
blockers: []

## Stage6b-QARerun — 2026-06-04
status: COMPLETE
gate7: PASS
gate8: PASS
scope: "Full QA re-run covering Phase 1 MVP + Phase 1.5 Growth (Verdict C+ two-screen layout, FR-G02 review prompt, FR-G03 invite/rate, FR-G04–G07 API field surfacing). Supersedes Stage6-QA entry."
automated_checks:
  expo_doctor: "19/19 PASS"
  tsc: "PASS — 0 errors"
  eslint: "0 errors, 0 warnings (clean — previous P1 warnings resolved)"
  jest: "11 suites / 84 tests PASS"
smoke_tests: "8/8 PASS (Home, VerdictCard, horaryApi, questionsStore, i18n, Settings, ResultScreen C+ Screen1, FullReading C+ Screen2)"
anti_patterns:
  StyleSheet_create: "0 instances (AnimatedSplash.tsx converted to plain object literal)"
  hardcoded_hex: "1 in _layout.tsx comment only — not live code, no violation"
  typescript_any: "0 violations"
p0_issues: none
warnings_resolved_same_session:
  - "StyleSheet.create in AnimatedSplash.tsx → plain object literal composing with animated-style array"
  - "Jest worker force-exit (timer leak) → useDebugTrigger now clears reset timer on unmount; --detectOpenHandles reports 0 open handles"
  - "withMinDuration 'not wired' → false positive; it IS wired in useHoraryQuery.ts (gated by debug skipMinLoading)"
  - "docs/features/testing.md baseline stale → updated to 11/84 across testing.md, INDEX.md, horary-qa-agent.md, horary-cleanup-agent.md, orchestrate-stage6.md"
p1_issues:
  - secureKeyService.ts low coverage (expected — thin SecureStore wrapper)
  - npm audit 13 moderate vulns (all transitive Expo SDK 55, not actionable)
  - FR-G01 share card deferred (see docs/features/share-reading-G01-deferred.md)
artifacts: [docs/qa-summary.md, docs/demo-readiness.md, src/hooks/useDebugTrigger.ts, src/components/AnimatedSplash.tsx, docs/features/testing.md]
test_result: "11 suites / 84 tests PASS (grew from 10/71 at Stage6-QA — reviewPromptService.test.ts added, horaryMapper.test.ts grew 14→20). Jest exits cleanly, no worker force-exit."
blockers: []

## Stage6b-StoreProp — 2026-06-04
status: COMPLETE
gate6b: PASS
artifacts:
  - docs/privacy-policy.md
  - docs/apple-privacy-labels.md
  - docs/play-data-safety.md
  - docs/reviewer-notes.md
  - docs/store-drafts/en.md
  - docs/store-drafts/ru.md
  - docs/store-drafts/de.md
  - docs/store-drafts/fr.md
  - docs/store-drafts/es.md
  - docs/store-drafts/pt.md
  - docs/app-icon-spec.md
  - scripts/generate-icon.js
  - scripts/build-privacy.js
  - .github/workflows/deploy-privacy.yml
  - package.json (patched — generate:icon + build:privacy scripts added; sharp + marked added to devDependencies)
data_collection_audit:
  location: "yes, per-request + journal city name, sent to astrology-api.io per request (HTTPS), not linked to identity"
  journal_entries: "yes, AsyncStorage device-only, not shared, user-generated content"
  locale_preference: "yes, AsyncStorage device-only, not shared, not linked"
  location_source_preference: "yes, AsyncStorage device-only, not shared, not linked"
  zodiac_type_preference: "yes, AsyncStorage device-only, not shared, not linked"
  onboarding_flag: "yes, AsyncStorage device-only, not shared, not linked"
  install_date: "yes, AsyncStorage device-only (review prompt timing), not shared, not linked"
  review_prompt_state: "yes, AsyncStorage device-only, not shared, not linked"
  api_key: "yes (if user-supplied), SecureStore encrypted, sent to astrology-api.io as Bearer token, not shared with others"
  no_analytics: true
  no_crash_reporter: true
  no_advertising: true
owner_actions_required:
  - "npm install (installs sharp + marked from devDependencies)"
  - "npm run generate:icon  → assets/icon.png + assets/adaptive-icon.png (verify visually, then copy to assets/images/)"
  - "npm run build:privacy  → public/privacy-policy.html (verify content)"
  - "git push → GitHub Actions deploys privacy policy to GitHub Pages"
  - "Insert privacy policy URL into docs/reviewer-notes.md ([PRIVACY_POLICY_URL])"
  - "Insert privacy policy URL into docs/play-data-safety.md ([PRIVACY_POLICY_URL])"
  - "Insert demo API key into docs/reviewer-notes.md ([DEMO_API_KEY])"
  - "Set demo PIN in debug mode and insert into docs/reviewer-notes.md ([DEMO_PIN])"
  - "Insert contact email into docs/privacy-policy.md ([OWNER_EMAIL])"
  - "Add entertainment disclaimer string to Settings screen (see docs/reviewer-notes.md Section 2)"
  - "Verify iOS Subtitle char count for es.md (adjusted to 29 chars)"
  - "Verify all store-drafts character counts before entering into App Store Connect / Play Console"
next_stage: /orchestrate:screenshots → then App Store Connect submission
blockers: []

## Catch-Up — 2026-06-04 → 2026-07-01 (retroactive, condensed)
status: COMPLETE (all items)
note: >
  This log fell behind reality for a month — the team moved straight from feature work into
  release/signing/submission work without circling back to log each stage individually.
  next-phases-plan.md was similarly stale (still read "Stage 5a ← NEXT" as of 2026-07-02
  despite everything below being done). Reconstructed from direct source verification
  (grep/read against current code), not from original per-stage handoffs — dates are
  approximate. See git log for exact commit-level history.
shipped:
  phase1.5_verdict_cplus: "Two-screen verdict layout (compact badge + full reading), ChartStrengthBar, VocMoonBanner rich detail, AspectRow, TimingBlock/TimingTeaser — commit 6aeae17"
  phase1.5_growth: "G02 review prompt (reviewPromptService) + G03 invite/rate (Settings Share section) — commit ecdb629. G01 share verdict card DEFERRED (needs physical-device dev build, see docs/features/share-reading-G01-deferred.md)"
  outcome_tracking: "came_true/did_not_happen/pending on JournalEntry + Journal UI — commit e960185"
  chart_wheel: "HoraryChartWheel SVG (12 houses + planets, chart_data mapping) — commit f1e0101"
  location_fallback: "LocationPickerSheet wired as GPS-denied fallback — commit 7d5a364"
  sentry: "@sentry/react-native installed + wired in _layout.tsx, guarded by EXPO_PUBLIC_SENTRY_DSN — commit 0c67e9f. NOTE: DSN was never actually set, so this stayed dormant through the incident below — see Stage-Incident entry."
  full_api_coverage: "All of docs/api-gap-spec.md GAP-1 through GAP-8 closed — aspect_perfections (AspectRow, not the spec's suggested AspectPerfectionRow name), dignity_score/domicile_ruler, radicality_score + flags filter, SUBJECT_ROLES third_party_sibling/enemy, significators collapsible toggle, lunar_rich VOC detail, timing[] extraction. Plus beyond-spec: reception, secondary_perfection/perfectionPath, key_factors, testimony_score, full accidental_conditions. GAP-9 (/horary/aspects full coverage) and GAP-10 (fertility routing) remain deliberately deferred, not oversights."
  retention_stage6: "stats.tsx screen (verdict distribution, accuracy%, activity chart, top categories), useStats/useStreak hooks, StreakBadge, OnThisDayBanner + onThisDayService, local outcome-reminder notifications (notificationService, expo-notifications) — all confirmed shipped, no dedicated log entry ever written"
  ui_i18n_audit: "56-screen (8 screens × 7 locales) UI/i18n/perf audit — 10 defects found and fixed (localized dates in journal/stats, FR/DE label wrapping, banner link alignment, PT tab label, tab-bar icon centering ~19pt off → 0.3pt, Android tab-label truncation regression, keyboard inset hardening). Findings: docs/orchestration/store-review-findings.md. Plan (now archived, audit complete): docs/orchestration/archive/store-review-plan.md"
  store_submission: "iOS 1.0.0 build 1 submitted 2026-07-01 (WAITING_FOR_REVIEW). Android v110 submitted 2026-07-02 (production, 100% rollout, status completed, review pending). Both later found broken — see Stage-Incident entry immediately below."
test_baseline_growth: "217 passed / 223 total (6 skipped), 17 suites — grown from the 84 recorded at Stage6b-QARerun"
blockers: []

## Stage-Incident-APIKeyLeak — 2026-07-02
status: COMPLETE
severity: P0 — production-breaking, both platforms, confirmed live
summary: >
  v1.0.0 (iOS build 1) / v110 (Android) shipped with EXPO_PUBLIC_ASTROLOGY_API_KEY from the
  developer's own .env.local baked into both release binaries. EXPO_PUBLIC_* vars are inlined
  as literal strings into the JS bundle at build time — every install without a personal key
  in Settings silently authenticated with this one shared dev key against the AUTHED host
  (api.astrology-api.io), not the anonymous public host as intended. The key's quota, already
  exhausted by a month of live-API testing/audits, meant EVERY real user got a persistent
  LIMIT_EXCEEDED error on every question — the app's core flow was fully broken for the entire
  install base. Confirmed live and reproducible by the owner via direct Play Store install.
root_cause_chain:
  - "getApiKey() priority: SecureStore (personal) → EXPO_PUBLIC_ASTROLOGY_API_KEY env var (dev fallback) → empty (public host). Intent: dev convenience only."
  - "Expo's env loader reads .env.local straight off disk for ANY build (dev or release) — build-android.sh / build-ios.sh never excluded it."
  - "The generic LIMIT_EXCEEDED banner text ('...monthly limit...') masked the real cause — misleadingly implies a client-side monthly quota that doesn't exist in the current codebase (the old local-counter design was already fully replaced by pure 429 passthrough from the server; nobody had updated the copy)."
diagnosis_method: >
  Live curl tests against api-public.astrology-api.io confirmed the ANONYMOUS public host was
  healthy (200 OK, then a burst of 5 rapid requests tripped a real short-window 429 — proving
  the server-side burst protection is real but NOT what the shipped app was hitting). Direct
  unzip + grep of the ALREADY-SUBMITTED AAB/IPA for the literal .env.local key value confirmed
  it was embedded in both `base/assets/index.android.bundle` and `Payload/Hora.app/main.jsbundle`.
fix:
  - "scripts/build-android.sh, scripts/build-ios.sh: stash .env.local for the full release build duration (trap-restored even on failure), fail the build if the stashed key is found embedded in the output AAB/IPA (regression guard)"
  - "build-ios.sh: second bug found during re-verification — expo prebuild writes CFBundleVersion into Info.plist as a literal string (no expo.ios.buildNumber was ever set in app.json), so the xcodebuild CURRENT_PROJECT_VERSION flag never reached the compiled binary; every 'release' build silently kept CFBundleVersion=1. Fixed via direct PlistBuddy patch right after prebuild."
  - "app.json version 1.0.0 → 1.0.1 (needed so force-update semver comparison can distinguish fixed installs from broken ones)"
  - "LIMIT_EXCEEDED banner split into two copy variants keyed on settingsStore.apiKeySource (personal vs default/public) across all 7 locales — public-key copy now explains the shared connection + points at Settings; personal-key copy points at the user's own astrology-api.io quota. Old 'monthly limit' framing removed entirely."
  - "New src/components/KeyboardDismissBar.tsx — unrelated small UX add bundled into the same fix cycle, floating hide-keyboard button above the software keyboard, visible only while it's open"
android_resolution: "Rebuilt AAB (versionCode 112, versionName 1.0.1), independently verified key-free (fresh unzip + grep, not trusting the build script's own echo), uploaded via google_upload_bundle, production release created at 100% rollout (not staged — the prior release was broken for everyone, so partial rollout would leave some users on the broken build for no benefit). Verified live via fresh google_get_track read. v110 fully superseded."
ios_resolution: >
  Cancelled the pending 1.0.0 WAITING_FOR_REVIEW submission (apple_cancel_submission) → version
  went to DEVELOPER_REJECTED (normal, fully-editable state, not an error). Rebuilt IPA with the
  Info.plist fix, independently reverified (CFBundleVersion=112, CFBundleShortVersionString=1.0.1).
  Uploaded via altool, waited for Apple's async processing (~2-10 min — NOT reflected immediately
  in apple_list_builds; a first poll too early showed the OLD build only). Attempted
  apple_create_version for a clean parallel 1.0.1 record — rejected (409, Apple does not allow a
  second unreleased version while one exists in any pre-READY_FOR_SALE state). Reused the existing
  1.0.0 version record instead: apple_assign_build succeeded (state → PREPARE_FOR_SUBMISSION)
  without requiring the versionString to match the binary's internal 1.0.1. apple_submit_for_review
  then hit an unclear 403/409 pair (leftover appStoreVersionSubmissions resource in a delete-only
  state; a retry cancel returned "Cannot reject version" / "Submit for review errors found" with no
  actionable detail) — stopped automating at that point rather than guessing further against a
  production Apple account. Owner completed the final Submit for Review click manually in the ASC
  web UI (which also corrected the version string to 1.0.1 in the same pass). Confirmed via API:
  appStoreState WAITING_FOR_REVIEW, versionString 1.0.1, build 112 attached.
process_notes_for_next_time:
  - "Trust but verify applies to your own build scripts, not just the code under review — the build-number bug was only caught because the IPA's actual Info.plist was re-checked independently before upload, not because the script's own echo output was trusted."
  - "A background agent asked to poll an external API on a timer got confused about how to wait (tried something resembling a blind sleep, self-corrected, then stalled) — for main-loop polling, a bare `sleep N` with run_in_background:true works and gets a completion notification; chained `sleep && command` is blocked entirely. Prefer handling multi-step external-API polling in the main loop rather than delegating the wait itself to a sub-agent."
  - "google_create_release requires an explicit google_validate_edit + google_commit_edit — nothing publishes until commit_edit, independent of whether the task prompt enumerates that step."
  - "Apple: cancelling a submission does not delete the underlying appStoreVersionSubmissions resource cleanly in all cases; re-submission after a cancel can hit unclear state errors with no available list/delete tool to fully diagnose via API — budget for a manual ASC web UI fallback on any future cancel-and-resubmit."
force_update: "docs/app-version.json android.minVersion raised 1.0.0 → 1.0.1 (Android hotfix confirmed live). ios.minVersion intentionally left at 1.0.0 until Apple approves the resubmitted 1.0.1 — bumping early would force-gate users onto a build that doesn't exist yet in the store."
commit: "61a81f3 — not yet pushed (owner deferred the push/force-update-activation decision separately from the commit itself)"
outstanding_after_this_entry:
  - "Push commit 61a81f3 to main (activates Android force-update via GitHub Pages deploy) — owner decision pending"
  - "iOS still WAITING_FOR_REVIEW — once approved, raise ios.minVersion to 1.0.1 and push again"
  - "GCP service-account key (hora-mcp@...) exposed in a chat transcript 2026-06-25 — rotation still not confirmed done (see feedback_keystore_in_git / project_status_audit_20260702 memory)"
  - "Appeeky Bearer token was committed in plaintext to a PUBLIC repo (.mcp.json, github.com/CSeal/horary-astrology-app) — owner said not worth rotating given a planned subscription cancellation in ~2 weeks; GCP key is unrelated and still needs a decision"
blockers: []
