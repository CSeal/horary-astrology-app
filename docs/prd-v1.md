---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [project-brief.md, competitor-research.md, kpi-and-economics.md, horary-domain-brief.md]
reviewed_by: owner-pending
---

# Product Requirements Document v1 — Horary Astrology Mobile App

---

## 1. Overview

### Mission

Build a beautiful, beginner-friendly horary astrology mobile app with AI interpretation — the first mobile-first horary app that bridges traditional technique with modern UX. The product delivers instant, specific-question answers using classical William Lilly methodology, presented in plain language that requires no astrology knowledge to understand.

### Problem Statement

People seeking specific guidance (relationship, career, financial decisions) currently face two inadequate options:

1. **Human astrologers** — reliable but expensive ($50–$300 per reading) and slow (24h+ turnaround via apps like Lunaton).
2. **General horoscope apps** (Co-Star, The Pattern) — fast and free, but not built on real predictive technique; they cannot answer specific yes/no questions.

No mobile app exists that combines real horary technique, instant AI interpretation, and a UX that beginners can navigate without prior astrology knowledge. The best horary tools (Janus, Solar Fire, Morinus) are Windows-only or web-only. The only native mobile horary app (Horary Chart iOS) targets practitioners and has zero beginner onboarding.

### Unique Value Proposition

> "The only beautiful, instant mobile horary with AI-generated plain-language interpretation. Traditional technique (William Lilly / Regiomontanus) + modern UX."

- **Instant**: Chart cast and interpreted in under 2 seconds.
- **Accurate**: Uses William Lilly methodology via astrology-api.io (Swiss Ephemeris DE431, Regiomontanus houses).
- **Accessible**: AI-generated plain-language summary alongside technical significators.
- **Beautiful**: Dark, celestial aesthetic — premium feel at freemium price.

---

## 2. User Personas

### Persona A — The Curious Seeker (Primary ICP)

| Attribute | Detail |
|---|---|
| Age | 25–40 |
| Language | English (primary), Russian (secondary) |
| Platform | iPhone (iOS-first) |
| Astrology knowledge | None to intermediate |
| Spiritual interest | Esoteric topics, tarot, journaling, self-reflection |
| Decision-making style | Seeks external validation / perspective before major moves |

**Goals**:
- Get a fast, concrete yes/no answer to a specific question without needing to understand astrology.
- Feel confident the answer is based on real methodology, not random text generation.
- Keep a private record of past questions and outcomes to reflect on over time.

**Frustrations**:
- Human astrologer consultations cost $50–$300 and take 24+ hours — too slow and expensive for everyday decisions.
- Apps like Co-Star give generic personality insights but cannot answer "Will I get the job offer?"
- Horary tools that do exist (Horary Chart iOS) are confusing and assume practitioner knowledge.
- Concern that AI "astrology" is just random text with no real methodology behind it.

**Behaviors**:
- Uses astrology-adjacent social content (Instagram, TikTok, Reddit) regularly.
- Would ask 2–4 questions per month about relationships, career, and finances.
- Values beautiful, polished app UX — would abandon a clunky interface immediately.

---

### Persona B — The Practicing Astrologer (Secondary ICP)

| Attribute | Detail |
|---|---|
| Age | 30–55 |
| Language | English |
| Platform | iPhone or Android |
| Astrology knowledge | Advanced — reads William Lilly, practices regularly |
| Tools currently used | Janus (Windows), Solar Fire (Windows), Astro Gold (iOS) |

**Goals**:
- Cast and review horary charts quickly on a mobile device while away from their desktop setup.
- Have a reliable journal of client or personal charts organized by date.
- See technical significator details (planet, sign, house, dignity) alongside the verdict.

**Frustrations**:
- Janus and Solar Fire are Windows-only — no mobile equivalent exists for serious horary work.
- Astro Gold covers natal/transit charts but has no horary-specific question flow.
- Web-based tools (Morinus, AstroApp) have poor mobile browser experiences.
- No tool combines mobile-first UX with full William Lilly technique and a clean journal.

**Behaviors**:
- Would use the app as a field reference tool and mobile complement to desktop software.
- Cares about technical accuracy: correct house system (Regiomontanus), correct significator assignment.
- Likely to submit 5–15 questions per month across client work and personal queries.

---

## 3. User Stories

| ID | Story | Priority |
|---|---|---|
| US-01 | As a Curious Seeker, I want to type a specific question and receive an instant verdict so that I can get guidance without waiting for a human astrologer. | Must Have |
| US-02 | As a Curious Seeker, I want the app to detect my location automatically so that I don't have to look up my coordinates to cast a chart. | Must Have |
| US-03 | As a Curious Seeker, I want to see a clear YES / NO / MAYBE / UNCLEAR verdict card so that I can understand the outcome at a glance without any astrology knowledge. | Must Have |
| US-04 | As a Curious Seeker, I want to read a plain-language paragraph explaining the verdict so that I understand why the answer is what it is, even if I know nothing about planets. | Must Have |
| US-05 | As a Practicing Astrologer, I want to see which planets are acting as significators, with their sign, house, and dignity, so that I can verify the technical interpretation. | Must Have |
| US-06 | As a Curious Seeker, I want my questions and verdicts to be automatically saved to a journal so that I can look back at past readings and see how they turned out. | Must Have |
| US-07 | As a Practicing Astrologer, I want to browse my question history grouped by date so that I can track readings across multiple sessions. | Must Have |
| US-08 | As a Russian-speaking user, I want to switch the app language to Russian so that I can use the app comfortably in my native language. | Must Have |
| US-09 | As a Curious Seeker, I want to see how many free questions I have left this month so that I understand the usage limit before I hit it. | Must Have |
| US-10 | As a first-time user, I want an onboarding screen that explains what horary astrology is and asks for location permission so that I understand the app and it has what it needs to work. | Must Have |
| US-11 | As a developer or power user, I want to enter my own API key in Settings so that I can use my personal astrology-api.io account instead of the default. | Should Have |
| US-12 | As a Curious Seeker, when I reach my monthly question limit, I want to see a message explaining the limit and that unlimited access is coming soon, so that I am not confused or frustrated. | Must Have |

---

## 4. Functional Requirements

---

### FR-01: Ask a Question

**Description**: The user can type a horary question and submit it for chart casting.

**Requirements**:
- Text input field accepts 5–280 characters (soft warning at 240; hard block below 5 or above 280).
- Character count displayed dynamically (e.g., "47 / 280").
- Submit button labeled "Ask the Stars" is disabled until the 5-character minimum is met.
- Input field supports multiline entry.
- Keyboard dismiss behavior: tapping outside the input dismisses the keyboard.
- Placeholder text: "Ask a sincere, specific question..."
- Example hint text shown below input when empty (e.g., "e.g. Will I get the job offer this month?") — dismisses on first character entered.

---

### FR-02: Auto-Detect Location

**Description**: The app captures the user's geographic location to cast the horary chart.

**Requirements**:
- Request foreground location permission via `expo-location` on first question submission (or on onboarding, if granted earlier).
- On permission grant: capture latitude, longitude, IANA timezone string (via `Intl.DateTimeFormat().resolvedOptions().timeZone`), and resolve a city name for display.
- Display detected location on Home screen: "📍 [City Name], [Country]" with coordinates in smaller muted text.
- On permission denial: show a manual-entry fallback — a text field where the user can type a city name or coordinates. This is a Phase 2 implementation; for MVP, show an explanatory error state directing the user to Settings to grant permission.
- Location is re-checked on each app open (not cached indefinitely); if previously granted, silently re-acquire.
- Timezone is passed as IANA string to the API (e.g., `America/New_York`), never as a UTC offset.

---

### FR-03: Cast Horary Chart

**Description**: The app calls the astrology-api.io API to cast the horary chart and retrieve the verdict.

**Requirements**:
- On submit: immediately navigate to Loading Screen.
- API call: `POST /horary/ask` with payload: `{ question, latitude, longitude, timezone, timestamp }`.
- Timestamp is the ISO 8601 device time at the moment of API call submission (not when the user began typing).
- Loading animation displayed during the API call (minimum 1.5s display even if API responds faster, to set expectation of real computation).
- On API success: navigate to Verdict Screen with response data.
- On API error (network failure, 4xx, 5xx): navigate back to Home Screen and display an error banner (see FR error states).
- API key: read from `expo-secure-store`; fall back to environment variable `ASTROLOGY_API_KEY` if no stored key.
- Timeout: 10 seconds. If no response within 10s, treat as network error.

---

### FR-04: Display Verdict

**Description**: The Verdict Screen shows the judgment result with visual color coding and confidence level.

**Requirements**:
- Verdict badge displays one of four values: YES / NO / MAYBE / UNCLEAR.
- Color coding:
  - YES → emerald green glow / dark green badge
  - NO → crimson red glow / dark red badge
  - MAYBE → amber/gold badge
  - UNCLEAR → muted gray/blue badge with "Chart Unclear" label
- Confidence badge displays HIGH / MEDIUM / LOW from the `confidence_band` API field.
- Confidence visual: 5-dot system (HIGH = 5 filled, MEDIUM = 3, LOW = 1–2).
- UNCLEAR verdict: display "Chart Unclear" instead of a YES/NO badge; show a tooltip/info icon explaining what this means for beginners.
- The question text is displayed at the top of the Verdict Screen for context.
- Timestamp displayed at the bottom (e.g., "May 25, 2026 · 14:32").

---

### FR-05: Display Plain-Language Summary

**Description**: The Verdict Screen displays the AI-generated plain-language interpretation of the chart.

**Requirements**:
- Display the `summary` field from the API response verbatim.
- Section header: "The Planets Say:"
- Text is 2–4 sentences; font size 15–17pt; readable line height.
- If `confidence_band` is LOW, append a note: "The chart shows mixed indications — treat this answer as a general tendency, not a certainty."
- If `judgment` is UNCLEAR, replace the summary header with "What the Chart Shows:" and display the summary as an explanation rather than a verdict.
- VOC treatment note: display `voc_treatment` text below significators if the Moon is void-of-course. Include a beginner-friendly tooltip: "The Moon is void-of-course. This often means 'nothing will come of the matter' — but the chart still shows the situation as it stands."

---

### FR-06: Display Significators

**Description**: The Verdict Screen shows the key planets from the `significators` API response field.

**Requirements**:
- Display querent significator, quesited significator, and Moon (or all significators returned by the API).
- For each significator: planet symbol + name, role label (You / Your goal / The Moon), sign name, house number.
- Dignity badge if dignity is notable: "Domicile", "Exaltation", "Detriment", "Fall" (muted for neutral dignities).
- Retrograde indicator: ℞ symbol next to planet name if `retrograde: true`.
- Key aspect shown if available: "Applying trine ✓" / "Separating square" / "No aspect forming".
- Significator section is collapsible on the Verdict Screen to reduce visual complexity for beginners (collapsed by default for Primary ICP; expanded by default configurable in Phase 2 via settings).

---

### FR-07: Save to Journal

**Description**: Each completed question + verdict is automatically persisted to the local journal.

**Requirements**:
- Auto-save occurs immediately on successful verdict display (no user action required).
- Data stored: question text, judgment, confidence_band, significators (full array), voc_treatment, summary, timestamp (ISO 8601), location (city name + lat/lng).
- Storage: `AsyncStorage` under key `horary_journal`.
- Journal entries are stored as a JSON array, newest first.
- Maximum local journal size: 500 entries (oldest entries pruned when limit is exceeded).
- No cloud sync in MVP; data is device-local only.

---

### FR-08: View Journal

**Description**: The Journal tab shows the user's history of questions and verdicts.

**Requirements**:
- Entries grouped by calendar month (e.g., "MAY 2026").
- Each entry card displays: verdict icon (✦ YES / ✕ NO / ? MAYBE / ~ UNCLEAR), verdict label, date, question text (truncated to 2 lines), confidence label.
- Tapping an entry navigates to a read-only Verdict Screen showing the full saved result.
- Swipe-left-to-delete gesture on each card: shows a "Delete" action; tapping Delete shows a confirmation dialog ("Delete this reading? This cannot be undone.").
- Empty state: "No readings yet. Ask your first question to begin your journal."
- Journal is sorted newest-first within each month group.

---

### FR-09: Change Language

**Description**: The user can switch the app UI language between English and Russian.

**Requirements**:
- Language picker in Settings screen: English / Russian (Русский).
- Changing language takes effect immediately without app restart.
- All UI strings must be externalized in `src/i18n/en.ts` and `src/i18n/ru.ts` from day one — no hardcoded strings in components.
- API response text (summary, voc_treatment) is returned by the API in the language it generates; the UI wraps it as-is.
- Default language: detect device locale on first launch; if locale is Russian (`ru`), default to Russian; otherwise default to English.
- Language preference persisted in `AsyncStorage` under `horary_language`.

---

### FR-10: Question Counter

**Description**: Track monthly question usage and enforce the 5-question free tier limit.

**Requirements**:
- Counter stored in `AsyncStorage` under keys `horary_question_count` and `horary_question_reset_date`.
- On app open: check if current calendar month differs from `horary_question_reset_date`. If yes, reset counter to 0 and update reset date.
- Counter is incremented on each successful API call (after verdict is received).
- Display on Home Screen: "Questions this month: X / 5" (muted, bottom of screen).
- Display on Settings Screen: progress bar + "X / 5" count + "Resets [Month Day]" label.
- At 5/5 questions: display a non-blocking "coming soon" banner — "You've used your 5 free questions this month. Unlimited access is coming soon." Do not lock the app, do not show a paywall, do not prompt for payment.
- No RevenueCat, no StoreKit, no Google Play Billing in MVP.

---

### FR-11: API Key Management

**Description**: Users can enter a personal astrology-api.io API key, overriding the default app key.

**Requirements**:
- API Key input in Settings, under section "API KEY".
- Input displays as masked (dots) unless the user taps an edit/reveal toggle.
- On save: store key in `expo-secure-store` under key `horary_api_key`.
- On retrieval: read from SecureStore first; fall back to environment variable `ASTROLOGY_API_KEY` if no stored key; fall back to a bundled default dev key for testing.
- Source indicator below the input: "Using: personal key" / "Using: app default".
- Clear/remove key option: shown as a "Remove key" link when a personal key is stored.

---

### FR-12: Onboarding

**Description**: First-run onboarding introduces the app and requests location permission.

**Requirements**:
- Onboarding shown once on first launch (persisted flag in `AsyncStorage` under `horary_onboarding_complete`).
- Screens (can be a single scrollable or a 2–3 step flow):
  1. Welcome screen: app name, one-line description, "Ask a sincere question. The sky will answer."
  2. How it works: 3-point explanation (Ask → Cast → Verdict) using celestial icons.
  3. Location permission request: explain why location is needed ("Your exact location at the moment of asking is part of the horary chart"), followed by the system permission dialog.
  4. Optional API key prompt: "Do you have your own API key?" with Skip / Enter options.
- "Get Started" button at end of onboarding navigates to Home Screen.
- If user skips onboarding via a future deep link, mark onboarding as complete.

---

## 5. Acceptance Criteria

| FR | Acceptance Criteria | Pass/Fail |
|---|---|---|
| FR-01 | Submit button is disabled when input is empty or < 5 characters. Submitting a valid question navigates to Loading Screen. Character count updates in real time. | Binary |
| FR-02 | On a device with location permission granted, the Home Screen displays city name and coordinates within 3 seconds of app open. On a device with permission denied, an explanatory error state is shown, not a crash. | Binary |
| FR-03 | API call is made with correct payload (question, lat, lng, timezone, ISO 8601 timestamp). Loading Screen is displayed for at least 1.5 seconds. Verdict Screen is shown on success. Error banner is shown on failure. | Binary |
| FR-04 | YES verdict card is green, NO is red, MAYBE is amber, UNCLEAR is muted gray. Confidence dots match HIGH/MEDIUM/LOW. UNCLEAR displays "Chart Unclear" label, not YES/NO. | Binary |
| FR-05 | Summary text from API response is displayed verbatim. LOW confidence appends the mixed-indications note. VOC note is shown when Moon is void-of-course. | Binary |
| FR-06 | At least querent and quesited significators are shown with planet name, role, sign, and house. Retrograde symbol appears when `retrograde: true`. Dignity badge appears for Domicile, Exaltation, Detriment, Fall. | Binary |
| FR-07 | After a verdict is displayed, the journal entry is persisted to AsyncStorage. The entry is retrievable by opening the Journal tab. Journal entry contains: question, judgment, timestamp, significators, summary. | Binary |
| FR-08 | Journal entries are grouped by month. Tapping an entry shows the full verdict. Swipe-left reveals Delete. Confirming delete removes the entry. Empty state is shown when journal is empty. | Binary |
| FR-09 | Switching language in Settings immediately updates all visible UI strings without app restart. Russian strings render in Cyrillic correctly. Language preference persists after app restart. | Binary |
| FR-10 | Counter increments on each successful question. Counter resets on 1st of month. "Coming soon" banner appears at 5/5. No payment prompt, no app lockout. Settings screen shows correct progress bar. | Binary |
| FR-11 | Entering an API key in Settings stores it in SecureStore. The key is masked. Source indicator updates to "Using: personal key". API calls use the stored key. Removing the key reverts to app default. | Binary |
| FR-12 | Onboarding is shown only on first launch. Location permission dialog is triggered from the onboarding flow. "Get Started" navigates to Home. Completing onboarding sets the `horary_onboarding_complete` flag. | Binary |

---

## 6. Out of Scope (MVP)

The following features are explicitly deferred to Phase 2 or later. No code, stubs, or placeholders for these should appear in the MVP build except where noted.

| Feature | Phase | Notes |
|---|---|---|
| IAP / Subscription paywall | Phase 2 | RevenueCat + react-native-purchases. Only placeholder "coming soon" banner in MVP. |
| Restore Purchases | Phase 2 | Dependent on IAP implementation. |
| Chart wheel visualization | Phase 2 | SVG planetary wheel showing full horary chart. |
| Aspects table (detailed technical breakdown) | Phase 2 | Table of all aspects, dignities, and house positions. |
| Share result (image card export) | Phase 2 | Social sharing of verdict as image. Share button is shown as placeholder on Verdict Screen but non-functional (or hidden). |
| Push notifications / daily prompts | Phase 2 | Requires notification permission + backend scheduling. |
| Practitioner mode | Phase 3 | Full radicality details, traditional terminology, expanded significator view. |
| Offline ephemeris | Phase 3 | Swiss Ephemeris bundled locally for offline chart casting. |
| Cloud sync / user accounts | Phase 3 | Server-side journal storage and cross-device sync. |
| Community / peer review | Phase 3 | Crowdsourced verification of readings. |
| Multiple saved profiles | Phase 3 | Asking on behalf of other people. |
| Apple Watch complication | Phase 3 | Widget / watch extension. |
| Social comparison features | Phase 3 | Sharing, following, community leaderboards. |
| Manual location entry (city search) | Phase 2 | Full fallback when GPS is denied. MVP shows error state only. |
| Birth chart / natal features | Never (different product) | Out of scope entirely. |

---

## 7. Non-Functional Requirements

### Performance

| Requirement | Target |
|---|---|
| API response time (question to verdict) | < 2 seconds end-to-end (p95) |
| App cold start time | < 2 seconds on a mid-range device (iPhone 12 / Samsung Galaxy A52 equivalent) |
| Loading Screen minimum display duration | 1.5 seconds (even if API responds faster) |
| Journal list render time | < 500ms for up to 100 entries |
| Language switch latency | < 200ms (immediate apparent update) |

### Reliability and Error Handling

| Scenario | Required Behavior |
|---|---|
| No internet connection | Show inline error banner: "No internet connection. Please check your network and try again." Home Screen remains usable; no crash. |
| API returns 4xx error | Show error banner with message from API response if available; generic fallback: "Something went wrong. Please try again." |
| API returns 5xx error | Same as 4xx error handling. |
| API timeout (>10 seconds) | Treat as network error; show timeout-specific message: "The server took too long to respond. Please try again." |
| Location permission denied | Show informational message on Home Screen: "Location access is needed to cast your chart. Tap here to open Settings." No crash; question submission is blocked until location is available. |
| AsyncStorage read failure | Log error; display empty-state UI; do not crash. |
| SecureStore read failure | Fall back to env var API key; log warning; do not crash. |

### Accessibility

| Requirement | Standard |
|---|---|
| Minimum text contrast ratio | 4.5:1 (WCAG AA) |
| Minimum tap target size | 44 × 44pt (Apple HIG) |
| Dynamic Type support | Text scales with iOS system font size setting |
| Screen reader (VoiceOver / TalkBack) | All interactive elements have accessibility labels |
| Color is not the only signal | Verdict cards include text labels, not just color coding |

### Security and Data Privacy

| Requirement | Detail |
|---|---|
| API key storage | Always in `expo-secure-store` (encrypted); never logged, never included in crash reports |
| Journal data | Stored locally in `AsyncStorage`; no data leaves the device in MVP |
| Location data | Used only at time of API call; not persisted beyond the journal entry (city name + coords stored per question) |
| No analytics in MVP | No third-party analytics SDK (Mixpanel, Amplitude, Firebase) in MVP |
| No crash reporter in MVP | Sentry or equivalent deferred to Phase 2 |

---

## 8. Risks and Dependencies

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| astrology-api.io service unavailability | Medium | High | Abstract all API calls behind a `HoraryApiService` interface. Error states handle gracefully. Alternative providers (Astrology API, AstroSeek API) identified as backup. |
| astrology-api.io pricing increase | Medium | High | Service abstraction allows provider swap. Monitor credit consumption per question. |
| Expo Location permission denial by user | Medium | Medium | Location permission is explained in onboarding. Manual entry fallback planned for Phase 2. Error state does not crash app. |
| App Store rejection ("fortune-telling" category) | Low | High | Frame as "educational" and "journaling" tool. Include disclaimer: "For entertainment and reflection purposes." Use "astrology" not "fortune-telling" language in all store copy. |
| API response contains unexpected / missing fields | Medium | Medium | Defensive rendering: all optional fields guarded with null checks. Fallback text for missing summary. |
| AsyncStorage data corruption | Low | Medium | Wrap all reads in try/catch. Implement journal export/import in Phase 2. |
| API cost runaway due to bot/abuse | Low | High | Client-side question counter enforces 5/month limit for free users. Rate limiting is also enforced server-side by astrology-api.io. |
| iOS review delay | Medium | Low | Submit at least 3 weeks before desired launch date. Have TestFlight ready for stakeholder review before store submission. |

---

*Document version: 1.0*
*Stage: Stage2-PRD*
*Gate linkage: Gate 3 (PRD Approval)*
