## Stage 4 — Architecture + Expo Init

### Prerequisites check
1. Read docs/orchestration/handoff-log.md — verify Stage3-Design is COMPLETE (gate4: PASS)
2. If Stage3 is not COMPLETE, stop and report: "Stage 3 not complete. Check handoff-log.md."
3. If Stage4 is already COMPLETE, report: "Stage 4 already done. Run /orchestrate-stage5."

### Extract dynamic context (read first 40 lines of each):
- docs/design-system-brief.md → extract: color palette tokens, font names
- docs/mvp-scope.md → extract: Phase 1 feature list (first table only)
- docs/superpowers/library-audit/expo-libraries.md → extract: expo version, key packages

### Launch sub-agent
Call Agent with:
- subagent_type: "horary-architecture-agent"
- model: "sonnet"
- prompt: Compose from extracted context above + "Create all Stage 4 architecture docs and initialize the Expo project. Design tokens: [extracted]. MVP features: [extracted]. Library versions: [extracted]."

### After completion
Read docs/orchestration/handoff-log.md to confirm Stage4-Architecture entry with status COMPLETE.
Report: "✓ Stage 4 complete — architecture docs created, Expo project initialized. Run /orchestrate-stage5 to begin coding."
