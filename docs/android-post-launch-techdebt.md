# Android post-launch tech debt

From Play Console recommendations on release 1.0.0 (versionCode 110). Both are
**"Recommended"** (Usability), **not blockers** — they do not stop review or publishing.
Recorded here so #1 resurfaces at the next SDK upgrade.

## 1. Edge-to-edge (Android 15 / API 35) — address within ~1 year ⏳
Play nudges toward edge-to-edge display. It currently works via a temporary opt-out flag,
which Google will remove in API 36 (Android 16). Play requires bumping `targetSdk` roughly
yearly → when we're forced onto API 36 (~12 months), edge-to-edge becomes mandatory.

**Action:** mostly resolved upstream by upgrading Expo SDK (56 → 57 handle edge-to-edge
internally). `react-native-safe-area-context` already handles insets. At the next
`/sdk:upgrade`: rebuild, confirm the warning is gone, test on an Android 15 device that
content doesn't sit under the status/navigation bars.

## 2. Large screens / orientation — optional (product decision) 🤷
App is locked to portrait (`app.json` `orientation: "portrait"`, `supportsTablet: false`).
No hard deadline; only affects featuring/ranking for tablets, foldables, ChromeOS.
Revisit **only if** we decide to target large screens — a significant layout rework
(landscape + responsive layouts). Otherwise fine to stay a portrait phone app indefinitely.
