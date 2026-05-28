# /git:commit

Create a git commit for all staged/unstaged changes in the working tree.

## Steps

### 1. Read the skill
The `.claude/skills/git-commit/SKILL.md` file defines all commit conventions
for this project. Apply them throughout this command.

### 2. Gather context (run in parallel)

```bash
git status --short
git diff HEAD
git log --oneline -5
```

### 3. Safety checks — STOP if any condition is true

- `.env.local` is staged → unstage it, warn the user, abort
- `node_modules/` files are staged → unstage them, warn, abort
- Working tree is completely clean → report "nothing to commit" and stop

### 4. Analyse the diff

Group changed files by feature area using the scope labels from the skill:
- Which scopes are touched?
- Is this single-scope or multi-scope?
- What is the dominant type: feat / fix / refactor / chore / docs / anim?

### 5. Draft the commit message

Apply the conventions from the skill:
- Subject: `<type>(<scope>): <subject>` — imperative, ≤ 72 chars
  - Omit scope parentheses if more than 3 scopes are touched
- Body: only if subject alone is insufficient
  - Single-feature: short paragraph + bullets
  - Multi-feature: `## Feature name` headers
- Final line: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

### 6. Stage and commit

Stage all tracked modified files and all untracked files **except**:
- `.env.local`, any `*.env` with real values
- `node_modules/`, `.expo/`, build artefacts

```bash
git add <specific files>
git commit -m "$(cat <<'EOF'
<subject line>

<body if needed>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### 7. Report

Output:
- Commit hash (short)
- Subject line
- Files committed (count)
- Any files intentionally left unstaged and why
