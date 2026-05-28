---
created_by: phase-1b-domain-advisor
updated_by: phase-1b-domain-advisor
source_inputs:
  - inline spec (user prompt, 2026-05-27)
  - web searches (Apple guidelines, Expo docs, Halcyon Mobile, Build38, HN)
reviewed_by: pending
---

# Domain Audit — Hidden Developer/Debug Mode (RN/Expo, Horary App)

## 1. Domain(s) Identified

- `mobile-debug-mode` (hidden in-app developer settings, activation UX, gating)
- `app-store-compliance` (Apple Guideline 2.3.1 "hidden features", Google equivalent)
- `mobile-security` (info-leak surface from prod debug surfaces)

## 2. Sources Consulted

KB checked: `_knowledge-base/` has `mobile-force-update.md`, `mobile-remote-config.md`. No prior `mobile-debug-mode.md` — new file created (Section 9).

Authoritative:
- [App Store Review Guidelines — Apple](https://developer.apple.com/app-store/review/guidelines/) (Guideline 2.3.1: "Don't include any hidden, dormant, or undocumented features")
- [Android Studio — Configure on-device developer options](https://developer.android.com/studio/debug/dev-options) (7-tap Build Number pattern, with toast countdown after tap 3)
- [Expo DevMenu docs](https://docs.expo.dev/versions/latest/sdk/dev-menu/) (only in dev clients, NOT release builds)
- [Expo workflow — development and production modes](https://docs.expo.dev/workflow/development-mode/) (`__DEV__` is stripped at minify time in prod)
- [Expo feature flags guide](https://docs.expo.dev/guides/using-feature-flags/)
- [Android security — Test and debug features](https://developer.android.com/privacy-and-security/risks/test-debug)

Practitioner / community:
- [Halcyon Mobile — What Could a Debug Menu Contain?](https://halcyonmobile.com/blog/mobile-app-development/android-app-development/what-could-a-debug-menu-contain/)
- [Build38 — Debugging Mobile Apps: Security Risks Explained](https://build38.com/blog/threats-mobile-app-device/debugging-potential-security-risk/)
- [Medium — Secure Debug/Developer Mode (Meyta Zenis Taliti)](https://medium.com/@meytataliti/secure-debug-developer-mode-bf75d15c0d0a)
- [HN — Someone left my Gmail in debug mode](https://news.ycombinator.com/item?id=10652853)
- [HN — IoT Fails: Production App Hit Staging API and Exposed Debug Tools](https://news.ycombinator.com/item?id=45520716)
- [Hossain Khan — How to be an Android Developer with just 7 taps](https://hossainkhan.medium.com/how-to-be-an-android-developer-with-just-7-taps-deep-dive-8abebfc07061)

Audience-side: searches against `r/reactnative`, `r/iOSProgramming`, `r/androiddev` for "hidden debug menu production" returned **zero relevant threads**. Honest finding: this is not a frequent forum complaint — the topic is well-handled by the Android convention and rarely abused enough to generate user-side outrage. No community evidence threshold met; treat all "community" claims below as **isolated reports**.

## 3. Domain Constraints the Brainstorm Probably Missed

**MUST**
- MUST gate the debug screen behind a check that survives release builds (an in-memory boolean enabled by the tap-counter), **but** MUST NOT advertise the feature to App Review or in user-facing copy. Apple 2.3.1 specifically prohibits "hidden, dormant, or undocumented features" — Apple's enforcement focus is **remote-activated** features (server flag flips production behavior post-review). A locally-activated QA convenience that only resets local state is **a different risk class** but is still technically covered by the literal text of 2.3.1. See Section 5.
- MUST scope every debug action to **local device state only** (AsyncStorage keys, in-memory flags, navigation). Any action that bypasses payment, unlocks paid content, or alters server state escalates this from "QA convenience" to "store-violation severity".
- MUST NOT log, display, or expose: API keys, user PII (DOB/birth location are PII), session tokens, raw API request/response bodies that contain auth headers. The horary app sends birth data to `astrology-api.io` — a "network log dump" debug action would leak the API key and user birth data.
- MUST strip strings like "debug mode", "developer options", "QA build" from user-visible UI in release. Toast/alert confirmations should read neutrally (e.g. "✓" haptic only, or a non-descriptive emoji) or be silent.
- MUST make the debug flag **non-persistent in release builds** (in-memory only, lost on app restart). Persistent (AsyncStorage) is acceptable only in internal/QA builds. Rationale: a curious user who taps the version 10 times shouldn't get a permanent "stuck" debug state.
- MUST require the trigger to be **non-discoverable by accident**. The Android convention is 7 taps within ~3 seconds. Fewer than 5 taps risks accidental activation (kids handing phone back, fat-finger). More than 10 is annoying even for the developer.

**MUST NOT**
- MUST NOT use `__DEV__` alone as the gate if QA needs to test against TestFlight/internal Play track. `__DEV__` is `false` in any EAS Build profile that isn't `development`. Use a build-time env var (e.g. `EXPO_PUBLIC_QA_BUILD=1`) for QA channels, plus `__DEV__` for the local dev case.
- MUST NOT use the standard Expo DevMenu (shake gesture) as your QA debug UI — it's automatically disabled in release builds and is not extensible with custom actions ([Expo DevMenu docs](https://docs.expo.dev/versions/latest/sdk/dev-menu/)).
- MUST NOT include "reset paywall counter" as a debug action in a binary that ships to the App Store, even if it only resets local state. If a reviewer (or a competitor filing a complaint) discovers it, this reads as "circumvent in-app purchase entry point" → potential 3.1.1 violation in addition to 2.3.1. Gate this **specific** action to QA-only builds.

**SHOULD**
- SHOULD locate the trigger on the **app version label in Settings/About** — it's the established convention, devs find it immediately, and users have no reason to tap it.
- SHOULD provide subtle progressive feedback after tap 3 (Android shows "You are 4 taps away from being a developer" — gives a developer a visible "I'm on the right track" signal while still being cryptic to a random user).
- SHOULD use haptic-only or a tiny visual nudge for the first few taps, and a clear toast on activation. Silent activation makes the dev question whether the trigger worked.
- SHOULD reset the tap counter on a 3-second timeout between taps so partial sequences don't accumulate over a session.
- SHOULD add a 4-digit PIN or biometric gate on top of the tap trigger for App Store builds that include any QA action beyond pure read-only state inspection (this is the Halcyon Mobile recommendation).

## 4. Common Traps in This Domain

1. **Persisting the unlock flag in AsyncStorage in release builds.** Once a user trips it accidentally, they live in debug mode forever and may file a bug report ("my app is showing weird buttons") that you can't reproduce.
2. **Toast saying "Debug mode enabled".** The string survives in the JS bundle and is grep-able by anyone running `unzip ipa && strings`. Use a non-descriptive emoji or no toast.
3. **Including "Force update screen" as a debug action without scoping.** If it triggers the actual force-update modal that blocks the app, a curious user who activates debug mode locks themselves out until they reinstall.
4. **Network log dump that captures Authorization headers.** Standard mistake — the astrology-api.io key is in the request header. Sanitise headers before display, or omit headers entirely.
5. **"Reset monthly counter" wired to the same path as the legitimate counter logic.** If a future refactor moves the counter to server-side, the debug action silently becomes a no-op and QA stops noticing regressions for weeks.
6. **Forgetting to test that the debug screen itself doesn't appear in App Store screenshots / accessibility tree.** Apple reviewers occasionally run accessibility scans — a `Pressable` with `accessibilityLabel="Debug Menu"` is discoverable even when invisible.
7. **Hardcoding test coordinates (location override) that point to a real address.** Geo-test coords that match an employee's home leak in screenshots.
8. **No exit affordance.** Dev enables debug mode, ships the build, can't disable without uninstall. Always provide "Disable debug mode" inside the debug screen.

## 5. Regulatory / Compliance Notes

- **Apple Guideline 2.3.1 — Hidden Features.** Verbatim: *"Don't include any hidden, dormant, or undocumented features in your app; your app's functionality should be clear to end users and App Review."* ([source](https://developer.apple.com/app-store/review/guidelines/)).
  - **Enforcement reality:** Apple's documented rejection examples under 2.3.1 are about **remote-activated** behavior (e.g. external payment via remote flag, code-push that adds features post-review). A locally-activated developer aid that only affects local state is **rarely** the rejection driver, but it is **technically** covered by literal reading.
  - **Mitigation:** disclose the debug entrypoint in the App Store Connect "Notes for Review" field on the very first submission. ("App contains a developer diagnostics screen accessible by tapping the version number 7 times in Settings. Used for QA. Modifies only local state.") This converts the feature from "hidden" to "disclosed" and is accepted practice.
- **Apple Guideline 3.1.1 — In-App Purchase.** If any debug action resets a paywall counter, unlocks paid content, or alters subscription state on a binary that ships to consumers, this is a 3.1.1 risk independent of 2.3.1. Keep paywall-bypass actions in QA-only builds.
- **Google Play.** No direct equivalent of 2.3.1 — Play is more permissive. The risk is Play Protect flagging the app if debug code touches `WRITE_SECURE_SETTINGS` or similar (not relevant to a JS-only RN debug screen).
- **GDPR / PII.** Birth date + birth location is biographical PII under GDPR. A debug "dump current question" action that displays raw birth data on screen is fine for QA but MUST NOT log to a remote sink (Sentry breadcrumbs, analytics).

## 6. Recent Breaking Changes (last 12 months)

- **React Native 0.76+ / Expo SDK 52+:** React Native DevTools replaced Chrome DevTools. The standard shake-to-open dev menu still works in dev clients; it is and always has been stripped from release builds. No change to release-build behavior. ([Expo debugging tools](https://docs.expo.dev/debugging/tools/))
- **Expo SDK 55 (current):** `__DEV__` semantics unchanged — `false` in any non-development build profile, code branches gated on it are dead-code-eliminated by Metro. ([Expo dev mode docs](https://docs.expo.dev/workflow/development-mode/))
- **App Store guidelines 2025 update:** Apple added AI-assisted review pass. Hidden-feature detection is now stricter in practice. Disclose proactively. ([2025 review guideline analysis](https://nextnative.dev/blog/app-store-review-guidelines))

## 7. Design Constraints for the Plan (non-negotiable)

The plan author must satisfy ALL of the following or document why an exception is acceptable:

1. **Trigger:** 7 taps on the app version string in Settings/About screen, within a 3-second rolling window. Counter resets if 3s elapses without a tap.
2. **Feedback:** silent for taps 1–3; subtle haptic (`Haptics.selectionAsync`) for taps 4–6; a confirmation haptic (`Haptics.notificationAsync(Success)`) + a neutral emoji-only toast (no text "debug mode") on tap 7.
3. **Gating layers (defense in depth):**
   - Layer A: build-time — `EXPO_PUBLIC_QA_BUILD === '1'` OR `__DEV__ === true` enables ALL debug actions.
   - Layer B: production release — only **safe** actions are exposed (onboarding reset, language toggle test, force a refetch). Paywall-counter reset and API-mock actions are **stripped entirely** from prod bundle via a build-time conditional import.
   - Layer C: unlock flag is **in-memory only in prod**, AsyncStorage-persistent in QA builds.
4. **String hygiene:** no string in the JS bundle that says "debug", "developer", "QA", or "internal" in any user-facing path. The screen title can be a glyph or a neutral label like "Diagnostics".
5. **PII / secret hygiene:** any "show last API response" action MUST redact `Authorization`, `X-Api-Key`, and any header matching `/auth|token|key/i`. Birth data may be shown but MUST NOT be logged to remote sinks while debug mode is active.
6. **App Store Connect:** "Notes for Review" on first submission discloses the diagnostics screen and its trigger. This is one sentence; it converts a 2.3.1 risk to a documented feature.
7. **Exit affordance:** the debug screen has a "Disable diagnostics" button that flips the flag back off.
8. **Accessibility tree:** the version-tap Pressable has NO `accessibilityLabel` describing it as a debug trigger. The Pressable wrapping the version number can be `accessibilityRole="text"` so screen readers treat it as a static label.

### Recommended MVP debug action set (3–5 actions)

For this horary app specifically, the high-value QA actions are:

1. **Reset monthly question counter** — directly serves the original ask. (QA build only; strip from prod.)
2. **Reset onboarding** — clears the "has-seen-onboarding" AsyncStorage flag and navigates to onboarding. Useful in both QA and prod builds.
3. **Force update screen trigger** — opens the force-update modal so QA can verify it renders. (QA build only; in prod a curious user could lock themselves out.)
4. **Location override** — sets a fixed test coord pair (e.g. Greenwich 51.4779, 0.0015) for chart generation, bypassing the live `useLocation` hook. (QA only.)
5. **Clear all local data** — wipes AsyncStorage + SecureStore + journal Zustand store. Both builds (acts as an in-app "factory reset"; this is actually user-friendly and could be a real Settings feature).

Skip for MVP: API response mocking (heavy implementation, low ROI for current feature surface), crash reporter dump (Sentry already covers this in QA), network log viewer (PII risk, see trap #4).

## 8. Open Questions for the Human

1. **Will any TestFlight/internal-track build differ from the App Store binary?** If yes, define the `EXPO_PUBLIC_QA_BUILD` env var per EAS profile now — this is the cleanest fork point. If no (a single binary serves QA, beta, and prod), then **all** debug actions must be safe for prod and PII-clean.
2. **Does the monthly counter live locally (AsyncStorage) or server-side?** The spec implies local. If server-side is on the roadmap, the "reset counter" debug action will need a parallel server-side admin path; flag for product.
3. **Is the App Store Connect "Notes for Review" disclosure acceptable to the product owner?** Some teams prefer to keep this entirely undocumented and take the rejection risk. Decision needed before first submission.
4. **PIN/biometric gate on debug screen — yes or no?** Adds ~2 hours of work and a tiny UX wart for the developer, but materially reduces the consequence of an accidental discovery. Recommended for App Store binary; can be skipped for QA-only build.

## 9. Knowledge Base Updates

Created new file: `docs/superpowers/expert/_knowledge-base/mobile-debug-mode.md` with the trigger pattern matrix, gating layer table, action-safety classification, and Apple 2.3.1 disclosure language.
