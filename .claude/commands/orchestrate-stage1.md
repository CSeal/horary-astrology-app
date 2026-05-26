## Stage 1 — Research

### Prerequisites check
1. Read docs/orchestration/handoff-log.md
2. If Stage1-Research is already COMPLETE, report: "Stage 1 already done. Run /orchestrate-stage2." and stop.

### Launch sub-agent
Call Agent with:
- subagent_type: "horary-research-agent"
- model: "sonnet"
- prompt: "Run Stage 1 — create all research artifacts as defined in your instructions. Today's date: [current date]."

### After completion
Read docs/orchestration/handoff-log.md to confirm Stage1-Research entry with status COMPLETE.
Report: "✓ Stage 1 complete — research artifacts created. Run /orchestrate-stage2 to continue."
