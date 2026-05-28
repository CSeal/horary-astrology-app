# Mobile Debug Mode Knowledge Base

Maintained by Compound V Phase 1B advisor. Append at the bottom on each pass.

---

## Updated 2026-05-27 — Hidden Debug Mode for RN/Expo

### Trigger pattern matrix

| Pattern | Taps/actions | Discoverability | Convention | Recommended? |
|---|---|---|---|---|
| Tap app version 7× in About | 7 | Very low | Android Build Number standard since ~2012 | **Yes — default** |
| Tap title 5× | 5 | Low–medium | iOS Settings.app uses 5 taps on "About" header in some internal builds | Acceptable if you want fewer taps |
| Long-press logo 3s | 1 long action | Medium (could trigger by accident if logo is a button elsewhere) | Some games (Monument Valley credits) | Avoid for production apps |
| Konami code / shape gesture | Multi-step | Very low | Easter eggs, not QA tools | Avoid — hard for devs to remember |
| Shake gesture | 1 | High (anyone can discover) | RN DevMenu in dev builds | Avoid in release builds — Expo strips it anyway |
| URL scheme `app://debug` | Type URL | Low if scheme is non-obvious | Used by Slack, Discord internal builds | Good for QA, requires deep-link config |
| 3-finger long-press | 1 gesture | Low–medium | Expo dev menu alternative | Avoid in prod — same string as RN dev menu |

**Default recommendation:** 7 taps on version label in Settings/About, 3-second tap-window timeout, haptic feedback escalating from selection → success on tap 7.

Source: [Hossain Khan — Android Build Number deep dive](https://hossainkhan.medium.com/how-to-be-an-android-developer-with-just-7-taps-deep-dive-8abebfc07061), [Android developer.android.com — dev options](https://developer.android.com/studio/debug/dev-options).

### Gating layer table

| Layer | Mechanism | Stripped in prod bundle? | Use for |
|---|---|---|---|
| A | `__DEV__` boolean | Yes — Metro dead-code-elimination | Local dev only |
| B | Build-time env var `EXPO_PUBLIC_QA_BUILD` | No — string literal compares; tree-shake conditional imports manually | TestFlight / internal Play track binaries |
| C | Runtime in-memory flag set by tap counter | No (the gate code ships) | Final gate inside the debug screen itself |
| D | AsyncStorage persistence of unlock state | No | QA builds only — NEVER in App Store binary |
| E | PIN / biometric gate | No | Recommended for any prod-shipped debug entrypoint |

Defense-in-depth: a feature in the App Store binary should require layers B + C + E. A QA-only feature can rely on B + C and may persist via D.

Source: [Expo dev/prod mode docs](https://docs.expo.dev/workflow/development-mode/), [Expo feature flags guide](https://docs.expo.dev/guides/using-feature-flags/).

### Debug action safety classification

| Action | Safe for App Store binary? | Rationale |
|---|---|---|
| Reset onboarding (clear "seen" flag) | Yes | Local state, user-facing equivalent could exist as a real feature |
| Clear all local data / "factory reset" | Yes | Could be a real Settings feature |
| Toggle language | Yes | Reachable through normal Settings anyway |
| Force a refetch / clear cache | Yes | Equivalent to pull-to-refresh |
| Show app version + build metadata | Yes | Often already visible |
| **Reset paywall / monthly counter** | **No — QA only** | Apple 3.1.1 risk; bypasses purchase entry |
| Trigger force-update modal | **No — QA only** | User can lock themselves out |
| Location override to fixed coords | **No — QA only** | Falsifies geo data, possible privacy concern |
| API response mocking | **No — QA only** | Could be used to spoof verification flows |
| Network log dump (raw req/resp) | **No — never** without redaction | Leaks API keys and PII; redact auth headers and PII first |
| Crash trigger button | **No — QA only** | User-hostile if accidentally tapped |

Source: [Halcyon Mobile — debug menu contents](https://halcyonmobile.com/blog/mobile-app-development/android-app-development/what-could-a-debug-menu-contain/), [Build38 — debug security risks](https://build38.com/blog/threats-mobile-app-device/debugging-potential-security-risk/).

### Apple Guideline 2.3.1 — disclosure language template

Submit in App Store Connect "Notes for Review" on the FIRST submission that includes the debug screen:

> The app includes an internal diagnostics screen used by our QA team. It is accessed by tapping the app version number on the Settings screen seven times in rapid succession. The screen only modifies local device state (resets onboarding, clears local cache) and contains no remote-activation logic. We are happy to demonstrate it on request.

This converts the feature from "hidden, dormant, or undocumented" (Apple's 2.3.1 forbidden states) to "documented to App Review" and is accepted practice. Re-submit the note if the action set changes meaningfully.

Source: [Apple Review Guidelines § 2.3.1](https://developer.apple.com/app-store/review/guidelines/), [Apple Developer Forums thread 657780](https://developer.apple.com/forums/thread/657780).

### PII / secret leak checklist for any debug surface

Before any debug action renders to screen or logs to console:

- [ ] No `Authorization` header in displayed request data
- [ ] No `X-Api-Key`, `X-Auth-Token`, or any `*-key`/`*-token` header in displayed data
- [ ] Birth date, birth time, birth location shown only on local screen, never sent to Sentry breadcrumb / analytics / remote logger while debug mode is active
- [ ] No "debug", "developer", "QA", "internal", "staging" strings in any user-facing copy in the bundle (grep before release)
- [ ] Pressable that triggers tap counter has no `accessibilityLabel` describing it
- [ ] Debug screen has explicit "Disable" button — user can always recover

Source: [Build38 — debug as attack surface](https://build38.com/blog/threats-mobile-app-device/debugging-potential-security-risk/), [Medium — Secure Debug/Developer Mode](https://medium.com/@meytataliti/secure-debug-developer-mode-bf75d15c0d0a).
