---
created_by: claude-opus-4-8
updated_by: claude-opus-4-8
source_inputs: [docs/viral-features-spec.md, docs/prd-v1.md FR-G01, src/app/(tabs)/result/[id]/index.tsx]
reviewed_by: owner-pending
stage: Phase1.5-Growth
status: DEFERRED — implement at first dev build
---

# FR-G01 — Share Verdict as Image Card (DEFERRED to dev build)

## Why deferred

G01 needs **two native dependencies** (`react-native-share`, `react-native-view-shot`)
and an **iOS Info.plist change** (`LSApplicationQueriesSchemes`). These cannot run in
Expo Go and the Instagram Stories URL scheme **only works on a physical device** —
the iOS Simulator silently no-ops it. So G01 is split out from the JS-only growth
batch (G02 review prompt + G03 invite, already shipped) and implemented at the first
EAS dev build.

Full design + share-card visual layout: **`docs/viral-features-spec.md` Feature 1**.

## Prerequisites (do at dev-build time)

```bash
npx expo install react-native-share react-native-view-shot
```

| Dependency | Version | Purpose |
|---|---|---|
| `react-native-share` | `^10.x` (New Arch compatible) | Instagram Stories + system share sheet |
| `react-native-view-shot` | SDK 55 bundled | `captureRef()` → PNG of off-screen card |

`app.json` → add to `ios.infoPlist`:
```json
"LSApplicationQueriesSchemes": ["instagram-stories"]
```
Required so `canOpenURL('instagram-stories://share')` returns the correct boolean.
After installing native deps, rebuild the dev client (`eas build --profile development`).

## Files to create

1. **`src/components/ShareVerdictCard.tsx`** — off-screen card (1080×1920), never visible
   in the main tree. Mounted only during capture, positioned `{ position:'absolute',
   left:-9999, top:-9999, width:1080, height:1920 }`. Props: `{ verdict, question, confidence }`.
   - Truncate `entry.question` to 40 chars + `…` (consent model: sharing is explicit).
   - Brand footer + CTA "Ask yours: hora.app".
2. **`src/services/shareVerdictService.ts`** — `captureRef` → temp PNG → Instagram Stories
   (via `react-native-share` `Share.shareSingle({ social: Social.InstagramStories, ... })`)
   with system-share-sheet fallback (`expo-sharing` / `react-native-share` open).
   Background gradient colors: `backgroundTopColor:'#070714'`, `backgroundBottomColor:'#12102A'`.

## Files to modify

- **`src/app/(tabs)/result/[id]/index.tsx`** — activate the share affordance:
  - Mount `<ShareVerdictCard>` off-screen as a sibling of the ScrollView (capture ref).
  - Add a `Share2` (lucide) icon button in the nav row, **top-right** (the C+ nav row
    currently has only the `← Journal` button on the left — the right slot is reserved
    for this). Use `justify-between` on the nav row.
  - onPress → `shareVerdictService.shareVerdict(cardRef, entry.question, entry.verdict)`.
  - On error → show a `Banner` with `t('share.error')`.

## i18n keys to add (all 6 locales)

```
share.button           = "Share"
share.error            = "Could not share the reading. Please try again."
share.instagramSuccess = "Opening Instagram Stories…"
```

## Acceptance (PRD FR-G01)

- [ ] Share button visible on the verdict screen (top-right of nav)
- [ ] Tapping it captures the off-screen card and opens Instagram Stories when available
- [ ] Falls back to the native share sheet otherwise
- [ ] Card contains: verdict type, question excerpt (40 chars max), app name
- [ ] **Tested on a physical iOS device** (Simulator cannot exercise the IG URL scheme)

## Notes

- Android Instagram path is deferred to Phase 2 — system share sheet covers Android.
- The verdict screen nav already leaves the right side empty by design specifically so
  this button drops in without a layout rework.
