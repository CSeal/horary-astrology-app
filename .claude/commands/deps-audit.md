## Deps Audit

Runs a full dependency analysis: classifies all packages into safety tiers, researches changelogs
and known issues for updatable packages, checks SDK upgrade availability, and auto-syncs
`expo.install.exclude`. Writes a structured report. Never installs anything.

### No prerequisites

Can run at any time — no stage completion required.
Running before Stage 6 QA is recommended. Running after any `npm install` is also useful.

### Launch audit agent

Call Agent:
- subagent_type: "horary-deps-agent"
- model: "sonnet"
- prompt: "Run full dependency audit. Classify all packages, research updatable ones, check SDK upgrade, sync exclude list, write docs/deps/audit-[today's date].md."

Wait for completion.

### After completion

1. Read `docs/deps/audit-[date].md` — display the **Summary** table and **exclude list changes** section.

2. If SDK upgrade is available: show the 🚨 section header + estimated effort + recommendation.

3. If Level 2 exclude proposals exist: display them and ask:
   "Reply 'apply all' / 'apply [package names]' / 'skip' to proceed with exclude list changes."
   Wait for response before applying anything.

4. If Safe-to-update packages exist: show the ✅ section and copy-paste command.
   Do NOT run the command — show it to the user for manual execution.

### No commit

This command only writes an audit report and optionally edits `expo.install.exclude`.
No source files change. No commit needed unless exclude list was modified.

If `expo.install.exclude` was modified:
- Show `git diff package.json`
- Propose: `chore(deps): sync expo.install.exclude — remove stale entries`
- Wait for explicit approval before committing.
