## SDK Upgrade

Orchestrates an Expo SDK version upgrade in two phases:
1. **Plan** (default) — research-only, writes migration plan, no changes to the project.
2. **Execute** — applies the upgrade, fixes breaking changes, verifies all checks pass.

The two-phase design ensures you always review the risk assessment before any code changes.

### Usage

- `/sdk:upgrade` — creates migration plan (safe, read-only)
- `/sdk:upgrade execute` — applies the plan (modifies project)

---

## Phase 1 — Plan (default)

### Prerequisites check

1. Read `docs/orchestration/handoff-log.md` — note current stage.
2. Check `docs/deps/` for a recent audit file. If one exists and is less than 7 days old,
   note the SDK upgrade section from it (speeds up research).
3. If no audit exists: recommend running `/deps:audit` first for fuller context, but proceed anyway.

### Launch plan agent

Call Agent:
- subagent_type: "horary-sdk-upgrade-agent"
- model: "opus"
- prompt: "Plan mode. Research Expo SDK upgrade from current version to latest available. Write migration plan to docs/deps/sdk-upgrade-plan-[today's date].md. Do not make any changes to the project."

Wait for completion.

### After plan is written

1. Read `docs/deps/sdk-upgrade-plan-[date].md` — display:
   - Overall risk level
   - Cascade table (packages that must update)
   - Project-specific risks section
   - Decision recommendation

2. Show the user:
   ```
   Plan written → docs/deps/sdk-upgrade-plan-[date].md
   
   Review the plan carefully — especially the project-specific risks.
   When ready to apply: tell me "run /sdk:upgrade execute"
   ```

3. Stop. Do not execute. Do not commit.

---

## Phase 2 — Execute

### Prerequisites check

1. Confirm the user's message contains "execute" (explicit intent).
2. Find `docs/deps/sdk-upgrade-plan-*.md` — must exist.
3. Read plan file — confirm `status: PENDING_APPROVAL`.
4. Display plan summary again and ask for final confirmation:
   ```
   About to apply SDK upgrade: Expo [N] → [N+1]
   Risk: [level] | Estimated time: [Xh]
   
   Type "confirmed" to proceed.
   ```
5. Wait for "confirmed" before launching agent.

### Launch execute agent

Call Agent:
- subagent_type: "horary-sdk-upgrade-agent"
- model: "opus"
- prompt: "Execute mode. Read docs/deps/sdk-upgrade-plan-[date].md and apply the upgrade. Fix all breaking changes. Run full verification. Write completion entry to handoff-log."

Wait for completion.

### After execution

1. Read `docs/orchestration/handoff-log.md` — confirm Stage-SdkUpgrade entry with status COMPLETE.

2. If COMPLETE:
   - Show `git diff --stat`
   - Propose commit message:
     ```
     chore(deps): upgrade Expo SDK [N] → [N+1] with cascade fixes
     ```
   - Wait for explicit approval before committing.
   - After commit: "✓ SDK upgrade complete. Run /orchestrate-stage6 to re-validate QA on new SDK."

3. If BLOCKED:
   - Show P0 issues from handoff entry.
   - "⚠ Upgrade blocked — manual intervention required. See docs/deps/sdk-upgrade-plan-[date].md."
   - Do not commit.
