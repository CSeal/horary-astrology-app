## Stage 5e — Pre-QA Cleanup

Hardens the implementation before QA: fixes version drift, lint errors, TypeScript issues,
and any deferred items left by Batches 5a–5d. Requires 5c AND 5d to be COMPLETE.

### Prerequisites check

1. Read `docs/orchestration/handoff-log.md` — verify Stage5c-Screens AND Stage5d-Polish are COMPLETE.
2. If either is missing, stop: "Stage 5e requires Batches C and D to be complete. Run /orchestrate-stage5 first."

### Launch Cleanup agent

Call Agent:
- subagent_type: "horary-cleanup-agent"
- model: "sonnet"
- prompt: "Stage 5e — Pre-QA hardening. Stage 5c and 5d are complete. Run baseline audit, auto-fix all issues (expo install --fix, lint --fix, TypeScript errors, deferred items from batch handoffs), confirm all checks green, write Stage5e-Cleanup handoff entry."

### After completion

Read `docs/orchestration/handoff-log.md` — confirm Stage5e-Cleanup entry with status COMPLETE.

If P0 issues listed: "⚠ P0 issues found — fix before running Stage 6. See handoff-log Stage5e entry."
If no P0 issues: "✓ Stage 5e complete — project is green. Run /orchestrate-stage6 for QA."
