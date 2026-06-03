## Market Research Cycle — Repeatable Competitive Intelligence

This command runs the full market-research cycle: live competitor research → growth specs (parallel with API audit) → doc refresh + design prompt.
Safe to re-run quarterly. Each run appends a dated section to competitor-research.md.

### Prerequisites check
1. Read docs/orchestration/handoff-log.md
2. Require Stage6-QA COMPLETE OR StageM4-DocRefresh entry from a prior cycle
3. If StageM1-MarketResearch entry exists: check date. If < 30 days ago, warn user: "Market research ran [N] days ago. Re-run?" — stop if user says no.

### Compound V Pre-flight (Trigger 1) — launch 3 agents in PARALLEL (single message)
Call all three in one message:

Agent 1 (archaeology):
- subagent_type: "code-archaeologist"
- model: "sonnet"
- prompt: "Topic: market-research-cycle. Read: src/services/horaryMapper.ts, src/components/VerdictCard.tsx, src/app/(tabs)/result/[id].tsx, docs/api-integration-spec.md. Produce: (1) complete list of HoraryAnalysisResponse wire fields and their mapper/UI status, (2) exact line ranges in VerdictCard.tsx where new sections could be inserted without conflicts, (3) File Touch Map for Phase 1.5 implementation. Save to docs/superpowers/archaeology/market-research-cycle.md"
# Sonnet: structured code reading + line-range extraction

Agent 2 (domain expert):
- subagent_type: "domain-expert"
- model: "sonnet"
- prompt: "Topic: ASO + virality for horary astrology apps. Research: (1) App Store keyword policy (title 30 chars, subtitle 30 chars, keyword field 100 chars comma-separated), (2) Instagram Stories share deep-link protocol (instagram-stories://share parameters), (3) iOS SKStoreReviewRequest 3-per-year system limit + expo-store-review usage, (4) best-practice timing for in-app review prompts in astrology/spiritual apps, (5) viral mechanics in prediction/fortune-telling apps. NOTE: pregnancy/fertility routing was already decided via Trigger 1 pre-flight — see docs/superpowers/expert/2026-06-03-fertility-routing.md. Do NOT re-research this topic. Save to docs/superpowers/expert/aso-virality-brief.md"
# Sonnet: web research + structured synthesis

Agent 3 (library validator):
- subagent_type: "doc-validator"
- model: "haiku"
- prompt: "Validate these libraries against Expo SDK 55 + React Native new architecture: (1) react-native-view-shot — is captureRef available, does it work with RN new arch?, (2) expo-sharing — current API, expo-sharing vs Share API, (3) expo-store-review — requestReview() iOS/Android behavior, availability, (4) expo-linking — deep-link handling, custom scheme setup. Use Context7 for each. Save to docs/superpowers/library-audit/growth-libraries.md"
# Haiku: mechanical Context7-queries, yes/no compatibility answers

Wait for all 3 to complete.

### StageM1 — Market Research
Call Agent:
- subagent_type: "horary-market-research-agent"
- model: "sonnet"
- prompt: "Run StageM1. Today's date: [current date]. Pre-flight outputs available at: docs/superpowers/expert/aso-virality-brief.md and docs/superpowers/library-audit/growth-libraries.md."

Wait for completion. Read handoff-log.md — confirm StageM1-MarketResearch COMPLETE.

### StageM2 + StageM3 — Growth Spec ∥ API Audit (PARALLEL)
Call both in the same message:

Agent A (Growth Spec):
- subagent_type: "horary-growth-spec-agent"
- model: "sonnet"
- prompt: "Run StageM2. StageM1 complete. Pre-flight available at docs/superpowers/expert/aso-virality-brief.md and docs/superpowers/library-audit/growth-libraries.md."

Agent B (API Gap):
- subagent_type: "horary-api-gap-agent"
- model: "sonnet"
- prompt: "Run StageM3. StageM1 complete. Archaeology output at docs/superpowers/archaeology/market-research-cycle.md."

Wait for both. Read handoff-log.md — confirm BOTH StageM2-GrowthSpec AND StageM3-APIAudit COMPLETE.

### StageM4 — Doc Refresh
Call Agent:
- subagent_type: "horary-doc-refresh-agent"
- model: "sonnet"
- prompt: "Run StageM4. StageM2 and StageM3 both COMPLETE. Integrate outputs into PRD, scope, INDEX, and create prototype-update-v2.md."

Wait for completion. Read handoff-log.md — confirm StageM4-DocRefresh COMPLETE.

### Final report
Report to user:
- Artifacts created: [list from StageM4 handoff]
- ASO brief: docs/aso-brief.md (app name candidates + 50 keywords)
- Growth feature specs: docs/viral-features-spec.md + docs/growth-features-spec.md
- API gap spec: docs/api-gap-spec.md
- PRD updated: Phase 1.5 FRs (FR-G01 to FR-G07) added
- Design prompt: docs/design-prompts/prototype-update-v2.md

"Next steps:
- To update HTML prototype: /orchestrate:design (reads prototype-update-v2.md)
- To implement growth features: /orchestrate:implement-growth
- To finalize App Store metadata: review docs/aso-brief.md and run /orchestrate:aso"

### Commit (owner approval required)
Run `git diff --stat` and show output to owner.
Propose commit message following AstraSk conventions (see `.claude/skills/git-commit/`).
**Wait for explicit owner approval before running `git commit`. Do NOT commit automatically.**
