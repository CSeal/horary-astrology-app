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
