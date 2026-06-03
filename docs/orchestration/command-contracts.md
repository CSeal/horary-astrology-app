# Orchestrate Command Contracts (Core Schema)

## `/orchestrate:start`
- Required inputs: `mission`, `constraints`, `existing_docs`
- Expected outputs: initialized run context, selected first stage, initial blockers list
- Gate linkage: pre-Gate 1
- Fallback: manual orchestrator prompt + `/v:archaeology <topic>` when pre-flight context is incomplete

## `/orchestrate:research`
- Required inputs: discovery questions, market scope, competitor scope
- Expected outputs: `project-brief.md`, `competitor-research.md`, `kpi-and-economics.md`
- Gate linkage: Gate 1, Gate 2
- Fallback: run Trigger 1 manually and rerun research stage

## `/orchestrate:prd`
- Required inputs: research artifacts, MVP assumptions, KPI targets
- Expected outputs: `prd-v1.md`, `mvp-scope.md`, roadmap updates
- Gate linkage: Gate 3
- Fallback: rerun product stage with owner-approved scope constraints

## `/orchestrate:design`
- Required inputs: approved PRD, product constraints, visual references
- Expected outputs: `ux-flows.md`, `design-system-brief.md`, HTML prototype artifact
- Gate linkage: Gate 4
- Fallback: rerun design with reduced scope (core flow only)

## `/orchestrate:architecture`
- Required inputs: approved UX flows, API constraints, implementation boundaries
- Expected outputs: `technical-architecture.md`, `api-integration-spec.md`, `quality-gates.md`
- Gate linkage: Gate 5, Gate 6
- Fallback: rerun architecture with strict disjoint module boundaries

## `/orchestrate:implement`
- Required inputs: approved architecture, partition map, sprint task packs
- Expected outputs: implementation progress report, updated technical artifacts, issue list
- Gate linkage: Gate 7, Gate 8
- Fallback: `/v:dispatch <plan-path>` with narrowed batch

## `/orchestrate:qa`
- Required inputs: implementation outputs, critical flow definition, quality thresholds
- Expected outputs: QA summary, P0/P1 defects list, demo readiness report
- Gate linkage: final Gate 7/8 confirmation
- Fallback: rerun QA on critical path only + owner decision on non-critical defects

## `/orchestrate:status`
- Required inputs: current run context
- Expected outputs: stage status, gate status, open blockers, recovery actions
- Gate linkage: cross-stage visibility
- Fallback: manual status consolidation from artifact registry

---

## Market Research + Growth Commands (M-Cycle)

## `/orchestrate:market-research`
- Required inputs: Stage6-QA COMPLETE (or prior M-cycle complete), today's date
- Optional: --skip-live-search (use cached data only, skip WebSearch/WebFetch)
- Expected outputs: docs/competitor-research.md (updated), docs/aso-brief.md, docs/viral-features-spec.md, docs/growth-features-spec.md, docs/api-gap-spec.md, docs/design-prompts/prototype-update-v2.md
- Gate linkage: gateM1, gateM2, gateM3, gateM4
- Repeatable: YES — safe quarterly re-run. Appends dated section to competitor-research.md; overwrites all other outputs.
- Fallback: --skip-live-search skips M1 web tasks; M2–M4 run on existing data

## `/orchestrate:implement-growth`
- Required inputs: StageM4-DocRefresh COMPLETE, feature selection (default: all Phase 1.5)
- Expected outputs: implemented FR-G01 through FR-G07 + bug fixes (aspect_perfections, dignity, radicality.flags, SUBJECT_ROLES, toggle, 429 screen, disclaimer), updated types + mapper + tests
- Gate linkage: gateM5 (inherits Gate 7 + Gate 8 criteria plus growth-specific test requirements)
- Fallback: /v:dispatch with narrowed batch

## `/orchestrate:aso`
- Required inputs: docs/aso-brief.md
- Expected outputs: docs/aso-final.md (owner-approved title, subtitle, keywords CSV, full description, screenshots brief)
- Gate linkage: gateM6 (owner-review gate — ASO copy requires human approval before App Store Connect submission)
- Interactive: YES — asks owner to select app name variant, confirm keyword selection, approve description

## `/orchestrate:prototype-update`
- Required inputs: docs/design-prompts/prototype-update-v2.md, docs/html-prototype/AstraSkClaudeDesign.html (base)
- Expected outputs: updated docs/html-prototype/AstraSkClaudeDesign.html with Phase 1.5 + Phase 2 non-monetization screens
- Gate linkage: Gate 4 equivalent (design approval — owner reviews updated prototype before implementation)
- Agent: horary-design-agent (existing), model: sonnet
- Scope: Phase 1.5 modifications + Phase 2 non-monetization new screens identified by M1+M2 research

## `/orchestrate:store-prep`
- Required inputs: Stage6-QA COMPLETE, docs/aso-final.md exists
- Expected outputs: docs/privacy-policy.md, docs/apple-privacy-labels.md, docs/play-data-safety.md, docs/reviewer-notes.md, docs/store-drafts/*.md (6 locales: en/ru/de/fr/es/pt), docs/app-icon-spec.md, scripts/generate-icon.js, scripts/build-privacy.js, .github/workflows/deploy-privacy.yml
- Gate linkage: gate6b
- Interactive: NO (fully automated) — owner fills placeholders after completion
- Owner actions printed at end: run generate:icon, build:privacy, git push, insert keys/emails

## `/orchestrate:screenshots`
- Required inputs: Stage6b-StoreProp COMPLETE, react-native-view-shot installed
- Expected outputs: src/stores/debugStore.ts (screenshotMode), src/constants/screenshotMockData.ts, src/app/screenshot-runner.tsx, scripts/capture-screenshots.sh, docs/screenshots-guide.md
- Gate linkage: gate6c
- Owner action: run `npm run screenshots` on iOS Simulator after this completes

## `/orchestrate:market-research --status`
- Required inputs: none
- Expected outputs: table with last run dates, staleness indicator (> 90 days = stale), list of market-research doc freshness
- Read-only, no agents launched
