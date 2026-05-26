---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [competitor-research-planning-phase, astrology-api-docs, CLAUDE.md]
reviewed_by: owner-pending
---

# Project Brief — Horary Astrology Mobile App

## Mission

Build a beautiful, beginner-friendly horary astrology mobile app with AI interpretation — the first mobile-first horary app that bridges traditional technique with modern UX. The product delivers instant, specific-question answers using classical William Lilly methodology, presented in plain language that requires no astrology knowledge to understand.

---

## Problem Statement

People seeking specific guidance (relationship, career, financial decisions) currently have two options:

1. **Human astrologers** — reliable but expensive ($50–$300 per reading) and slow (24h+ turnaround via apps like Lunaton).
2. **General horoscope apps** (Co-Star, The Pattern) — fast and free, but not built on real predictive technique; they cannot answer specific yes/no questions.

No mobile app exists that combines real horary technique, instant AI interpretation, and a UX that beginners can navigate without prior astrology knowledge.

---

## Unique Value Proposition

> "The only beautiful, instant mobile horary with AI-generated plain-language interpretation. Traditional technique (William Lilly / Regiomontanus) + modern UX."

- **Instant**: Chart cast and interpreted in under 2 seconds.
- **Accurate**: Uses William Lilly methodology via astrology-api.io (Swiss Ephemeris DE431, Regiomontanus houses).
- **Accessible**: AI-generated plain-language summary alongside technical significators.
- **Beautiful**: Dark, celestial aesthetic — premium feel at freemium price.

---

## Ideal Customer Profile (ICP)

### Primary ICP

| Dimension | Description |
|---|---|
| Age | 25–40 |
| Languages | English (primary), Russian (secondary) |
| Platform | iOS-first, Android parity |
| Interests | Esoteric/spiritual topics, self-reflection, decision-making tools |
| Astrology knowledge | None to intermediate; curious but not a practitioner |
| Use case | Fast, specific-question answer — NOT a full horoscope reading |
| Pain point | Human consultations are too slow and too expensive; general apps don't answer specific questions |
| Channels | Instagram/TikTok astrology communities, Reddit r/astrology, word-of-mouth |

### Secondary ICP

| Dimension | Description |
|---|---|
| Profile | Practicing astrologers wanting a mobile-first professional horary tool |
| Age | 30–55 |
| Use case | Quick mobile reference; field chart casting; journal tracking across sessions |
| Pain point | Best horary tools (Janus, Solar Fire) are Windows-desktop only; no professional mobile option exists |

---

## Core Use Case (MVP)

```
User asks a sincere, specific question
  → App captures location + timestamp
  → API casts horary chart (astrology-api.io POST /horary/ask)
  → API returns judgment (YES / NO / MAYBE / UNCLEAR) + confidence + significators + summary
  → App displays verdict with plain-language AI interpretation
  → User saves question + verdict to personal journal
```

This single loop — **ask → verdict → save** — is the entire MVP. All other features are Phase 2.

---

## Product Scope

### In Scope (MVP — Phase 1)

- Question input screen with character-limit guidance
- Automatic location detection (GPS) with manual override
- Horary chart API call (astrology-api.io)
- Verdict display: judgment badge (YES/NO/MAYBE/UNCLEAR), confidence band, significator list, plain-language summary
- Local question journal (AsyncStorage, no server)
- English and Russian UI strings
- Dark celestial visual design

### Explicitly Out of Scope (Phase 2+)

- Subscription / IAP paywall (RevenueCat, react-native-purchases)
- Server-side user accounts or cloud sync
- Push notifications / reminders
- Social sharing
- Astrologer marketplace
- Birth chart or transit features
- Apple Watch / widget extensions

---

## Platform and Technical Constraints

| Constraint | Detail |
|---|---|
| Framework | Expo Managed Workflow (latest SDK) |
| Platforms | iOS 16+ and Android 13+ |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind (Tailwind for React Native) |
| State | Zustand + TanStack Query |
| Language | TypeScript (strict) |
| API | astrology-api.io REST; POST /horary/ask |
| Local storage | AsyncStorage (journal), expo-secure-store (API key) |
| Localization | expo-localization + i18n-js; English default, Russian second |
| No IAP in MVP | Local question counter only (AsyncStorage); no RevenueCat until Phase 2 |

---

## API Summary

**Endpoint**: `POST /horary/ask`

**Input fields**:
- `question` (string) — the question text
- `latitude` / `longitude` (float) — querent location
- `timezone` (IANA string, e.g. `America/New_York`)
- `timestamp` (ISO 8601, optional — defaults to server time)

**Output fields**:
- `classification` — question category
- `judgment` — `YES` | `NO` | `MAYBE` | `UNCLEAR`
- `confidence_band` — `HIGH` | `MEDIUM` | `LOW`
- `significators` — array of `{ planet, role, sign, house, dignity }`
- `voc_treatment` — void-of-course Moon note
- `summary` — plain-language paragraph

**Cost**: 10 credits per request (~$0.05–$0.10 at astrology-api.io pricing). Free tier covers early testing and internal MVP review.

---

## Primary KPIs

| KPI | Target |
|---|---|
| Monthly Active Users (MAU) | 500 within 3 months of launch |
| 7-day retention | >30% |
| App Store / Play Store rating | ≥4.2 stars |
| Question-to-verdict conversion | >85% (question submitted → verdict displayed without error) |
| API error rate | <5% |
| Crash-free rate | >99.5% |

---

## Budget Constraints

- API cost: ~$0.05–$0.10 per question (10 credits at astrology-api.io)
- Free tier adequate for MVP internal testing
- Break-even monetization threshold: ~50 paying subscribers covers API costs for ~500 active free users
- No paid marketing budget in Phase 1; organic / community-driven growth

---

## Localization Policy

- **Default language**: English
- **Second language**: Russian
- All UI strings must be externalized from day 1 (no hardcoded English in components)
- Translation files: `src/i18n/en.ts` (English), `src/i18n/ru.ts` (Russian)
- Russian strings may contain Cyrillic characters; all other artifact content is in English

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| astrology-api.io changes pricing or goes offline | Medium | High | Abstract API calls behind a service layer; design for provider swap |
| App Store rejection for "fortune-telling" category | Low | High | Frame as educational/journaling tool; include disclaimers |
| Low organic discovery | Medium | Medium | Target astrology Reddit/Discord communities for beta |
| IAP required earlier than Phase 2 | Low | Medium | RevenueCat integration is pre-planned; 2-week implementation estimate |
| Location permission denial | Medium | Low | Manual location entry fallback built into MVP |

---

## Provenance

- Gate 1 criteria addressed: ICP defined, core MVP use case defined, primary KPI set defined.
- Gate 2 criteria addressed: API constraints documented, budget limits documented, data/security policy stub present (secrets section in CLAUDE.md to be completed before coding).
