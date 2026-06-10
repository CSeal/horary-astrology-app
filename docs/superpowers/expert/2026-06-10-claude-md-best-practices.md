<!--
created_by: Compound V Phase 1B (Domain-Expert Advisor)
updated_by: Compound V Phase 1B
source_inputs: Anthropic Claude Code docs (memory, best-practices), HumanLayer blog, HN threads, DEV.to, anti-pattern articles
reviewed_by: pending
-->

# Domain Audit — CLAUDE.md / Claude Code Project-Instructions Best Practices

Date: 2026-06-10
Advisor: Compound V Phase 1B
Topic slug: claude-md-best-practices

---

## 1. Domain(s) Identified

1. **claude-code-tooling** — how Claude Code loads, ranks, and obeys instruction files (CLAUDE.md, `.claude/rules/`, skills, hooks, auto memory). This is the primary domain.

This is a meta/tooling domain, not a product domain. Phase 1A (code) and 1C (libraries) do not cover it. The "regulatory reality" here is **Anthropic's own loading mechanics and the documented degradation behavior of the model** — what the field already knows about why a 241-line orchestration-heavy CLAUDE.md silently stops being obeyed.

---

## 2. Sources Consulted

**KB files reused:** none — no `claude-code-tooling.md` existed. Created this pass.

**Official / authoritative (Layer 1 — fetched verbatim):**
- [Claude Code Docs — How Claude remembers your project (memory)](https://code.claude.com/docs/en/memory) — the authoritative spec for load order, `@import`, `.claude/rules/`, nested files, compaction, troubleshooting.
- [Claude Code Docs — Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) — the Include/Exclude table, the "Would removing this cause mistakes?" test, the over-specified-CLAUDE.md failure pattern.
- [Claude Code Docs — Skills](https://code.claude.com/docs/en/skills) — load-on-demand mechanics.

**Practitioner / community (Layer 2):**
- [HumanLayer — Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) — "< 300 lines is best", root file "less than sixty lines", "Never send an LLM to do a linter's job", `agent_docs/` progressive-disclosure pattern.
- [HN 46098838 — Writing a good Claude.md (discussion)](https://news.ycombinator.com/item?id=46098838)
- [HN 46102048 — "Claude often ignores CLAUDE.md… the more information in the file"](https://news.ycombinator.com/item?id=46102048)
- [HN 44842742 — "ClaudeCode routinely ignores its own CLAUDE.md file"](https://news.ycombinator.com/item?id=44842742)
- [HN 47069255 — "Claude.md isn't always read and followed"](https://news.ycombinator.com/item?id=47069255)
- [DEV.to — I Wrote 200 Lines of Rules for Claude Code. It Ignored Them All](https://dev.to/minatoplanb/i-wrote-200-lines-of-rules-for-claude-code-it-ignored-them-all-4639)
- [DEV.to — Why Claude Code Ignores Your CLAUDE.md (And How to Fix It)](https://dev.to/dylan_1e07ca370a5576/why-claude-code-ignores-your-claudemd-and-how-to-fix-it-2hip)
- [AI Codex — Claude Code anti-patterns](https://www.aicodex.to/articles/claude-code-antipatterns)
- [DigitalApplied — Claude Code Anti-Patterns: Team Adoption Failure Modes (2026)](https://www.digitalapplied.com/blog/claude-code-anti-patterns-team-adoption-failure-modes-2026)
- GitHub issues: [#27032 ignores instructions despite reading](https://github.com/anthropics/claude-code/issues/27032), [#27750 not reliable across sessions](https://github.com/anthropics/claude-code/issues/27750), [#15443 ignores while claiming to understand](https://github.com/anthropics/claude-code/issues/15443).

**Search queries run (parallel, single message x2 batches):** Anthropic official guidance; token budget / bloat; @import vs nested vs CONVENTIONS.md; r/ClaudeAI bloat (no hits); HN instructions-ignored; anti-patterns/gotchas; @import syntax; "does not follow instructions"; skills-vs-CLAUDE.md; reddit hooks-enforce (no hits).

**Note on community evidence threshold:** the "Claude ignores long CLAUDE.md" finding clears the bar — it is stated **in Anthropic's own docs** ("Bloated CLAUDE.md files cause Claude to ignore your actual instructions!") AND corroborated by 4+ distinct HN threads, 2 DEV.to long-forms, and 3+ tracked GitHub issues. This is consensus, not isolated report.

---

## 3. Domain Constraints the Brainstorm Probably Missed

These are mechanics of how the file is actually consumed — easy to miss when treating CLAUDE.md as "just docs."

- **MUST treat CLAUDE.md as loaded in full, every session, before the task.** Anthropic: "CLAUDE.md files are loaded in full regardless of length." There is no lazy-load for the root file. Every byte is a per-turn tax. ([memory docs](https://code.claude.com/docs/en/memory))
- **MUST keep it under 200 lines.** Anthropic: "target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence." HumanLayer's working figure is even tighter (root < 60 lines; < 300 absolute ceiling). The current file is **241 lines / ~10.3 KB — over the official limit.** ([memory docs](https://code.claude.com/docs/en/memory), [HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md))
- **MUST NOT assume `@import` reduces context.** This is the single most common misconception. Anthropic states twice: "imported files still load and enter the context window at launch" and "Splitting into `@path` imports helps organization but does not reduce context." Splitting a 241-line file into 5 `@`-imported files = identical token cost. ([memory docs](https://code.claude.com/docs/en/memory))
- **SHOULD use `.claude/rules/` with `paths:` frontmatter to actually shed tokens.** Path-scoped rules "only load into context when Claude works with matching files." This is the *real* token-reduction lever, not `@import`. ([memory docs](https://code.claude.com/docs/en/memory))
- **SHOULD move multi-step procedures and sometimes-relevant workflows to skills.** Anthropic: "If an entry is a multi-step procedure or only matters for one part of the codebase, move it to a skill or a path-scoped rule instead." Skills load on demand, not every session. The project already has ~40 skills — the orchestration prose in CLAUDE.md largely duplicates them. ([memory docs](https://code.claude.com/docs/en/memory), [skills docs](https://code.claude.com/docs/en/skills))
- **MUST NOT rely on CLAUDE.md for anything that must happen with zero exceptions.** It is advisory context delivered as a user message after the system prompt, "not enforced configuration." For must-run actions (lint before commit, block writes to a path) use a **hook**. ([memory docs](https://code.claude.com/docs/en/memory))
- **SHOULD use HTML comments for maintainer/provenance notes.** "Block-level HTML comments (`<!-- ... -->`) in CLAUDE.md files are stripped before the content is injected into Claude's context." Provenance metadata, "last reviewed" dates, and rationale belong in `<!-- -->` so they cost zero tokens. ([memory docs](https://code.claude.com/docs/en/memory))
- **SHOULD NOT include code examples that can rot.** HumanLayer: "Don't include code snippets in these files if possible — they will become out-of-date quickly." Use `file:line` pointers instead. (Caveat — see Open Questions: the Reanimated/SVG snippets in the current file are load-bearing gotchas, a defensible exception.)
- **MUST NOT use CLAUDE.md as a style guide a linter could enforce.** HumanLayer: "Never send an LLM to do a linter's job." The `no-restricted-imports`, no-hex, no-`any` rules already live in ESLint/tsc — restating them in CLAUDE.md is redundant context that a hook + lint already guarantee.

---

## 4. Common Traps in This Domain

- **The over-specified CLAUDE.md (the headline trap).** Anthropic lists it explicitly as a failure pattern: "If your CLAUDE.md is too long, Claude ignores half of it because important rules get lost in the noise." The fix is in their docs: "If Claude keeps doing something you don't want despite having a rule against it, the file is probably too long and the rule is getting lost." Community consensus (4+ HN threads, multiple GitHub issues) confirms adherence collapses as the file grows. The current file's most load-bearing rules (Reanimated single-owner, commit-approval) are buried at the very bottom — the worst position for retention.
- **`@import` cargo-culting.** Teams split a bloated file into imports believing they saved tokens; they didn't. Verbatim from docs (see §3).
- **Append-only memory rot.** DigitalApplied: by month three teams hit "400+ lines of accumulated rules, some of which contradict each other." Anthropic: "if two rules contradict each other, Claude may pick one arbitrarily." No prune cadence = guaranteed contradiction drift.
- **Writing a rule on the first error.** Anthropic's counterintuitive rule: only add to CLAUDE.md "when Claude makes the same mistake a second time." Once = noise, twice = pattern. One-off lessons collapse signal-to-noise.
- **Rules written for an old model.** Anthropic flags rules that "constrain a 2026 model" (e.g., forcing single-file edits, useful for a 2024 model, counterproductive now). Recommended re-review cadence: 3–6 months, especially around major model releases.
- **Burying the lede.** Within the directory tree, files closer to cwd load last; within a file, position matters for retention. High-frequency rules (commit policy, the styling/import bans Claude hits every edit) should be near the top, not after 200 lines of orchestration tables.
- **Cache invalidation churn.** Community guidance: every edit to CLAUDE.md resets the prompt cache and forces full re-processing next turn. Batch edits; don't tweak between every session.

---

## 5. Regulatory / Compliance Notes

No external regulation. The binding "rules of the field" are Anthropic's documented loading mechanics, which function as hard constraints:

- **Load order (broadest → most specific, all concatenated, none override):** managed-policy → user (`~/.claude/CLAUDE.md`) → project (`./CLAUDE.md` or `./.claude/CLAUDE.md`) → local (`./CLAUDE.local.md`). Within the tree, root-down; `CLAUDE.local.md` appended after `CLAUDE.md` at each level. ([memory docs](https://code.claude.com/docs/en/memory))
- **`@import` resolution:** relative to the importing file (not cwd); max recursion depth **4 hops**; first external import triggers a one-time approval dialog. ([memory docs](https://code.claude.com/docs/en/memory))
- **Nested CLAUDE.md (subdirectories):** NOT loaded at launch — included only when Claude reads a file in that subdir; NOT re-injected after `/compact`. Root CLAUDE.md DOES survive `/compact` (re-read from disk). ([memory docs](https://code.claude.com/docs/en/memory))
- **AGENTS.md:** Claude Code reads CLAUDE.md, not AGENTS.md. If both are needed, `@AGENTS.md` import or symlink. ([memory docs](https://code.claude.com/docs/en/memory))
- **Auto memory (separate system, v2.1.59+):** `~/.claude/projects/<project>/memory/MEMORY.md`, first 200 lines / 25 KB loaded per session. This is where Claude writes its own learnings — distinct from human-authored CLAUDE.md. The project already uses it (see the MEMORY.md index in context).

---

## 6. Recent Breaking Changes (last 12 months)

The mechanics matured significantly in 2025–2026. Anything written against an older mental model is now wrong:

- **`.claude/rules/` with `paths:` frontmatter** is now the official modular/token-shedding mechanism — supersedes the older "just split with `@import`" advice for context reduction. ([memory docs](https://code.claude.com/docs/en/memory))
- **Auto memory** (Claude-written `MEMORY.md`) added as a first-class second memory system, v2.1.59+. Build/debug insights now belong here, not in CLAUDE.md. ([memory docs](https://code.claude.com/docs/en/memory))
- **HTML-comment stripping** before context injection — confirmed current behavior; lets maintainer notes cost zero tokens. ([memory docs](https://code.claude.com/docs/en/memory))
- **`claudeMdExcludes`** setting and `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` env var for monorepo control. ([memory docs](https://code.claude.com/docs/en/memory))
- **Managed-policy CLAUDE.md + `claudeMd` key in managed-settings.json** for org-wide instructions that can't be excluded. ([memory docs](https://code.claude.com/docs/en/memory))
- **`/init` interactive multi-phase flow** behind `CLAUDE_CODE_NEW_INIT=1` (sets up CLAUDE.md + skills + hooks together). ([memory docs](https://code.claude.com/docs/en/memory))
- **`InstructionsLoaded` hook** for debugging exactly which instruction files loaded. ([memory docs](https://code.claude.com/docs/en/memory))

---

## 7. Design Constraints for the Plan (NON-NEGOTIABLE)

The plan author treats these as hard requirements for any CLAUDE.md reorganization.

1. **Target ceiling: < 200 lines / ~8 KB for the root CLAUDE.md.** Current is 241 lines / 10.3 KB — must come down. Aim materially under 200, not exactly at it.
2. **Do NOT "fix" length with `@import` and call it done.** Imports cost the same tokens. Token reduction MUST come from moving content to (a) skills (on-demand) or (b) `.claude/rules/*.md` with `paths:` frontmatter (path-scoped).
3. **Move the entire Orchestration Flow + Command Interface + Gate System sections out of CLAUDE.md.** These are multi-step procedures that only matter when orchestrating — exactly what Anthropic says belongs in skills/linked docs. The slash commands are already skills; CLAUDE.md restating them is duplicated context. Replace with a 2–3 line pointer to `docs/orchestration/` + `docs/INDEX.md`.
4. **Promote high-frequency, behavior-shaping rules to the TOP.** Commit-approval policy and the import/styling/TS bans are hit on nearly every turn — they must lead, not trail at line 200+. Orchestration prose (rarely relevant per-turn) must NOT sit above them.
5. **Keep the Reanimated 4 / react-native-svg gotchas** — these are non-obvious, compile-error-causing, hit on every animation edit, and qualify as "common gotchas / non-obvious behaviors" (Anthropic Include column). But consider relocating them to a `paths:`-scoped rule (`src/**/*.tsx`) so they load only when touching components — they cost ~70 lines today.
6. **Delete what a linter/tsc/hook already enforces.** The "Coding Conventions" bans (`no-restricted-imports`, no-hex, no-`any`, no-`StyleSheet.create`) are ESLint/tsc-enforced. Replace the prose with one line: "Run `npm run lint && npm run typecheck`; rules are enforced there." (HumanLayer: never send an LLM to do a linter's job.)
7. **Convert provenance/governance metadata + "last reviewed" notes to `<!-- HTML comments -->`** so they cost zero context tokens.
8. **Convert any "must happen every time" rule into a hook**, not a CLAUDE.md sentence. Candidate: the commit-approval gate (a PreToolUse hook on `git commit` is the only enforcement that actually holds). CLAUDE.md prose about it is advisory only.
9. **Move the entire "Dev Session / logs" runbook** (the Russian-language Metro/logcat workflow, ~40 lines) to a skill or `docs/ops/dev-session.md` — it is a procedure relevant only during live debugging, not every session.
10. **Establish a prune cadence.** Add a `<!-- reviewed: YYYY-MM-DD; re-review every 3–6 months / on major model release -->` marker. Anthropic's explicit recommendation.
11. **One source of truth per rule.** Audit for contradictions before/after the split (e.g., commit policy currently stated in two places — top governance + bottom Git Policy). Consolidate.
12. **Batch the rewrite into one edit** to avoid repeated prompt-cache invalidation.

---

## 8. Open Questions for the Human

1. **Skills vs. rules vs. linked-docs split for orchestration.** Orchestration flow/commands/gates are ~80 lines of the file. The slash commands already exist as skills. Do you want CLAUDE.md to retain a *minimal orchestration map* (so a fresh session knows the flow exists) or a bare pointer to `docs/orchestration/`? Trade-off: a pointer is cheapest but a brand-new session won't know orchestration exists until it reads the doc. Recommended: keep a 3–5 line map, link the rest.
2. **Reanimated/SVG snippets — keep inline or move to a path-scoped rule?** They violate "no code snippets" but are genuinely load-bearing (compile errors otherwise). Moving to `.claude/rules/reanimated.md` with `paths: ["src/**/*.tsx"]` keeps them out of every session yet present when editing components. Acceptable to you, or do you want them always-on?
3. **Russian-language Dev Session runbook.** Keep in CLAUDE.md, move to a skill, or move to `docs/ops/`? It is your personal workflow, not team-shared standards — Anthropic suggests personal workflow → `~/.claude/CLAUDE.md` or a skill, not project CLAUDE.md.
4. **Commit-approval enforcement.** Do you want a real PreToolUse hook blocking `git commit` without approval (deterministic), or keep relying on the advisory CLAUDE.md rule (which the docs say is not guaranteed)? Only product/owner can decide the friction trade-off.
5. **Is `.claude/rules/` adopted project-wide yet?** The plan's token-reduction strategy depends on it. If the team/CI isn't on a Claude Code version supporting `paths:` frontmatter, fall back to skills.

---

## 9. Knowledge Base Updates

Created `docs/superpowers/expert/_knowledge-base/claude-code-tooling.md` (no prior file). Seeded with generalized, reusable matrices:
- CLAUDE.md load-order + scope table
- Include / Exclude decision matrix (verbatim from Anthropic)
- Token-reduction lever ranking (skills > path-scoped rules > prune >> `@import` which does nothing)
- Mechanism-selection matrix (CLAUDE.md vs `.claude/rules/` vs skills vs hooks vs auto memory)
- The "size & adherence" hard numbers (< 200 lines official; < 60 root / < 300 ceiling per HumanLayer)
- `@import` / nested / compaction / HTML-comment mechanics
- Anti-pattern catalog with sources

All claims carry source URLs. No prior entries to strike through (new file).

---

## Summary for dispatcher

- **MUST constraints:** 12 (see §7).
- **Open questions for human:** 5 (see §8).
- **KB:** 1 file created (`claude-code-tooling.md`).
- **Headline finding:** current CLAUDE.md (241 lines / 10.3 KB) exceeds Anthropic's official < 200-line limit; the highest-value rules are buried at the bottom where adherence is worst; `@import` will NOT fix the token cost — only skills + path-scoped `.claude/rules/` will.
