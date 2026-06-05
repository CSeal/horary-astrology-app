---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [prd-v1.md, api-integration-spec.md, src/stores/settingsStore.ts, src/stores/questionsStore.ts, privacy-policy.md]
reviewed_by: owner-pending
---

# Google Play Data Safety — Hora: Horary Chart

**Package:** com.hora.app
**Date prepared:** 2026-06-04
**Reference:** Google Play Console → App content → Data safety
**Google documentation:** https://support.google.com/googleplay/android-developer/answer/10787469

---

## Overview

This document provides the guidance needed to complete the Google Play Console Data Safety form for Hora. Complete one section at a time in Play Console, following the answers below.

---

## Section 1: Data Collection and Security

### Does your app collect or share any of the required user data types?

**Answer: YES**

Rationale: The app sends location, timezone, and question text to astrology-api.io per chart request. Even though no Hora-owned backend exists, sending data to a third-party API qualifies as data collection/sharing under Google's definition.

---

### Is all of the user data collected by your app encrypted in transit?

**Answer: YES**

All communication with astrology-api.io uses HTTPS (TLS). No plain-text HTTP is used anywhere in the app.

---

### Do you provide a way for users to request that their data is deleted?

**Answer: YES**

Users can:
1. Delete individual journal entries (swipe left in the Journal tab)
2. Clear all journal entries via Developer Mode (Settings → tap version label 7 times → enter PIN)
3. Uninstall the app — this removes all locally stored data and the SecureStore API key (iOS Keychain / Android Keystore)

Since we have no server-side data store, there is no account deletion flow required.

---

## Section 2: Data Types

### Location

| Field | Value |
|---|---|
| Data type | Approximate location AND Precise location |
| Collected | Yes |
| Shared | Yes — with astrology-api.io |
| Processed ephemerally | Yes — not retained on our servers |
| Required or optional | Required for core functionality |
| Purpose | App functionality (horary chart calculation requires precise geographic coordinates) |

**Notes:**
- Select both "Approximate location" and "Precise location" to cover all cases (GPS vs. network-based location)
- Mark as "Shared" with a third party (astrology-api.io)
- Mark "Processed ephemerally" — location is sent per-request and not stored on Hora servers
- Purpose: "App functionality" only — never for advertising or analytics

---

### App Activity

| Field | Value |
|---|---|
| Data type | Other actions (question submission events) |
| Collected | No — not sent to our servers |
| Stored on-device | Yes (journal entries in AsyncStorage) |
| Shared | No |

**Notes:**
- Question text is stored locally on-device only, not on any Hora-owned server
- Journal entries (question, verdict, timestamp, location city) are device-local only
- This section refers to on-device storage, not server-side collection — select "Not collected" from Play Console's perspective (we have no server receiving this data persistently)

---

### Personal info

| Data type | Collected | Notes |
|---|---|---|
| Name | No | No user registration |
| Email address | No | No user accounts |
| User IDs | No | No authentication |
| Address | No | |
| Phone number | No | |
| Race and ethnicity | No | |
| Political or religious beliefs | No | |
| Sexual orientation | No | |
| Other personal info | No | |

---

### Financial info

Not collected. No in-app purchases in MVP.

---

### Health and fitness

Not collected. The app supports horary astrology questions in "pregnancy" and "fertility" categories as traditional question types, but does NOT access HealthKit, Google Fit, or any health permissions.

---

### Messages

Not collected.

---

### Photos and videos

Not collected.

---

### Audio files

Not collected.

---

### Files and docs

Not collected.

---

### Calendar

Not collected.

---

### Contacts

Not collected.

---

### App info and performance (crashes, diagnostics)

Not collected. No crash reporter in MVP.

---

### Device or other IDs

Not collected. No device identifier, advertising ID, or IDFV is accessed.

---

## Section 3: Data Sharing Details

### Third-party libraries / SDKs

The following libraries are included in the build. Review each for their own data safety declarations:

| Library | Purpose | Data Safety |
|---|---|---|
| expo-location | Location permission + GPS coordinates | Location access — see Expo location SDK docs |
| expo-secure-store | Encrypted API key storage (Keystore) | No data transmitted |
| @react-native-async-storage/async-storage | Local journal + preferences | No data transmitted |
| expo-store-review | Native review prompt | Calls Google Play In-App Review API — no data collected by us |
| react-native-gesture-handler | Swipe gestures | No data |
| @gorhom/bottom-sheet | Location picker UI | No data |
| @tanstack/react-query | API request caching | In-memory only, no persistence |
| axios | HTTP client | Used for astrology-api.io requests only |

**No analytics SDK, no advertising SDK, no crash reporter is included in this build.**

---

## Section 4: Play Console Form — Summary Answers

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | Yes |
| Is all of the user data collected by your app encrypted in transit? | Yes |
| Do you provide a way for users to request that their data is deleted? | Yes |
| Location — Approximate location — Collected | Yes |
| Location — Precise location — Collected | Yes |
| Location — Shared with third parties | Yes (astrology-api.io, for chart calculation) |
| Location — Processed ephemerally | Yes |
| Location — Required for core functionality | Yes |
| Location — Purpose | App functionality |
| All other data categories | Not collected |

---

## Privacy Policy URL

The app's privacy policy must be linked in Play Console.

URL: `https://[OWNER_GITHUB_USERNAME].github.io/horary-astrology-v1-app/privacy-policy.html`

(Replace with actual URL after GitHub Pages deployment — see scripts/build-privacy.js)

Placeholder: **[PRIVACY_POLICY_URL]**

---

*Prepared for Google Play Console Data Safety form submission — Hora v1.0.0*
*Date: 2026-06-04*
