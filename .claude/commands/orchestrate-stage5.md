## Stage 5 — Implementation (4 sub-agents: A→B→C, D∥B)

### Prerequisites check
1. Read docs/orchestration/handoff-log.md — verify Stage4-Architecture is COMPLETE (gate5: PASS)
2. If not COMPLETE, stop and report the blocker.
3. Read docs/technical-architecture.md (first 50 lines) — extract file tree summary.

### Sprint 1 — Foundation (must complete first)
Call Agent:
- subagent_type: "horary-foundation-agent"
- model: "opus"
- prompt: "Sprint 1 — Batch A. Architecture is ready. Install all deps from docs/superpowers/library-audit/expo-libraries.md and create all Batch A foundation files. File tree: [extracted from technical-architecture.md]."

Wait for completion. Read handoff-log.md — confirm Stage5a-Foundation COMPLETE.

### Sprint 2 — Services (after Sprint 1)
Call Agent:
- subagent_type: "horary-services-agent"
- model: "opus"
- prompt: "Sprint 2 — Batch B. Foundation (Batch A) is complete. Create all service, hook, and store files per docs/api-integration-spec.md."

Wait for completion. Read handoff-log.md — confirm Stage5b-Services COMPLETE.

### Sprint 3 + 4 — Screens ∥ Polish (parallel after Sprint 2)
Call both Agents in the same message (parallel):

Agent 1:
- subagent_type: "horary-screens-agent"
- model: "opus"
- prompt: "Sprint 3 — Batch C. Services (Batch B) complete. Create all screens and screen-level components."

Agent 2:
- subagent_type: "horary-polish-agent"
- model: "opus"
- prompt: "Sprint 4 — Batch D. Foundation (Batch A) complete. Create SVG components, settings, onboarding, and error states."

Wait for both. Read handoff-log.md — confirm Stage5c and Stage5d COMPLETE.

### Sprint 5 — Cleanup (after Sprints 3+4 complete)
Call Agent:
- subagent_type: "horary-cleanup-agent"
- model: "sonnet"
- prompt: "Stage 5e — Pre-QA hardening. Batches A–D are complete. Run baseline audit, auto-fix all issues (expo install --fix, lint --fix, TypeScript errors, deferred items from batch handoffs), confirm all checks green, write Stage5e-Cleanup handoff entry."

Wait for completion. Read handoff-log.md — confirm Stage5e-Cleanup COMPLETE.

### Review & Commit

Run `git diff --stat` and show the output to the user.
Propose a commit message following AstraSk conventions.

**Wait for explicit approval before running `git commit`.**
Do not commit automatically.

### Final report
"✓ Stage 5 complete — all 5 sprints done. Ready to commit and run /orchestrate-stage6 for QA."
