# Gate Criteria (Semi-Strict)

## Decision Model
- Must-pass criteria: mandatory.
- Conditional-pass criteria: allowed only with:
  - owner approval,
  - action owner,
  - follow-up record.

## Gate 1
- Must-pass:
  - ICP explicitly defined.
  - Core MVP use case defined.
  - Primary KPI set defined.
- Conditional-pass:
  - secondary segment still under validation.

## Gate 2
- Must-pass:
  - API constraints documented.
  - Budget limits documented.
  - Data/security policy documented.
- Conditional-pass:
  - one non-critical integration deferred with owner approval.

## Gate 3
- Must-pass:
  - `prd-v1.md` approved by owner.
  - Functional scope and acceptance criteria defined.
- Conditional-pass:
  - optional feature details moved to backlog.

## Gate 4
- Must-pass:
  - critical UX flows approved.
  - visual direction approved.
- Conditional-pass:
  - non-critical screen polish deferred.

## Gate 5
- Must-pass:
  - architecture baseline approved.
  - API integration spec approved.
  - test strategy baseline approved.
- Conditional-pass:
  - one non-critical module sequencing note pending.

## Gate 6
- Must-pass:
  - provenance fields are present on all core artifacts.
  - no non-Claude direct edits on core artifacts.
- Conditional-pass:
  - minor metadata correction ticket opened and owned.

## Gate 7
- Must-pass:
  - each stage has valid briefing and acceptance check.
- Conditional-pass:
  - one stage has accepted temporary constraint with follow-up.

## Gate 8
- Must-pass:
  - Trigger 1 outputs available (`archaeology`, `expert`, `library-audit`).
  - Trigger 2 partition review passed.
  - Trigger 3 dispatch and reviewer loop executed.
- Conditional-pass:
  - Context7 temporary outage was handled with fallback and risk note.

---

## Gate M1 — Market Research Completeness
- Must-pass:
  - docs/aso-brief.md exists and contains >= 30 candidate keywords
  - docs/aso-brief.md contains **competitive parity gap table** (at least 10 features, with HIGH/MEDIUM/LOW priority)
  - docs/aso-brief.md contains **"What competitors do badly, we do better"** table (min 5 rows = AstraSk differentiators)
  - docs/competitor-research.md contains a new dated refresh section
  - Review sentiment section present (min 10 reviews mined)
- Conditional-pass:
  - WebSearch returned < 10 reviews (access issue) — proceed with available data, document in blockers
  - Parity gap table has < 10 features (sparse market data) — proceed, note gaps as "unknown/unverified"

## Gate M2 — Growth Spec Readiness
- Must-pass:
  - docs/viral-features-spec.md contains specs for: share card, review prompt, invite button
  - iOS SKStoreReviewRequest 3-per-year limit documented and respected in trigger spec
  - Instagram Stories fallback to generic share sheet specified
- Conditional-pass:
  - invite deep-link deferred to Phase 2 with owner approval

## Gate M3 — API Gap Audit
- Must-pass:
  - docs/api-gap-spec.md contains gap table covering all fields in HoraryAnalysisResponse
  - Each Phase 1.5 gap has exact mapper patch spec (field name + null guard)
  - Effort matrix present
- Conditional-pass:
  - /horary/aspects credit cost unknown — defer to Phase 2 with owner note

## Gate M4 — Doc Refresh Coherence
- Must-pass:
  - prd-v1.md Phase 1.5 section has binary acceptance criteria for each FR-G01 to FR-G07
  - docs/design-prompts/prototype-update-v2.md exists and references docs/html-prototype/AstraSkClaudeDesign.html as base
  - design prompt covers Phase 1.5 modifications AND Phase 2 non-monetization screens
  - design prompt includes competitor-derived screens from docs/aso-brief.md "Screenshots feature mining"
  - docs/INDEX.md updated
- Must-not:
  - monetization/IAP/subscription screens NOT included in design prompt (deferred to Phase 2 post-store)

## Gate M5 — Growth Implementation Quality
- Must-pass (inherits Gate 7 + 8):
  - expo doctor 19/19
  - tsc --noEmit clean
  - jest >= 54 baseline tests + new tests for: reviewPromptService, mapper growth fields, mapper dignity_score/domicile_ruler extraction, mapper radicality.flags show_to_client filter, RateLimitError handling
  - No new StyleSheet.create, no hardcoded hex colors, all strings via t('key')
- Must-pass (bug fixes):
  - aspect_perfections present in JournalEntry type and extracted in mapper
  - dignity_score + domicile_ruler extracted from wire response per significator
  - radicality_flags only contains entries where show_to_client===true
  - SUBJECT_ROLES includes third_party_sibling and third_party_enemy with i18n keys
  - "THE PLANETS SAY" toggle opens/closes correctly on Verdict screen
- Must-pass (growth-specific):
  - share card generates non-null image (manual smoke test on device/simulator)
  - review prompt triggers after 3rd reading in debug mode (mock mode)
  - 429 error shows specific rate-limit banner (not generic error)
  - No lint errors introduced (0 new ESLint errors)

## Gate 6b — App Store Submission Readiness
- Must-pass:
  - docs/privacy-policy.md exists and covers: data collection, retention, contact info placeholder
  - docs/apple-privacy-labels.md covers all data types collected by the app
  - docs/play-data-safety.md covers Google Play Data Safety form requirements
  - docs/reviewer-notes.md exists with: entertainment disclaimer, demo access instructions, age rating justification
  - docs/store-drafts/ contains 6 files (en, ru, de, fr, es, pt) each with title + subtitle + description + keywords
  - docs/app-icon-spec.md exists with 1024×1024 requirements
  - scripts/generate-icon.js exists and is runnable
  - scripts/build-privacy.js exists and is runnable
  - .github/workflows/deploy-privacy.yml exists
- Must-not:
  - Age rating must NOT claim app is for children under 13
- Owner actions required after Gate 6b (blockers for actual submission):
  - Insert real demo API key in reviewer-notes.md ([DEMO_API_KEY])
  - Insert contact email in privacy-policy.md ([OWNER_EMAIL])
  - Run npm run generate:icon → verify icon visually
  - Run npm run build:privacy + git push → GitHub Pages deploy
  - Insert privacy policy URL in reviewer-notes.md ([PRIVACY_POLICY_URL])

## Gate 6c — Screenshot Infrastructure
- Must-pass:
  - src/stores/debugStore.ts has screenshotMode + screenshotLocale fields
  - src/constants/screenshotMockData.ts exists with visually impressive mock data
  - scripts/capture-screenshots.sh exists and is executable
  - package.json has "screenshots" script
  - docs/screenshots-guide.md documents upload process
- Owner action required: run npm run screenshots on iOS Simulator (iPhone 15 Pro Max)
