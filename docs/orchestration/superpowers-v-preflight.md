# superpowers-v Preflight

## Installation
Run in Claude Code:

```text
/plugin marketplace add https://github.com/procoders/superpowers-v
/plugin install superpowers-v@procoders
```

Recommended:

```text
/plugin install context7@claude-plugins-official
```

## Verification
- Open a new Claude Code session.
- Confirm session banner indicates `superpowers-v` is loaded.
- Run `/mcp` and confirm `context7` is connected.

## Smoke Checks
1. Trigger 1:
   - Run a small spec/brainstorming handoff.
   - Confirm outputs exist in:
     - `docs/superpowers/archaeology/`
     - `docs/superpowers/expert/`
     - `docs/superpowers/library-audit/`
2. Trigger 2:
   - Validate partition review runs and disjoint partition map passes.
3. Trigger 3:
   - Validate dispatch starts and reviewer loop is created.

## Fallback
- If Trigger 1 does not auto-fire:
  - run `/v:archaeology <topic>`
- If dispatch flow fails:
  - run `/v:dispatch <plan-path>`

## Critical Escalation (owner approval required)
- core-file partition conflicts
- repeated failure after fallback
- any provenance or Claude-only violation
