# Mobile Remote Config Knowledge Base

Maintained by Compound V Phase 1B advisor. Append at the bottom on each pass.

---

## Seeded 2026-05-26 — Remote-config source choice for MVPs

### Decision tree for "where do I store app config / feature flags / kill switches?"

```
no backend yet?
├─ need real-time? need targeting by OS/version/locale? need analytics?
│  └─ yes → Firebase Remote Config (free tier)
│  └─ no  → hosted JSON on CDN (Cloudflare R2, S3 + CloudFront)
└─ have backend?
   └─ probably roll your own /config endpoint with ETag caching
```

### Comparison table

| Source | Cost (MVP scale) | Real-time | Targeting | Analytics | Backend needed | Russia-reachable | Setup cost |
|---|---|---|---|---|---|---|---|
| **Firebase Remote Config** | Free | Yes (SDK ≥ 10.7) | Yes (OS, version, locale, %, custom) | Yes | No | Intermittent (RU blocks since 2022) | ~1 hr |
| **Hosted JSON (CDN)** | ~$0 | No | No | No | Just static hosting | Yes (CF/BunnyCDN) | ~30 min |
| **GitHub Gist** | Free | No | No | No | No | Yes | 5 min |
| **AWS AppConfig** | Free tier 1000 req/mo, then $0.20/M | Yes (poll) | Yes | Yes | No | Yes | ~2 hr |
| **LaunchDarkly / Flagsmith / Statsig** | Free tier limited, then $$ | Yes | Yes (very rich) | Yes | No | Yes | ~1 hr |
| **Backend `/config` endpoint** | Server cost | Yes (poll/SSE) | Custom | Custom | Yes | Yes | Days |

### Firebase Remote Config — gotchas

- **Default `minimumFetchIntervalInSeconds` is 12 hours.** Set to `0` for force-update use case (cold start, want freshest) or risk users blocked on stale "min version" for half a day. ([Firebase loading docs](https://firebase.google.com/docs/remote-config/loading))
- **Throttling: server may return `RemoteConfigFetchStatus.throttle`.** Rare in production but real during dev ([Firebase issue #5908](https://github.com/firebase/firebase-android-sdk/issues/5908)).
- **`fetchAndActivate()` does not always honor `minimumFetchInterval`** ([iOS issue #4740](https://github.com/firebase/firebase-ios-sdk/issues/4740)) — quirky on iOS especially. Test on both platforms.
- **Real-time listener (`addOnConfigUpdateListener`)** propagates server changes in seconds; useful for kill-switch scenarios.
- **GDPR:** Firebase RC alone does NOT collect PII; document in privacy policy that "Firebase is used for app configuration only."
- **Russia:** Firebase services have been blocked / unreliable since 2022. If RU is in scope, design for fail-open.

### Hosted-JSON gotchas

- **No SLA on Gist** — GitHub treats Gist as dev tool, not production CDN. Avoid for prod even MVP.
- **Cache-Control matters** — CDN-edge cache vs client cache vs `If-None-Match`. Set `Cache-Control: public, max-age=300` (5min) for force-update config.
- **Signed URLs / auth?** Force-update config is non-secret; serve unauthenticated.
- **CORS** if planning to read same config from a web companion — set `Access-Control-Allow-Origin: *`.

### Common patterns

1. **Bootstrap from cache, refresh in background**
   ```
   on launch:
     read cached config (last known good)
     show splash
     race(fetch_remote, timeout(3s)):
       if fetch wins → use fresh, update cache
       if timeout → use cached (fail-open)
     evaluate gate
     hide splash
   ```

2. **Three-tier version gate**
   ```json
   {
     "min_supported_version": "1.4.0",   // < this → hard block
     "recommended_version": "1.6.0",     // < this but ≥ min → soft nudge
     "latest_version": "1.6.0"            // FYI
   }
   ```

3. **Localized blocker messages in config** — lets product edit copy without a release.

### What NOT to do

- Don't put secrets in Remote Config or hosted JSON. It's client-readable.
- Don't poll every minute. Cache 30–60 min minimum.
- Don't fail-closed at launch without a fallback. App becomes unrecoverable.
- Don't trust the client clock — use server-supplied timestamps for "config last updated."
