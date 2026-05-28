# Feature: Force Update Gate

**Status:** Implemented (Stage 5 — Cleanup)
**Created by:** claude-sonnet (2026-05-26)

Forces users with an outdated native build to update before they can use the app.
Reads a remote JSON config, compares against the installed version via semver, and blocks the UI if the installed version is below the minimum.

---

## How it works

```
App boot → checkForUpdate()
               │
               ├─ fetch remote config (3s timeout)
               │     ├─ success → write to AsyncStorage cache (TTL 30 min) → use it
               │     └─ failure → read AsyncStorage cache (if fresh) → use it
               │                       └─ cache stale or absent → fail-open (null)
               │
               └─ compare current version vs minVersion (semver)
                     ├─ current < min → UpdateCheckResult { required: true, storeUrl }
                     └─ current >= min → UpdateCheckResult { required: false }
                     └─ null (fail-open) → no gate shown
```

**Fail-open:** if the remote endpoint is unreachable AND the cache is empty or expired, `checkForUpdate()` returns `null` and the gate is never shown. This prevents false-blocks on first launch in areas without connectivity.

**`__DEV__` skip:** the service returns `null` immediately in development builds because `nativeApplicationVersion` is `null` in Expo Go.

---

## Source files

| File | Role |
|---|---|
| [src/services/updateCheckService.ts](../../src/services/updateCheckService.ts) | Fetch, cache, and compare logic |
| [src/components/ForceUpdateScreen.tsx](../../src/components/ForceUpdateScreen.tsx) | Non-dismissible blocking UI |
| [src/constants/config.ts](../../src/constants/config.ts) | `UPDATE_CONFIG_URL`, `ASYNC_STORAGE_KEYS.UPDATE_CONFIG_CACHE` |
| [src/app/_layout.tsx](../../src/app/_layout.tsx) | Wires the check into boot sequence, renders the screen |
| [src/i18n/en.ts](../../src/i18n/en.ts) | `forceUpdate.title / body / cta` |
| [src/i18n/ru.ts](../../src/i18n/ru.ts) | `forceUpdate.title / body / cta` |

---

## Remote config JSON format

```json
{
  "ios": {
    "minVersion": "1.0.0",
    "storeUrl": "itms-apps://apps.apple.com/app/idXXXXXXXXX"
  },
  "android": {
    "minVersion": "1.0.0",
    "storeUrl": "market://details?id=com.yourcompany.astrask"
  }
}
```

`minVersion` uses semantic versioning. `semver.coerce()` is applied so "1.0", "1.0.0.1" (EAS auto-bump), and "1" all parse correctly.

`storeUrl` supports both native deep-link schemes (`itms-apps://`, `market://`) and HTTPS fallbacks (tried automatically if the deep-link fails to open).

---

## Where to host the config

**Recommended: GitHub Gist** (free, instant update, no server needed)

1. Create a public Gist at [gist.github.com](https://gist.github.com) with filename `update-config.json`
2. Open the Gist → click **Raw** → copy the URL:
   ```
   https://gist.githubusercontent.com/19mann84/<HASH>/raw/update-config.json
   ```
3. Set in `.env.local` (local dev / testing):
   ```
   EXPO_PUBLIC_UPDATE_CONFIG_URL=https://gist.githubusercontent.com/...
   ```
4. Set in EAS secrets for production builds.

---

## Lifecycle: what to do at each stage

### Before first release (current state)
`EXPO_PUBLIC_UPDATE_CONFIG_URL` is not set → `UPDATE_CONFIG_URL = ''` → service returns `null` immediately → **gate never shown**. No action needed.

### When submitting v1.0.0 to the stores
1. Create the Gist (see above).
2. Set `minVersion` to `"1.0.0"` for both platforms — so no user is blocked immediately.
3. Add store URLs (get them after Apple / Google approves the app).
4. Set `EXPO_PUBLIC_UPDATE_CONFIG_URL` in EAS secrets before the production build.

### When releasing a breaking change (e.g., v1.2.0)
1. Build and submit `v1.2.0` to both stores.
2. Once the update is **live** in the stores, update the Gist:
   - `minVersion → "1.2.0"`
3. Users with `< 1.2.0` will see the force-update screen on next launch.

**Never bump `minVersion` before the new version is available in the stores.**

### EAS store URL format

iOS:
```
itms-apps://apps.apple.com/app/id<YOUR_APP_ID>
```
Get `<YOUR_APP_ID>` from App Store Connect → App Information.

Android:
```
market://details?id=<YOUR_BUNDLE_ID>
```
Bundle ID is set in `app.json` → `expo.android.package`.

---

## Cache behavior

| Scenario | Result |
|---|---|
| Fresh fetch succeeds | Uses fresh data, writes to cache |
| Fresh fetch fails, cache fresh (< 30 min) | Uses cached data |
| Fresh fetch fails, cache stale (> 30 min) | Fail-open (no gate) |
| No cache at all | Fail-open (no gate) |
| `__DEV__` mode | Always skip (returns null) |

Cache TTL is defined in `updateCheckService.ts` as `CACHE_TTL_MS = 30 * 60 * 1000`.

---

## Testing the gate manually

To test the force-update screen without a real store mismatch:

1. Temporarily edit `updateCheckService.ts` → `checkForUpdate()` → return a hardcoded result:
   ```ts
   return { required: true, storeUrl: 'https://example.com' };
   ```
2. Run `npx expo start` → the screen should appear after the splash.
3. Revert before committing.

The screen is not tested by automated Jest tests (UI component with animation). Covered by manual smoke test.
