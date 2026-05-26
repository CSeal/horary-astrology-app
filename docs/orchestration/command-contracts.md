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
