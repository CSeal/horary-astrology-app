---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [prd-v1.md, api-integration-spec.md, src/stores/settingsStore.ts, src/stores/questionsStore.ts, privacy-policy.md]
reviewed_by: owner-pending
---

# Apple App Privacy Labels — Hora: Horary Chart

**Bundle ID:** com.hora.app
**Date prepared:** 2026-06-04
**Reference:** App Store Connect → App Privacy section
**Apple documentation:** https://developer.apple.com/app-store/app-privacy-details/

---

## Overview

Hora collects and sends a minimal set of data. All journal data and preferences remain on-device. The only third-party data transmission occurs per chart request to astrology-api.io: question text, location, and timezone.

---

## App Store Connect: "Does your app collect data from this app?"

**Answer: YES**

Even though no backend of our own exists, data is sent to a third-party API (astrology-api.io) per request. This qualifies as data collection under Apple's guidelines.

---

## Data Types Collected

### 1. Location

**Subcategory:** Precise Location

| Field | Value |
|---|---|
| Data type | Precise Location |
| Why collected | App Functionality |
| Linked to user identity | No |
| Used for tracking | No |

**Notes for App Store Connect form:**
- Select "Precise Location" (latitude/longitude from device GPS is sent to astrology-api.io)
- Purpose: "App Functionality" — location is required to calculate the horary chart. Horary astrology requires geographic coordinates of the querent at the exact moment of asking.
- Do NOT select "Linked to Identity" — no user account exists; location is not linked to any persistent identifier
- Do NOT select "Used for Tracking" — location is never used to track users across apps or websites

---

### 2. User Content

**Subcategory:** Other User Content (question text)

| Field | Value |
|---|---|
| Data type | Other User Content |
| Why collected | App Functionality |
| Linked to user identity | No |
| Used for tracking | No |

**Notes for App Store Connect form:**
- Question text is user-generated content entered by the user
- It is sent to astrology-api.io for chart interpretation
- It is also saved locally on-device in the user's journal
- Not linked to any user identity (no account system)
- Not used for tracking

---

### 3. Other Data

**Subcategory:** Other Data (question text + location + timezone sent to third party per request)

Apple's guidance: when data is sent to a third-party SDK or service, it must be disclosed even if the app itself does not retain it.

| Field | Value |
|---|---|
| Data type | Other Data |
| Why collected | App Functionality |
| Linked to user identity | No |
| Used for tracking | No |

**Notes for App Store Connect form:**
- This covers timezone (IANA string) sent to astrology-api.io per request
- Timezone is not personally identifying on its own but is part of the chart calculation payload
- Not linked to identity, not used for tracking

---

## Data Types NOT Collected

The following standard Apple privacy categories DO NOT apply to Hora:

| Category | Not collected | Reason |
|---|---|---|
| Contact Info | Not collected | No user registration, no email/phone |
| Health & Fitness | Not collected | No health data access |
| Financial Info | Not collected | No payment processing in MVP |
| Browsing History | Not collected | No in-app browser or web tracking |
| Search History | Not collected | No search-based data collection |
| Identifiers (Device ID, Ad ID) | Not collected | No analytics SDK, no ad network |
| Usage Data (crash logs, performance) | Not collected | No crash reporter in MVP |
| Diagnostics | Not collected | No analytics |
| Contacts | Not collected | No contact list access |
| Purchases | Not collected | No in-app purchases in MVP |
| Sensitive Info | Not collected | No biometrics, no health, no political/religious data |
| Emails or Messages | Not collected | No email/message access |

---

## Privacy Nutrition Label Summary

When filling the App Store Connect form, the completed label will read:

**Data Used to Track You:** None

**Data Linked to You:** None

**Data Not Linked to You:**
- Location (Precise Location — App Functionality)
- User Content (Other User Content — App Functionality)
- Other Data (App Functionality)

---

## Reviewer Narrative (for App Review submission notes)

"Hora does not collect any data linked to user identity. The app has no user accounts, no analytics SDK, and no advertising network. Per-request data (question text, device location, timezone) is sent via HTTPS to astrology-api.io solely to calculate the horary chart. This data is not retained by us on any server. All journal entries and preferences are stored locally on the user's device. Uninstalling the app removes all local data. The app's API key (user-supplied) is stored in iOS Keychain via Expo SecureStore and never transmitted to any party other than astrology-api.io."

---

## Notes on Pregnancy / Fertility Category

Hora supports questions in the "pregnancy" and "fertility" horary categories. These are routed to the same `/api/v3/horary/analyze` endpoint as all other questions. The app does NOT:
- Access any HealthKit data
- Request any health-related permissions
- Store or process medical records

These categories are supported as traditional horary astrology question types, equivalent to a lunar calendar app's pregnancy tracking feature. No health data label is required.

---

*Prepared for App Store Connect submission — Hora v1.0.0*
*Date: 2026-06-04*
