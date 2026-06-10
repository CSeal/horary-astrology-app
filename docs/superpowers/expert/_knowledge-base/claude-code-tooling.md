# Claude Code Tooling Knowledge Base

Maintained by Compound V Phase 1B advisor. Append at the bottom on each pass.

---

## Updated 2026-06-10 — CLAUDE.md structure, sizing, and instruction-file mechanics

Primary sources: [Anthropic memory docs](https://code.claude.com/docs/en/memory), [Anthropic best-practices](https://code.claude.com/docs/en/best-practices), [Anthropic skills](https://code.claude.com/docs/en/skills), [HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md).

### Size & adherence (hard numbers)
- Official ceiling: **< 200 lines per CLAUDE.md** ("Longer files consume more context and reduce adherence"). Source: [memory docs](https://code.claude.com/docs/en/memory).
- Practitioner targets: root file **< 60 lines**, absolute ceiling **< 300 lines**. Source: [HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md).
- CLAUDE.md is loaded **in full every session, regardless of length** — no lazy load for files in the cwd-ancestor chain. Cost is paid per turn, before the task.
- Degradation is documented, not folklore: "Bloated CLAUDE.md files cause Claude to ignore your actual instructions!" ([best-practices](https://code.claude.com/docs/en/best-practices)). Corroborated by 4+ HN threads + multiple GitHub issues (#27032, #27750, #15443).
- Per-line test (use as the prune rule): *"Would removing this cause Claude to make mistakes?"* If not, cut it.
- Add a rule only on the **second** occurrence of a mistake. Once = noise, twice = pattern.

### Include / Exclude matrix (verbatim from Anthropic best-practices)
| ✅ Include | ❌ Exclude |
|---|---|
| Bash commands Claude can't guess | Anything Claude can figure out by reading code |
| Code style rules that differ from defaults | Standard language conventions Claude already knows |
| Testing instructions / preferred test runners | Detailed API docs (link instead) |
| Repo etiquette (branch/PR conventions) | Info that changes frequently |
| Architectural decisions specific to project | Long explanations / tutorials |
| Dev-env quirks (required env vars) | File-by-file codebase descriptions |
| Common gotchas / non-obvious behaviors | Self-evident practices ("write clean code") |

HumanLayer adds: **never put code-style rules a linter enforces** ("Never send an LLM to do a linter's job") and **avoid code snippets** ("they will become out-of-date quickly" — use `file:line` pointers).

### Token-reduction lever ranking (CRITICAL — most teams get this wrong)
1. **Move to skills** (`.claude/skills/*/SKILL.md`) — load on demand only when invoked/relevant. Best for multi-step procedures, sometimes-relevant workflows. Zero per-session cost.
2. **`.claude/rules/*.md` with `paths:` frontmatter** — path-scoped; loads only when Claude touches matching files. Best for file-type-specific gotchas (e.g. Reanimated rules scoped to `src/**/*.tsx`).
3. **Prune / delete** — anything a linter, tsc, or hook already enforces.
4. **HTML comments** `<!-- ... -->` — stripped before context injection; zero-cost home for provenance, rationale, maintainer notes, review dates.
5. **`@import` — DOES NOT reduce tokens.** "Imported files still load and enter the context window at launch." Use for *organization only*, never for context savings.

### Mechanism-selection matrix
| Need | Use |
|---|---|
| "How things are" — always-on conventions, architecture, key commands | **CLAUDE.md** (root, < 200 lines) |
| File-type/path-specific rules | **`.claude/rules/*.md`** with `paths:` frontmatter |
| "What to do" — multi-step / sometimes-relevant workflows | **Skills** (load on demand) |
| Must happen every time, zero exceptions (lint before commit, block a path) | **Hooks** (deterministic; only real enforcement) |
| Claude's own accumulated learnings (build cmds, debug insights) | **Auto memory** `MEMORY.md` (v2.1.59+) |
| Personal, non-team preferences | `~/.claude/CLAUDE.md` or `CLAUDE.local.md` (gitignored) |
| Org-wide, non-excludable | Managed-policy CLAUDE.md / `claudeMd` in managed-settings.json |

Rule of thumb (community): **"Use rules for how things are, use skills for what to do."**
CLAUDE.md is advisory context (delivered as a user message after the system prompt), **not enforced configuration** — for guarantees, use hooks.

### Load order & resolution mechanics
- Scope precedence (broad → specific, all concatenated, none override): managed-policy → user `~/.claude/CLAUDE.md` → project `./CLAUDE.md` or `./.claude/CLAUDE.md` → local `./CLAUDE.local.md`.
- Within the directory tree: root-down; instructions closer to cwd load **last**. `CLAUDE.local.md` appended after `CLAUDE.md` at each level.
- `@import`: relative paths resolve to the **importing file** (not cwd); both relative/absolute allowed; **max 4 hops** recursion; first external import shows a one-time approval dialog.
- **Nested CLAUDE.md (subdirs): NOT loaded at launch** — only when Claude reads a file in that subdir; **NOT re-injected after `/compact`**. Root CLAUDE.md **survives `/compact`** (re-read from disk).
- HTML block comments stripped before injection (preserved inside code blocks and when opened with Read).
- `claudeMdExcludes` (glob, any settings layer) skips ancestor files in monorepos; managed-policy files cannot be excluded.
- `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` loads memory files from `--add-dir` dirs.
- Claude Code reads **CLAUDE.md, not AGENTS.md** — bridge via `@AGENTS.md` import or symlink.

### Auto memory (separate system)
- `~/.claude/projects/<project>/memory/MEMORY.md`; first **200 lines / 25 KB** loaded per session; topic files loaded on demand.
- Claude-written (corrections, preferences, debug insights). Distinct from human-authored CLAUDE.md. Toggle via `/memory` or `autoMemoryEnabled`.

### Anti-pattern catalog
- **Over-specified CLAUDE.md** — top failure mode; rules lost in noise. Fix: ruthless prune; "if Claude keeps ignoring a rule, the file is probably too long."
- **`@import` cargo-cult** — splitting ≠ saving tokens.
- **Append-only rot** — month-3 → 400+ lines, contradictions; Claude picks contradictory rules arbitrarily. Need quarterly/3–6-month prune cadence.
- **Linter's job** — restating ESLint/tsc rules in prose.
- **Stale-model rules** — rules written for a 2024 model can hobble a 2026 model (e.g. forced single-file edits). Re-review on major model releases.
- **Burying the lede** — high-frequency rules placed at the bottom where adherence is worst.
- **Cache churn** — every CLAUDE.md edit invalidates prompt cache; batch edits.

### Tuning levers
- Emphasis ("IMPORTANT", "YOU MUST") measurably improves adherence — use sparingly for the few rules that matter most.
- `/init` generates a starter (or suggests improvements if one exists); `CLAUDE_CODE_NEW_INIT=1` for interactive multi-phase setup (CLAUDE.md + skills + hooks).
- `InstructionsLoaded` hook logs exactly which instruction files loaded — debug path-scoped/lazy-loaded rules.
- `/memory` lists all loaded CLAUDE.md / CLAUDE.local.md / rules files for the session.

### Reusable recommendation for any Hora-style large project
Target structure: lean root CLAUDE.md (commands + always-on conventions + non-obvious gotchas, < 200 lines, high-frequency rules first) → orchestration/process prose in skills → file-type gotchas in `.claude/rules/*.md` with `paths:` → enforcement in hooks → provenance in `<!-- -->`.
