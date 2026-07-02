---
created_by: claude-sonnet-5
updated_by: claude-sonnet-5
source_inputs: [handoff-log.md, api-gap-spec.md, growth-features-spec.md, monetization-spec.md, kpi-and-economics.md, android-post-launch-techdebt.md, store-review-findings.md, project_status_audit_20260702 memory, 2026-07-02 domain-expert + analytics research]
reviewed_by: owner-pending
date: 2026-07-02
---

# Next Phases — Post-Launch Roadmap

Replaces the old build-phase plan (archived — see `archive/plan.md`, `archive/stage5-6-plan.md`).
The app is **live**: submitted to both stores, MVP + Phase 1.5 growth + full API coverage +
retention features (stats/streak/notifications) all shipped. Full history: `handoff-log.md`.
This doc tracks what's actually left, not what's already done — check `handoff-log.md` before
assuming anything below is unbuilt, it decays fast.

---

## Immediate (in progress as of 2026-07-02)

Live production incident — full detail in `handoff-log.md` → `Stage-Incident-APIKeyLeak`.

- [ ] Push commit `61a81f3` to `main` — activates Android force-update (`android.minVersion`
      1.0.1) via the GitHub Pages auto-deploy. Deliberately held back pending owner go-ahead
      since it's a real, live-affecting action.
- [ ] iOS 1.0.1 (build 112) is `WAITING_FOR_REVIEW` — once Apple approves, raise
      `ios.minVersion` to 1.0.1 in `docs/app-version.json` + `public/app-version.json` and push.
      Do NOT raise it before approval — there'd be no valid update to point gated users at.
- [ ] Rotate the GCP service-account key (`hora-mcp@hora-500520.iam.gserviceaccount.com`) —
      exposed in a chat transcript 2026-06-25, rotation still unconfirmed. See
      `feedback_keystore_in_git` / `project_status_audit_20260702` memory.
- [ ] Appeeky Bearer token sitting in plaintext in `.mcp.json` on the **public** GitHub repo —
      owner's call was to leave it (subscription being cancelled in ~2 weeks anyway). Revisit if
      that cancellation slips.

---

## Deferred growth items (Phase 1.5/2, speced, not built)

| Item | Spec | Why deferred |
|---|---|---|
| FR-G01 Share Verdict Card | `docs/features/share-reading-G01-deferred.md` | needs `react-native-share` + `react-native-view-shot`, MUST test on a physical iOS device (simulator no-ops the Instagram URL scheme) |
| T3-01 Friend deep-link + referral tracking | `docs/viral-features-spec.md` | Phase 2, client-side only, no backend needed |
| T3-04 Android Instagram Stories share | `docs/growth-features-spec.md` | Phase 2, separate `Platform.OS==='android'` branch in shareVerdictService |
| T3-05 Pre-prompt satisfaction gate | `docs/growth-features-spec.md` | Phase 2, custom modal before `requestReview()`, ~0.3-0.5★ rating lift per domain research |
| GAP-9 `/horary/aspects` full 15-pair coverage | `docs/api-gap-spec.md` | deliberately deferred — `aspect_perfections` from `/analyze` already covers significator aspects at zero extra credit cost |
| GAP-10 fertility routing to `/fertility-analysis` | `docs/api-gap-spec.md` | needs a dedicated fertility screen + `fertility_score` display decision (Apple 1.4.1 medical-scrutiny risk) before the routing switch is safe |

## Phase 3 — Monetization (gated, not started)

**Gate (from `docs/kpi-and-economics.md`): 30%+ D7 retention AND 85%+ question-to-verdict
conversion, sustained, before starting.** Full spec ready in `docs/monetization-spec.md` —
`react-native-purchases` (RevenueCat), `horary_unlimited_monthly` SKU, StoreKit 2 + Play Billing.
Do not start implementation before the KPI gate is confirmed met — run `/orchestrate:monetization`
when ready, it will re-verify the gate itself.

## New feature ideas — API-surface opportunities (2026-07-02 domain-expert brainstorm)

astrology-api.io has endpoint families the app has never called. Ranked by a horary-domain-expert
pass against one criterion: does this give a *practicing/learning traditional (Lilly-method)
horary astrologer* genuine analytical value, not "more data for its own sake." Full reasoning in
that session's transcript; ranked shortlist:

1. **Whole-chart dignity + sect** (`/data/positions/enhanced`) — dignity/reception/sect for ALL 7
   planets, not just significators. Sect (day/night chart, in-sect vs out-of-sect malefic) is core
   Lilly doctrine and currently entirely missing. Effort M.
2. **Moon timing & condition panel** (`/data/lunar-metrics/enhanced`) — next-aspect + hours-until +
   lunar dignities ONLY. Deliberately exclude the "traditional phase meaning" text field — that's
   generic-horoscope drift, not horary technique. Effort S-M.
3. **Perfection completeness** (`/horary/aspects` full coverage + ingresses/stations) — the app can
   currently MISS a valid translation/collection of light through a third planet since only
   significator-to-significator aspects are checked. This is a correctness fix to the judgment
   engine, not a bolt-on feature. Effort M.
4. **Topical Arabic Part** (`client.traditional.getLots`, scoped) — Part of Fortune generally, Part
   of Children specifically for pregnancy questions. Ship narrow (one context-matched Lot) or not
   at all — a Lots dump is noise per the tradition. Effort M.

**Explicitly rejected** (anti-dilution — the competitor "Lunaton" lost ground bolting on
tarot/runes; Hora's edge is depth of ONE tradition, not breadth of modalities):
- Sabian symbols — 1925 humanistic/psychological construct, not Lilly-tradition.
- Raw `fertility_score` from `/fertility-analysis` — pseudo-medical, Apple 1.4.1 risk (see GAP-10).
- Server-rendered SVG chart (`client.svg`) — an infra question, not a user-facing feature.

On-brand growth angle: VOC/next-aspect "good moment to ask" awareness nudge — technique-grounded,
not generic moon-phase content. See domain-expert notes for the full B1/B2 writeup (also covers
what telemetry must never capture given the question domain — feeds directly into the analytics
item below).

## Analytics — not started, phased plan ready

Zero analytics/telemetry SDK currently installed (verified). Phased recommendation from
2026-07-02 research (WebSearch-verified, not stale training data):

- **Phase A (today, $0, zero code):** turn on App Store Connect Analytics + Google Play Console
  Statistics/vitals — these ARE the actual ASO measurement layer, already live now that both
  apps are submitted. Also: activate the dormant Sentry crash reporter (`EXPO_PUBLIC_SENTRY_DSN`
  is unset — one env var away from working) — pair with updating both stores' privacy
  declarations in the same step (currently, correctly, say "no crash reporter").
- **Phase B (month 1-3):** add **PostHog, EU Cloud region** as the one product-analytics SDK —
  free at this app's scale, GDPR-clean by default (matters for de/fr/es/pt locales), pure-JS
  Expo integration (no forced dev-client), no iOS ATT prompt. Firebase/GA4 explicitly NOT
  recommended first (forces a dev-client, defaults pull IDFA/AD_ID unless manually disabled).
  AppMetrica explicitly rejected as primary despite RU-market fit — EU→Russia data transfer has
  no GDPR adequacy basis.
  **Sensitive-domain guardrail:** never send question text, per-user category streams, verdict+
  category pairs, or outcome-on-sensitive-category — horary questions are GDPR Art. 9
  special-category data by inference (health/love/legal/pregnancy topics). Structural events only
  (`question_created`, `verdict_viewed`, `invite_shared`). Disable screen-title autocapture.
- **Phase C (only once paid user acquisition starts):** Firebase, for native Google App Campaigns
  attribution — not worth the heavier integration before then.

## Known tech debt

| Item | Detail | Urgency |
|---|---|---|
| Android edge-to-edge | `docs/android-post-launch-techdebt.md` — resolves itself on the next Expo SDK upgrade (56/57), address at next `/sdk:upgrade` | ~1 year out (API 36 forces it) |
| npm audit — 13 moderate | all transitive within Expo SDK 55 (`uuid<11.1.1` → `@expo/cli`), not actionable at app level | low, re-check each SDK upgrade |
| Large-screen/tablet support | product decision, not a defect — app is portrait-phone-only by design | none unless scope changes |
| UI audit remainder | `docs/orchestration/store-review-findings.md` "Remaining" table — chip-row edge fade, chart stellium glyph crowding, "Key factors" duplicate header, FR/PT/UK native-speaker translation review | 🟡/🟢, cosmetic |
| Perf/haptics real-device pass | store-review-findings.md flagged release-build FPS, haptic feel, and soft-keyboard behavior as simulator-unverifiable | before next major UI change |

---

## Process notes

- See `docs/orchestration/incident-runbook.md` for the "found a critical bug in a live build"
  pattern — written after living through the API-key-leak incident above.
- `docs/orchestration/command-contracts.md` still accurately documents what each `/orchestrate:*`
  command does; most Stage 1-6 build commands won't be re-invoked for *this* app (already built)
  but `/orchestrate:market-research`, `/deps:audit`, and `/sdk:upgrade` remain live, repeatable
  tools going forward.
