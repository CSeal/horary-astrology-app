## Stage 3 — Design

### Prerequisites check
1. Read docs/orchestration/handoff-log.md
2. If Stage2-PRD is not COMPLETE, stop: "Stage 2 not complete. Run /orchestrate-stage2 first."
3. If Stage3-Design is already COMPLETE, report: "Stage 3 already done. Run /orchestrate-stage4." and stop.

### Extract dynamic context (read first 30 lines of each):
- docs/ux-flows.md → extract: list of screens, main user flows
- docs/mvp-scope.md → extract: Phase 1 feature list (first table)

### Launch sub-agent
Call Agent with:
- subagent_type: "horary-design-agent"
- model: "sonnet"
- prompt: "Run Stage 3 — create design system and HTML prototype. Screens: [extracted]. Phase 1 features: [extracted]."

### After completion
Read docs/orchestration/handoff-log.md to confirm Stage3-Design entry with status COMPLETE.
Report: "✓ Stage 3 complete — design system and HTML prototype created. Run /orchestrate-stage4 to continue."
