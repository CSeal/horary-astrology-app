---
name: git-commit
description: >
  AstraSk commit conventions — message format, body structure, scope labels,
  what to include/exclude, and multi-feature body templates.
  Activate whenever creating a git commit in this project.
version: 1.0.0
---

# Git Commit Conventions — AstraSk

## Commit message structure

```
<type>(<scope>): <subject>          ← max 72 chars, imperative mood

<body>                              ← blank line after subject
                                    ← wrap at 80 chars
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

---

## Type labels

| Type | Use when |
|---|---|
| `feat` | new feature or capability visible to users or QA |
| `fix` | bug fix (regression, crash, wrong behaviour) |
| `refactor` | restructure with no behaviour change |
| `style` | formatting, NativeWind className tweaks, no logic |
| `test` | add or fix tests only |
| `docs` | docs/, CLAUDE.md, README only |
| `chore` | build config, deps, package.json, EAS config |
| `perf` | performance improvement without feature change |
| `anim` | animation-only change (Reanimated SharedValues, transitions) |

---

## Scope labels (optional, in parentheses)

| Scope | Files |
|---|---|
| `ask-flow` | AskForm, useHoraryQuery, index.tsx |
| `journal` | journal.tsx, JournalItem, questionsStore |
| `result` | result/[id].tsx, VerdictCard, SignificatorRow |
| `settings` | settings.tsx, settingsStore, secureKeyService |
| `onboarding` | onboarding.tsx |
| `debug` | debugStore, DebugSheet, useDebugTrigger, mockHoraryApi |
| `location` | useLocation, LocationPickerSheet, geocodingService |
| `force-update` | ForceUpdateScreen, updateCheckService, _layout |
| `animations` | any Reanimated SharedValue additions |
| `i18n` | en.ts, ru.ts |
| `config` | config.ts, theme.ts, app.json |
| `deps` | package.json, package-lock.json only |

---

## Subject line rules

- Imperative mood: "add", "fix", "remove" — NOT "added", "fixes", "removing"
- No capital first letter after the colon
- No period at the end
- ≤ 72 chars total (type + scope + subject)
- Describe WHAT changes, not WHY (why goes in the body)

```
✅  feat(location): add Photon geocoding bottom sheet for manual override
✅  fix(debug): reset tap counter when window expires after 3s
✅  chore(deps): upgrade @gorhom/bottom-sheet to 5.2.6

❌  feat: Added the location feature
❌  Fixed a bug with debug mode.
❌  WIP
```

---

## Body guidelines

Write a body whenever:
- The subject line cannot capture all changed areas (multi-feature commit)
- A non-obvious architectural decision was made
- A library-level constraint drove the implementation

### Single-feature body

```
Short paragraph on what changed and the key decision.

- bullet point for each non-obvious detail
- mention any constraint that forced the approach
```

### Multi-feature body (use ## headers)

```
## Feature name

One-paragraph summary.

- key implementation detail
- key constraint or gotcha

## Second feature

...
```

---

## What to ALWAYS include

- All `src/` changes for the feature
- Paired `src/i18n/en.ts` + `src/i18n/ru.ts` changes
- Feature docs in `docs/features/`
- Updated `docs/INDEX.md`
- `package.json` + `package-lock.json` if deps changed
- `.env.local.example` if a new env var was added

## What to NEVER commit

| File | Reason |
|---|---|
| `.env.local` | Contains secrets (gitignored) |
| `*.env` with real values | Secrets |
| `node_modules/` | Build artifact |
| `.expo/` cache | Build artifact |

---

## Co-author line

Every Claude-assisted commit ends with:

```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Update the model name if the active model changes (e.g. `Claude Opus 4.7`).

---

## One-commit-per-session rule

Prefer batching all work from a single coding session into **one commit** unless:
- Two changes are entirely independent and deployed at different times
- A hotfix must be cherry-picked separately
- A dependency-only bump needs isolation
