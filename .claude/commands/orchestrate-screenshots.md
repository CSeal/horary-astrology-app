## Stage 6c — Automated Screenshot Pipeline

Builds the screenshot automation infrastructure. Run after Stage 6b COMPLETE.
Owner runs the actual capture script on their machine after this completes.

### Prerequisites check
1. Read docs/orchestration/handoff-log.md — verify Stage6b-StoreProp COMPLETE
2. Verify react-native-view-shot is installed (installed in Phase 1.5 G4 ShareVerdictCard task)
3. If not installed: note in prompt for agent to install via npx expo install

### Launch sub-agent
Call Agent:
- subagent_type: "horary-screenshots-agent"
- model: "sonnet"
- prompt: "Run Stage 6c — build screenshot automation pipeline. Today's date: [current date]. Read docs/store-drafts/ for screenshot content per locale. React-native-view-shot should already be installed from Phase 1.5; if not, install it."

Wait for completion. Read handoff-log.md — confirm Stage6c-Screenshots COMPLETE.

### After completion
Report to owner:
1. Infrastructure created:
   - src/stores/debugStore.ts (screenshotMode + screenshotLocale flags)
   - src/constants/screenshotMockData.ts (impressive mock data for all screens)
   - src/app/screenshot-runner.tsx (automation screen)
   - scripts/capture-screenshots.sh (run on your machine)
   - docs/screenshots-guide.md (full instructions)
2. To generate screenshots:
   - Start iOS Simulator: iPhone 15 Pro Max
   - Run: `npm run screenshots`
   - Find output in `screenshots/<locale>/` folders (30 files: 6 locales × 5 screens)
3. Upload to App Store Connect → App → iOS App → [Version] → Screenshots → each locale

### Commit (owner approval required)
Run `git diff --stat` and show output to owner.
Propose commit message following AstraSk conventions (see `.claude/skills/git-commit/`).
**Wait for explicit owner approval before running `git commit`. Do NOT commit automatically.**
