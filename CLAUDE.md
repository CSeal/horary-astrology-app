# CLAUDE.md

## Mission
Build an internal MVP of a horary astrology mobile app with controlled Claude-driven orchestration.

## Core Governance
- Claude-only edits for all core project artifacts.
- External AI/docs are input-only context, never direct artifact edits.
- Every artifact must include provenance metadata:
  - `created_by`
  - `updated_by`
  - `source_inputs`
  - `reviewed_by`

## Orchestration Flow
1. DiscoveryInputs
2. MarketAndCompetitorResearch
3. MvpAndPhaseDefinition
4. UxUiSpecAndHtmlPrototype
5. MobileArchitectureAndApiContracts
6. ImplementationSprints
7. QaAndReleaseReadiness
8. DemoAndStakeholderReview

Required handoff fields at each stage:
- Inputs
- Deliverable
- Assumptions
- Risks
- NextAgent

## Superpowers + superpowers-v (Mandatory)
Use Superpowers workflow with `superpowers-v` as transition layer.

Trigger 1 (post-spec):
- phase-1a code archaeology
- phase-1b domain expert + audience search
- phase-1c documentation/library validation via Context7

Trigger 2 (during writing-plans):
- partition review for disjoint file map

Trigger 3 (execution):
- parallel dispatch of implementation batches

## Gate System
- Gate 1: ICP, MVP boundaries, KPI approved
- Gate 2: API constraints, budget, data policy approved
- Gate 3: `prd-v1.md` approved
- Gate 4: UX flows and design direction approved
- Gate 5: architecture, test strategy, roadmap approved
- Gate 6: provenance confirms Claude-only edits
- Gate 7: valid briefing + acceptance checks per stage
- Gate 8: Trigger 1/2/3 outputs verified

Gate mode: semi-strict
- Must-pass criteria are required.
- Conditional-pass is allowed only with owner, action owner, and follow-up record.

## Required Artifacts
- `CLAUDE.md`
- `project-brief.md`
- `competitor-research.md`
- `prd-v1.md`
- `mvp-scope.md`
- `kpi-and-economics.md`
- `api-integration-spec.md`
- `ux-flows.md`
- `design-system-brief.md`
- `technical-architecture.md`
- `quality-gates.md`
- `delivery-roadmap.md`

superpowers-v output locations:
- `docs/superpowers/archaeology/`
- `docs/superpowers/expert/`
- `docs/superpowers/library-audit/`
- `docs/superpowers/specs/`
- `docs/superpowers/plans/`

## Command Interface
- `/orchestrate:start`
- `/orchestrate:research`
- `/orchestrate:prd`
- `/orchestrate:design`
- `/orchestrate:architecture`
- `/orchestrate:implement`
- `/orchestrate:qa`
- `/orchestrate:status`

Each command must define:
- required inputs
- expected outputs
- gate linkage
- fallback path

## Fallback Policy
If auto-fire fails:
- `/v:archaeology <topic>`
- `/v:dispatch <plan-path>`

Do not rerun manually if auto-fire already completed correctly.

Recovery mode: hybrid
- Auto recovery for standard failures.
- Manual owner approval for critical failures:
  - core-file partition conflicts
  - repeated failure after fallback
  - any Claude-only/provenance violation

## Secrets and Access Policy
Keep this section updated before coding starts:
- Required secrets list and environment mapping
- Storage and rotation rules
- Access levels (read/write/admin)
- Explicit prohibition of secret exposure in artifacts/prompts

## Core-MVP Cutline
If PRD + UX flows + architecture + partition map are not ready, switch to core-MVP scope:
- keep `ask -> verdict -> save journal`
- defer non-critical screens/settings
- keep critical QA only (smoke + critical path)

## Definition of Ready for Coding (Binary)
Coding phase can open only when all required checks are true:
- Required gates passed
- `CLAUDE.md` approved by owner
- `/orchestrate:*` command contracts documented
- secrets/access section completed
- hybrid recovery documented
- provenance and Trigger 1/2/3 outputs verified

If any required item is not complete, coding remains closed.

## Change Management
- Baseline and governance updates are approved by project owner only.
- Any governance change must include rationale and impacted gates/commands.
