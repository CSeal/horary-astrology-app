# Ops: Environment Variables & Secrets

**Status:** Current
**Created by:** claude-sonnet (2026-05-26)

All runtime secrets and feature flags are passed via environment variables prefixed `EXPO_PUBLIC_*`. They are bundled at build time by Expo — there is no runtime config injection.

---

## Variables reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `EXPO_PUBLIC_ASTROLOGY_API_KEY` | Yes (for verdicts) | `''` (will 401) | Default API key for `astrology-api.io`. Used as fallback if no personal key is stored in SecureStore. |
| `EXPO_PUBLIC_UPDATE_CONFIG_URL` | No | `''` (gate disabled) | URL of the remote JSON config for the force-update gate. Leave empty in development and pre-release. |

---

## Local development setup

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local`:
   ```env
   EXPO_PUBLIC_ASTROLOGY_API_KEY=your_key_here
   EXPO_PUBLIC_UPDATE_CONFIG_URL=
   ```

3. Never commit `.env.local` — it is in `.gitignore`.

4. `.env.local.example` is committed and shows required variable names with empty values.

---

## API key priority

The Axios request interceptor in `horaryApi.ts` resolves the API key in this order:

```
1. SecureStore('horary_api_key')          ← user's personal key from Settings
2. process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY   ← app default (from build env)
3. '' (empty string)                      ← results in HTTP 401
```

If a user sets their own key in Settings (Step 1), it always takes priority over the build default.

---

## Secrets rules

| Rule | Detail |
|---|---|
| API key never in AsyncStorage | Only SecureStore is used for the user's personal key |
| API key never logged | Interceptors must not log request headers |
| API key never in git | `.env.local` is gitignored; example file has empty values |
| `EXPO_PUBLIC_*` are public | These are bundled into the JS bundle — never put private-server secrets here |

---

## EAS (production builds)

For TestFlight and production builds, set secrets in EAS:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_ASTROLOGY_API_KEY --value "your_key"
eas secret:create --scope project --name EXPO_PUBLIC_UPDATE_CONFIG_URL --value "https://..."
```

Or configure them in the [EAS dashboard](https://expo.dev) under **Project → Secrets**.

Secrets set in EAS override any `.env.local` values at build time.

---

## Force-update config URL

See [docs/features/force-update.md](../features/force-update.md) for the full guide on:
- When to set this variable (not before first release)
- Where to host the remote JSON (GitHub Gist recommendation)
- JSON format and `minVersion` lifecycle

---

## Adding new env vars

1. Add to `.env.local.example` with an empty value and a comment.
2. Add to `src/constants/config.ts` with a fallback default.
3. Document here in this file.
4. Add to EAS secrets before the next production build.

**Never read `process.env.*` directly in components** — always go through `src/constants/config.ts` so there is a single place to trace all env usage.
