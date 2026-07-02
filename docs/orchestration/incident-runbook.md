# Incident Runbook — Critical Bug in a Live or Submitted Build

Written after the 2026-07-02 API-key-leak incident (full story: `handoff-log.md` →
`Stage-Incident-APIKeyLeak`). Use when a bug is found in a build that's already **live** on a
store or **already submitted** for review, not a bug caught pre-release.

Nothing here replaces judgment — it's a checklist of steps that were easy to skip under time
pressure last time, not a script to follow blindly.

---

## 1. Diagnose with evidence, not assumption

- Reproduce the actual failure before theorizing about the cause. If a first theory (e.g. "the
  public API is rate-limited") doesn't match the reported symptom (e.g. "fails even after
  waiting 20 minutes" — too long for a burst-window throttle), that mismatch is a signal to keep
  digging, not to round the symptom off to fit the theory.
- When a build/deploy script prints "✓ success," re-verify independently before trusting it for
  anything consequential — unzip the actual artifact, grep for the actual value, don't trust the
  script's own echo. This is how the API-key leak AND a second build-number bug were both caught
  before shipping — the second one only surfaced because the first fix's own output got
  re-checked instead of trusted.
- If you get an ambiguous exit code (e.g. success output but a non-zero exit), don't assume
  either "it's fine" or "it failed" — independently re-verify the actual output artifact.

## 2. Assess real exposure before reacting

- Live and downloadable ≠ submitted-but-in-review ≠ internal-testing-only. Confirm which one you
  actually have (ask the owner directly if uncertain — "how did you install it?" is diagnostic).
- Resist the urge to immediately halt/pull a live listing as a first reaction. Halting a
  100%-rolled-out (non-staged) release has unclear platform-specific semantics and its own
  reversal cost; it rarely buys more than just shipping the fix fast does. Only pull a listing if
  the fix will genuinely take a long time and the bug is actively harmful (not just degraded).

## 3. Fix, then build a regression guard for the same bug class

A point fix alone lets the same class of bug recur next release. Bake a structural check into
the build pipeline itself:
- Secrets in `.env.local` embedding into a release bundle → make the release script physically
  unable to read dev-only env files (stash-and-restore, not just `unset` — env loaders often
  read config files straight off disk regardless of the calling shell's env).
- Add a post-build assertion that fails the script loudly if the specific bad pattern is found in
  the output artifact — cheap insurance, catches the exact same mistake next time.

## 4. Version bump discipline (needed for force-update)

If the fix needs to distinguish "old broken" from "new fixed" installs (for force-update or just
for your own sanity), the **marketing version must actually change** — a same-version rebuild
with only a new internal build number won't let semver-based force-update logic tell them apart.
Verify the bump actually reached the compiled binary (`CFBundleShortVersionString` /
`versionName`), not just the source config — Expo's prebuild can silently default fields like
`ios.buildNumber` if never explicitly set, independent of what a build script's CLI flags intend.

## 5. Rebuild, verify clean, decide rollout %

- 100% immediate rollout is usually right when the current release is broken for essentially
  everyone — a staged rollout just leaves some fraction of users stuck on the broken build for
  no benefit.
- Staged rollout is right when the fix itself carries meaningful residual risk and you want a
  canary before full exposure.

## 6. Platform-specific resubmission quirks

**Android (Google Play):** updates to an already-published app go through the normal
edit → upload → release flow. Remember the edit must be explicitly `validate` + `commit` — 
nothing publishes until `commit_edit`, regardless of whether a task description enumerates that
step.

**iOS (App Store Connect):** if a version is already `WAITING_FOR_REVIEW`, you generally cannot
create a second parallel version (Apple returns 409 until the current one reaches
`READY_FOR_SALE`). Cancel the pending submission instead (moves it to `DEVELOPER_REJECTED` —
normal, editable, not an error) and reuse the same version record; Apple did NOT require the
version's `versionString` to match the new build's internal version at assignment time in
practice. Re-submitting after a cancel can hit unclear `403`/`409` state errors with no
API-exposed way to list or force-delete the underlying submission resource — budget for a
**manual App Store Connect web-UI click** as the fallback rather than continuing to guess against
a production Apple account. Apple's own build-processing (upload → queryable/`VALID`) is
asynchronous and can lag the upload confirmation by several minutes — an immediate poll can show
stale state; wait before concluding something failed.

**Waiting on external async state:** a bare `sleep N` run with `run_in_background: true` works
and produces a completion notification; a chained `sleep N && next-command` is blocked outright.
If delegating a "poll until ready" task to a sub-agent, be explicit that it must issue its own
wait commands directly — a sub-agent asked to "poll every 60-90s" can get confused about how to
actually wait inside its own execution and stall instead of completing.

## 7. Force-update coordination — per platform, only once confirmed live

The two platforms' minVersion flags in `docs/app-version.json` are independent — flip Android's
the moment Android is confirmed live, without waiting on iOS's slower review cycle, and vice
versa. Never flip a platform's minVersion before that platform's fix is actually approved and
live — there'd be no valid update to send gated users to.

## 8. Close the loop

- Update `docs/orchestration/handoff-log.md` with what actually happened (even retroactively,
  condensed is fine — a stale log is worse than a slightly-late one).
- Update persistent memory with anything non-obvious a future session would otherwise rediscover
  the hard way.
- If this runbook was missing a step you needed, add it here.
