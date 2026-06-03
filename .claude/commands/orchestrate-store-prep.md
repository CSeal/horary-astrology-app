## Stage 6b — App Store / Google Play Submission Preparation

Produces all submission-critical documents. Runs after Stage 6a QA is COMPLETE.
Must run BEFORE App Store Connect submission.

### Prerequisites check
1. Read docs/orchestration/handoff-log.md — verify Stage6-QA COMPLETE
2. Read docs/aso-final.md — verify owner-approved metadata exists
3. If aso-final.md missing: stop and report "Run /orchestrate:aso first to approve metadata."

### Launch sub-agent
Call Agent:
- subagent_type: "horary-store-prep-agent"
- model: "sonnet"
- prompt: "Run Stage 6b — produce all App Store submission documents. Today's date: [current date]. Owner must fill: demo API key in reviewer-notes.md ([DEMO_API_KEY]), contact email in privacy-policy.md ([OWNER_EMAIL]), privacy policy URL after GitHub Pages deploy ([PRIVACY_POLICY_URL])."

Wait for completion. Read handoff-log.md — confirm Stage6b-StoreProp COMPLETE.

### After completion
Report to owner:
1. Documents created: privacy-policy.md, apple-privacy-labels.md, play-data-safety.md, reviewer-notes.md, store-drafts/ (6 locales: en/ru/de/fr/es/pt), app-icon-spec.md, scripts/generate-icon.js, scripts/build-privacy.js, .github/workflows/deploy-privacy.yml
2. Items requiring owner action (blockers for submission):
   - [ ] Run `npm run generate:icon` → verify assets/icon.png visually
   - [ ] Run `npm run build:privacy` → public/privacy-policy.html generated
   - [ ] `git push` → GitHub Actions deploys privacy policy to GitHub Pages
   - [ ] Insert privacy policy URL into docs/reviewer-notes.md ([PRIVACY_POLICY_URL])
   - [ ] Insert demo API key into docs/reviewer-notes.md ([DEMO_API_KEY])
   - [ ] Insert contact email into docs/privacy-policy.md ([OWNER_EMAIL])
   - [ ] Review entertainment disclaimer text in docs/reviewer-notes.md
3. "When all owner actions complete → proceed to App Store Connect + Play Console submission."

### Commit (owner approval required)
Run `git diff --stat` and show output to owner.
Propose commit message following AstraSk conventions (see `.claude/skills/git-commit/`).
**Wait for explicit owner approval before running `git commit`. Do NOT commit automatically.**
