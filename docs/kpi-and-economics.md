---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [competitor-research-planning-phase, astrology-api-docs, CLAUDE.md, project-brief.md]
reviewed_by: owner-pending
---

# KPI and Economics — Horary Astrology Mobile App

---

## Monetization Model

### Model: Freemium

| Tier | Details |
|---|---|
| Free | 5 questions per calendar month, full feature access, local journal |
| Paid (Phase 2) | $4.99/month — unlimited questions, no restrictions |

### IAP Implementation Status: DEFERRED

**No IAP in MVP (Phase 1).** Rationale:

- App Store and Play Store submission requires IAP review; adding IAP adds review complexity and potential rejection risk for the initial launch.
- MVP goal is to validate retention and engagement metrics before investing in payment infrastructure.
- The free tier (5 questions/month) is sufficient for MVP user testing and early user acquisition.

**MVP behavior** (local only):
- Question counter stored in `AsyncStorage` under the key `horary_question_count` + `horary_question_reset_date`.
- Counter resets on the 1st of each calendar month (checked on app open).
- At 5/5 questions: display a non-blocking "You've used your 5 free questions this month" message. No paywall, no payment prompt, no app lockout.
- No RevenueCat SDK, no StoreKit, no Google Play Billing in MVP build.

**Phase 2 IAP plan**:
- Library: `react-native-purchases` (RevenueCat)
- Products: `horary_unlimited_monthly` ($4.99/month)
- Platforms: App Store (StoreKit 2), Google Play Billing v5
- Estimated implementation time: 2 weeks (2 sprints)

---

## Unit Economics

### API Cost Model

| Variable | Value |
|---|---|
| API provider | astrology-api.io |
| Credits per request | 10 credits |
| Estimated cost per question | $0.05–$0.10 |
| Free tier (testing) | Covered by provider free allocation |
| Cost model basis | Per-request; no monthly minimum in early tiers |

### Break-Even Analysis

Assumption: average free user asks 3.2 questions/month.

| User Type | Count | Questions/Month | API Cost/Month |
|---|---|---|---|
| Free user | 500 | 3.2 avg | $0.16–$0.32/user |
| Paying user | 50 | 8.0 avg (unlimited) | $0.40–$0.80/user |

| Scenario | Monthly API Cost | Monthly Revenue | Net |
|---|---|---|---|
| 500 MAU, 6% paying (30 users) | ~$110 | $149.70 | +$39.70 |
| 500 MAU, 10% paying (50 users) | ~$120 | $249.50 | +$129.50 |
| 2,000 MAU, 7% paying (140 users) | ~$410 | $698.60 | +$288.60 |

Break-even threshold: approximately 50 paying subscribers covers API costs for 500 active free users.

### Customer Lifetime Value (LTV)

| Metric | Value |
|---|---|
| Monthly subscription price | $4.99 |
| Estimated average subscriber retention | 6 months |
| LTV per paying user | $4.99 × 6 = **$29.94** |
| Estimated churn rate | ~15%/month (early stage) |

### Customer Acquisition Cost (CAC) Target

- Phase 1 (organic only): CAC = $0 (community + word-of-mouth)
- Phase 2 target: CAC < $5 (LTV/CAC ratio ≥ 5:1)

---

## Growth KPIs

### Monthly Active Users (MAU) Targets

| Milestone | Target MAU | Paying Users (est.) | Monthly Revenue |
|---|---|---|---|
| Launch (Month 0) | 0 | 0 | $0 |
| Month 1 | 100 | 5 (5%) | $24.95 |
| Month 3 | 500 | 30 (6%) | $149.70 |
| Month 6 | 2,000 | 140 (7%) | $698.60 |
| Month 12 | 5,000 | 400 (8%) | $1,996.00 |

### Retention Targets

| Metric | Target | Rationale |
|---|---|---|
| Day 1 retention | >50% | First question should be answered within 24h of install |
| 7-day retention | >30% | User returns after their first question to ask another |
| 30-day retention | >20% | User uses the app across multiple decision points in a month |
| Monthly question frequency | >3.2 per active user | Signals repeated use as a decision tool |

### Funnel Targets

| Funnel Stage | Target |
|---|---|
| Install → first question asked | >70% |
| Question submitted → verdict displayed | >85% (question-to-verdict conversion) |
| Verdict displayed → journal save | >50% |
| Journal save → second question (D7) | >30% |

---

## Engagement KPIs

| KPI | Target | Measurement |
|---|---|---|
| Questions per active user per month | ≥3.2 avg | Total questions / MAU |
| Average session length | >2 minutes | From app open to background |
| Journal revisit rate | >40% | Users who open journal tab at least once/week |
| Feature completion rate | >85% | Questions that complete full verdict display |

---

## Quality KPIs

| KPI | Target |
|---|---|
| App Store rating (iOS) | ≥4.2 stars |
| Google Play rating (Android) | ≥4.2 stars |
| Crash-free session rate | >99.5% |
| API error rate (non-user-caused) | <5% |
| API response time (p95) | <2 seconds end-to-end |
| App launch time (cold start) | <2 seconds on mid-range device |
| Accessibility: tap targets | ≥44px minimum (Apple HIG) |

---

## Revenue Scenarios

### Conservative (organic only, 5% conversion)

| Month | MAU | Paying | MRR | Cumulative Revenue |
|---|---|---|---|---|
| 1 | 100 | 5 | $24.95 | $24.95 |
| 3 | 500 | 25 | $124.75 | ~$275 |
| 6 | 1,200 | 60 | $299.40 | ~$1,100 |
| 12 | 2,500 | 125 | $623.75 | ~$5,000 |

### Base Case (community-driven, 7% conversion)

| Month | MAU | Paying | MRR | Cumulative Revenue |
|---|---|---|---|---|
| 1 | 100 | 7 | $34.93 | $34.93 |
| 3 | 500 | 35 | $174.65 | ~$385 |
| 6 | 2,000 | 140 | $698.60 | ~$2,800 |
| 12 | 5,000 | 350 | $1,746.50 | ~$12,000 |

### Optimistic (influencer/viral lift, 10% conversion)

| Month | MAU | Paying | MRR | Cumulative Revenue |
|---|---|---|---|---|
| 3 | 1,000 | 100 | $499.00 | ~$900 |
| 6 | 5,000 | 500 | $2,495.00 | ~$7,500 |
| 12 | 15,000 | 1,500 | $7,485.00 | ~$42,000 |

---

## Cost Structure (Phase 1 MVP)

| Cost Item | Estimated Monthly Cost | Notes |
|---|---|---|
| API (astrology-api.io) | $0–$50 | Free tier covers internal testing; scales with MAU |
| Expo EAS Build | $0–$29 | Free plan for MVP; Production plan if build frequency increases |
| Apple Developer Account | $8.25/mo ($99/yr) | Required for TestFlight + App Store |
| Google Play Console | $0.21/mo ($25 one-time) | One-time registration fee amortized |
| Domain / landing page | $0–$10 | Optional; social links may suffice at MVP stage |
| **Total Phase 1** | **~$20–$100/mo** | Before meaningful revenue |

---

## Economic Risk Factors

| Risk | Impact | Mitigation |
|---|---|---|
| astrology-api.io pricing increase | High | Abstract API layer; research alternative providers (Astrology API, AstroSeek API) |
| Low free-to-paid conversion (<3%) | Medium | A/B test question limit (3 vs. 5 free); add value props on limit screen |
| High churn post-subscription | Medium | Focus on journal engagement; push notifications in Phase 2 |
| Apple App Store rejection | High | Review guidelines compliance; use "astrology" not "fortune-telling" framing |
| API latency >2s causing abandonment | Medium | Cache last verdict; optimistic UI; skeleton screens during load |
