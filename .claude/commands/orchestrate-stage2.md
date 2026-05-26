## Stage 2 — PRD

### Prerequisites check
1. Read docs/orchestration/handoff-log.md
2. If Stage1-Research is not COMPLETE, stop: "Stage 1 not complete. Run /orchestrate-stage1 first."
3. If Stage2-PRD is already COMPLETE, report: "Stage 2 already done. Run /orchestrate-stage3." and stop.

### Extract dynamic context (read first 30 lines of each):
- docs/project-brief.md → extract: ICP description, primary KPIs
- docs/competitor-research.md → extract: top 2 market gaps

### Launch sub-agent
Call Agent with:
- subagent_type: "horary-prd-agent"
- model: "sonnet"
- prompt: "Run Stage 2 — create PRD artifacts. Context from Stage 1: ICP=[extracted], KPIs=[extracted], Key market gaps=[extracted]."

### After completion
Read docs/orchestration/handoff-log.md to confirm Stage2-PRD entry with status COMPLETE.
Report: "✓ Stage 2 complete — PRD artifacts created. Run /orchestrate-stage3 to continue."
