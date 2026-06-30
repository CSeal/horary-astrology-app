# Live store-metadata audit — App Store Connect + Google Play

*Pulled live via `app-publish-mcp` (read-only) and the two compliance scanners on 2026-06-30.
Re-run anytime with `npm run store-compliance -- --live`.*

App: **Hora: Horary Astrology Chart** · Apple App ID `6784362149` · Android `io.hora.app` ·
iOS version `1.0` (PREPARE_FOR_SUBMISSION) · Age 4+.

## Tooling

| Side | Tool | Command |
|---|---|---|
| Apple | greenlight (RevylAI, MIT) | `greenlight scan --app-id 6784362149 --tier 1` |
| Google | gpc (yasserstudio, MIT) | `gpc listings analyze` |
| Both, gated | `scripts/store-compliance.js` | `npm run store-compliance -- --live` |

> Auth: greenlight reads `~/.greenlight/config.json` (ASC API key `8NQS9JA767`); gpc uses the
> Play service account (`service-account.json`) + `gpc config set app io.hora.app`.

## Completeness — text metadata is 100% filled, both stores, 7 locales

**Apple (name·subtitle·description·keywords·privacy URL):** 7/7, all within limits.
**Google (title·short·full description):** 7/7, all `✓ valid` (gpc, char-accurate).

Near-limit (good ASO, not errors): Google en title 93%, de shortDescription 96%; Apple es subtitle 30/30.

## Fixes applied this pass

- ✅ **Apple Support URL** — was missing in all 7 locales (a submission blocker, §1.5). Created a real
  support page (`docs/support.md` → `https://cseal.github.io/horary-astrology-app/support.html`, live
  200) and set `supportUrl` on all 7 version localizations via MCP.
- ✅ **app.json** — added `expo.description` (cleared greenlight §2.3 metadata finding).
- ✅ **APP_STORE_ID** — `src/constants/config.ts` `'000000000'` → `'6784362149'` (fixes the in-app
  "rate us" / share-to-store deep links).
- ✅ **GitHub Pages root 404** — added `docs/landing.md` → `index.html`.

## Important tool caveat — greenlight byte-counts non-Latin text

greenlight's length checks count **UTF-8 bytes, not characters**, so it falsely reports ru/uk
description/keywords as "over limit" (e.g. ru keywords flagged at 160 — actually **85 chars**, within
the 100 limit; ru description "5578" is ~3111 chars per gpc). `store-compliance.js` **suppresses these
with a documented reason**. Trust **gpc / character count** for length on non-Latin locales, not greenlight.

## Remaining blockers (not metadata — assets + build)

| # | Store | Blocker | Owner action |
|---|---|---|---|
| 1 | Apple | Screenshots (0) — need ≥1 set (6.9"/6.5") | `horary-screenshots-agent` pipeline |
| 2 | Apple | No build uploaded | iOS archive → upload IPA |
| 3 | Google | Feature graphic (1024×500) + screenshots (≥2) + icon (512×512) | generate + upload |

After this pass the live gate (`--live`) went from **9 → 2 blocking findings** (both Apple
asset/build); Google live listing is clean.

## Not done (optional, recommended)

- Apple `promotionalText` (≤170, free ASO, editable without review) — empty in all 7. New copy in 7
  languages; hold for a deliberate ASO pass.
- Apple en-US `whatsNew` — empty, and **cannot** be set for a first release (Apple 409 STATE_ERROR);
  not required for v1.0.
