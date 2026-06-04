---
name: store-finalize
description: >
  Fill all store-submission placeholders, run icon/privacy scripts, add Settings
  disclaimer, then commit. Run once before the first App Store / Play Store upload.
  Requires: App Store Connect account exists, contact email, debug PIN.
version: 1.0.0
---

# /store:finalize — Store Submission Finalization

Completes the submission artifacts created by Stage 6b (`/orchestrate:store-prep`).
Collects owner-supplied values, fills all placeholders, runs build scripts, patches
the Settings screen, then proposes a commit.

**Run this once, before the first upload to App Store Connect / Play Console.**

---

## Step 1 — Prerequisites check

Verify these files exist (created by Stage 6b):
- `docs/privacy-policy.md`
- `docs/reviewer-notes.md`
- `docs/play-data-safety.md`
- `docs/store-drafts/en.md`
- `scripts/generate-icon.js`
- `scripts/build-privacy.js`

If any are missing: stop and report "Run /orchestrate:store-prep first."

Check `docs/privacy-policy.md` for the string `[OWNER_EMAIL]`.
If NOT found (already replaced): warn "Looks like /store:finalize was already run.
Placeholders appear filled. Continue anyway? (yes/no)" — stop if user says no.

---

## Step 2 — Interview the owner (3 questions)

Ask all 3 in a SINGLE message using AskUserQuestion tool with 3 questions:

Q1 header: "Contact email"
  question: "What email should appear in the privacy policy as the contact address?"
  options: provide a text-input style (use "Other" option to let user type freely)
  — ideally use the user's email from memory if available: 19mann84@gmail.com
  — if that matches, offer it as the first option

Q2 header: "Debug PIN"
  question: "What 4-6 digit PIN should reviewers use to unlock Mock Mode? (Entered after tapping the version label 20 times.)"
  options: "1234 (simple, reviewer-friendly)", "0000", "I'll enter a custom PIN as Other"

Q3 header: "GitHub username"
  question: "What is your GitHub username? Used to generate the Privacy Policy URL (https://<username>.github.io/<repo>/privacy-policy.html)."
  options: provide 2-3 common options or let user type via Other

---

## Step 3 — Derive Privacy Policy URL

Read `package.json` → extract the `"name"` field (repo slug).
Construct: `https://<github_username>.github.io/<repo_name>/privacy-policy.html`

If Q3 was skipped: use placeholder `[GITHUB_USERNAME]` and note it in the report.

---

## Step 4 — Fill placeholders

Replace in files (use Edit tool):

| Placeholder | Value | Files |
|---|---|---|
| `[OWNER_EMAIL]` | Q1 answer | `docs/privacy-policy.md` |
| `[DEMO_PIN]` | Q2 answer | `docs/reviewer-notes.md` |
| `[PRIVACY_POLICY_URL]` | derived in Step 3 | `docs/reviewer-notes.md`, `docs/play-data-safety.md` |

If any answer was "skip": leave the placeholder as-is and add it to the
"remaining manual actions" list in the final report.

---

## Step 5 — Run build scripts

```bash
npm install
npm run generate:icon
npm run build:privacy
```

Report output of each. If `generate:icon` fails (e.g. canvas/sharp error on this
machine): note it as a manual action — "Run `npm run generate:icon` on a machine
with native canvas support or in CI."

---

## Step 6 — Add entertainment disclaimer to Settings screen

Read `docs/reviewer-notes.md` — find the "Entertainment Disclaimer" section (Section 2).
Extract the exact disclaimer text.

Read `src/app/(tabs)/settings.tsx`.
Find the bottom of the screen content (before the closing ScrollView/View).

Add a disclaimer text block using existing conventions:
- `Text` from `@/tw`
- `className="font-inter text-xs text-text-secondary text-center px-4 mt-6 mb-2"`
- Content: the disclaimer text from reviewer-notes.md
- Wrap in `t('settings.disclaimer')` — add the i18n key to `en.ts` and `ru.ts`
  (Russian: same meaning, translated)
- Add to all other locale files (de/fr/es/pt) with English fallback

Run `npm run typecheck && npm run lint` — fix any errors before continuing.

---

## Step 7 — Update src/constants/config.ts if APP_STORE_ID still placeholder

Read `src/constants/config.ts`. Check if `APP_STORE_ID` is still `'000000000'`.
If yes: note in the report "APP_STORE_ID is still a placeholder — update it in
src/constants/config.ts once the app is registered in App Store Connect."
Do NOT change this value — it requires a real numeric ID from App Store Connect.

---

## Step 8 — Final verification

```bash
npm run typecheck
npm run lint
npm run test
```

All must be green. Report results.

---

## Step 9 — Diff + commit proposal

Run `git diff --stat` and show to owner.

Propose commit message:
```
chore(store): finalize submission artifacts — fill placeholders, add disclaimer

- Fill [OWNER_EMAIL], [DEMO_PIN], [PRIVACY_POLICY_URL] in
  docs/privacy-policy.md, docs/reviewer-notes.md, docs/play-data-safety.md
- Add entertainment disclaimer to Settings screen (i18n: en + ru + fallbacks)
- Run generate:icon → assets/icon.png + assets/adaptive-icon.png
- Run build:privacy → public/privacy-policy.html

typecheck ✓ lint ✓ jest N/N ✓

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Wait for explicit owner approval before running `git commit`. Do NOT commit automatically.**

---

## Final report to owner

After commit (or if deferred):

### ✅ Done
List everything completed.

### ⚠️ Remaining manual actions (if any skipped answers)
- Replace remaining `[PLACEHOLDER]` values
- `APP_STORE_ID` in `src/constants/config.ts` (needs App Store Connect)

### 🚀 Next: Upload to stores
1. `git push` → GitHub Actions deploys privacy policy to Pages (check Actions tab)
2. App Store Connect: create app → fill metadata from `docs/store-drafts/en.md`
3. Upload screenshots (run `/orchestrate:screenshots` for automated capture — needs dev build)
4. Fill Apple Privacy Labels from `docs/apple-privacy-labels.md`
5. Submit for review

### Play Store
1. Google Play Console: create app → fill metadata from `docs/store-drafts/en.md`
2. Fill Data Safety form from `docs/play-data-safety.md`
3. Upload APK/AAB (EAS Build)
4. Submit for review
