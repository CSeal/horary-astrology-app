## Stage 6 — QA + Demo Readiness

### Prerequisites check
1. Read docs/orchestration/handoff-log.md — verify Stage5c and Stage5d are COMPLETE.
2. If any Stage 5 batch is missing, stop and report which batch failed.

### Launch QA agent
Call Agent:
- subagent_type: "horary-qa-agent"
- model: "sonnet"
- prompt: "All Stage 5 batches complete. Run full QA: expo doctor, tsc, eslint, and the jest unit suite WITH coverage (the unit suite is a must-pass P0 gate — baseline 9 suites / 54 tests, see docs/features/testing.md). Then run the 6 smoke tests. Create docs/qa-summary.md and docs/demo-readiness.md."

### After completion
Read docs/qa-summary.md — display P0/P1 issues list.
Read docs/orchestration/handoff-log.md — confirm Stage6-QA entry.

If P0 issues exist: "⚠ P0 issues found — fix before demo. See docs/qa-summary.md."
If no P0 issues: "✓ Build ready. See docs/demo-readiness.md for demo instructions."
