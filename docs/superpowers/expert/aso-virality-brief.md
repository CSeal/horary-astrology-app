# ASO + Virality Audit — Horary Astrology App

**Produced by:** Compound V Phase 1B Domain Expert  
**Date:** 2026-06-04  
**Spec scope:** App Store Optimization metadata rules, Instagram Stories share deep-link protocol, SKStoreReviewRequest system limits, review-prompt timing strategy, viral mechanics for prediction/fortune-telling apps.  
**Out of scope:** Pregnancy/fertility routing — see `docs/superpowers/expert/2026-06-03-fertility-routing.md`.

---

## 1. Domains Identified

1. **aso-ios** — App Store metadata policy (title/subtitle/keyword field character limits, prohibited content, section 4.3b spam/fortune-telling rule)
2. **social-share-instagram** — Instagram Stories URL scheme deep-link protocol (iOS pasteboard, Android Intent, Facebook App ID gate)
3. **in-app-review-ios** — SKStoreReviewController system throttle, expo-store-review wrapper, prompt timing best practices
4. **virality-prediction-apps** — Share-card mechanics, viral loop patterns observed in astrology/fortune apps

---

## 2. Sources Consulted

### KB files reused
- `docs/superpowers/expert/_knowledge-base/horary-astrology.md` — updated 2026-06-03; Apple 4.3b rejection evidence already captured there. Not re-researched.

### Web searches executed (all 2026-06-04)
1. App Store keyword field policy 2025/2026 title 30 chars subtitle 100 chars official
2. Apple App Store review guidelines ASO metadata 2026 keyword stuffing rejection
3. Instagram Stories deep link protocol instagram-stories://share parameters 2025/2026 developer
4. Instagram sharing sticker backgroundImage backgroundVideo stickerImage contentURL attribution link API 2025
5. SKStoreReviewRequest 3 per year limit iOS 2025/2026 requestReview throttle
6. expo-store-review usage SKStoreReviewRequest react native 2025/2026
7. In-app review prompt timing best practices astrology spiritual app 2025
8. Viral mechanics prediction fortune telling app growth 2025 share result deep link
9. site:reddit.com/r/astrology horary app review share viral 2024/2025 (no hits)
10. site:reddit.com/r/indiegaming OR r/SaaS fortune telling prediction app viral loop 2025 (no hits)
11. Co-Star NUMBERs astrology app virality share card screenshot ASO growth strategy 2025
12. Astrology app ASO keyword strategy 2025 horoscope App Store optimization
13. Instagram stories share react native expo iOS pasteboard UTTypePNG 2024/2025 implementation
14. Instagram stories deep link app not installed fallback web browser 2025
15. instagram stories share facebookAppId required whitelisted URL scheme info.plist LSApplicationQueriesSchemes 2024/2025
16. App Store 4.3b fortune telling divination app rejection 2025 unique experience what works
17. astrology app share card viral Co-Star pattern "share your reading" instagram stories 2024/2025

### Official / primary sources retrieved
- [Apple App Review Guidelines — fetched 2026-06-04](https://developer.apple.com/app-store/review/guidelines/)
- [SKStoreReviewController Apple Developer Docs](https://developer.apple.com/documentation/storekit/skstorereviewcontroller)
- [expo-store-review Expo Docs (v56.0.3)](https://docs.expo.dev/versions/latest/sdk/storereview/)
- [Meta Developers: Sharing to Stories](https://developers.facebook.com/docs/instagram-platform/sharing-to-stories/) — page returned only stub via search; parameters confirmed from practitioner sources below
- [ASOMobile: Text optimization for App Store](https://asomobile.net/en/blog/lesson-3-text-optimization-for-the-app-store/)
- [AppRadar: ASO Ranking Factors 2026](https://appradar.com/academy/app-store-ranking-factors)
- [Appfollow: ASO Keywords guide 2025](https://appfollow.io/blog/aso-keywords)
- [Appalize: iOS Keyword Field rules](https://www.appalize.com/blog/keyword-research/ios-keyword-field-rules-character-limits-optimization/)
- [Apple Dev Forum 737999 — astrology app 4.3b rejection](https://developer.apple.com/forums/thread/737999)
- [iMore: Apple rejects horoscope app](https://www.imore.com/apple-rejects-developers-horoscope-app-says-app-store-has-enough)
- [TechCrunch: Struck dating app (astrology-adjacent) after rejection](https://techcrunch.com/2020/07/20/after-numerous-rejections-strucks-dating-app-for-the-co-star-crowd-hits-the-app-store/)
- [Appbot: When to ask for app ratings](https://appbot.co/blog/prompting-for-ratings-prompt-early-or-wait/)
- [CriticalMoments: Improve app ratings guide](https://criticalmoments.io/blog/improve_app_ratings)
- [DEV Community: Share images to Instagram Stories from Expo](https://dev.to/bhatvikrant/a-step-by-step-guide-to-share-images-from-your-expo-react-native-app-to-instagram-stories-1feb)
- [Medium — Story Sharing on Facebook & Instagram in iOS](https://medium.com/@burakekmen/story-sharing-on-facebook-instagram-in-ios-apps-2df2a82ebf96)
- [GitHub: react-native-share issue #1388 — Instagram Stories link pasting](https://github.com/react-native-share/react-native-share/issues/1388)
- [GitHub: Expo-Instagram-Stories package](https://github.com/JuanseMastrangelo/Expo-Instagram-Stories)
- [npm: @princecarter/expo-instagram-stories](https://socket.dev/npm/package/@princecarter/expo-instagram-stories)
- [ASO World: astrology app 120% visibility case study](https://asoworld.com/en/case-studies/aso-case-study-how-an-astrology-app-increased-visibility-by-120-with-aso-services/)

### Community evidence quality note
Reddit searches for r/astrology and r/SaaS returned zero results for this specific topic combination. Co-Star growth data is from public Wikipedia + App Store listings. No fabricated community consensus claims are made below.

---

## 3. Domain Constraints the Brainstorm Probably Missed

### A. App Store Metadata — ASO

**MUST**
- Title: maximum 30 characters including spaces. The app name displayed on the storefront IS the primary ranking signal. Source: [Apple Review Guidelines 2.3.7](https://developer.apple.com/app-store/review/guidelines/).
- Subtitle: maximum 30 characters including spaces. Second-strongest ranking signal after the name. Source: same.
- Keyword field: exactly 100 characters per locale, comma-separated, NO spaces after commas (every wasted character is lost inventory). Each character counts: `horary,astrology,chart,question` not `horary, astrology, chart, question`.
- Keywords in the keyword field MUST NOT repeat words already in the title or subtitle — Apple indexes both already. Repetition wastes your 100 characters.
- Keywords MUST NOT include trademarked terms (competitor app names: "Co-Star", "Nebula", "TimePassages") or pricing terms. Guideline 2.3.7.
- Each App Store locale (en-US, ru, etc.) gives a SEPARATE 30+30+100 allocation. Localizing metadata is the highest-ROI ASO action for a bilingual (ru/en) app.

**MUST NOT**
- Do not include articles ("a", "the", "и", "the") in the keyword field — they burn characters and Apple ignores them.
- Do not include plural forms when the singular is already present — Apple's algorithm generates phrase combinations automatically.
- Do not use "fortune telling", "psychic", "prediction" as primary title words unless the app genuinely does that, AND unless you are prepared to differentiate strongly (see 4.3b below).

**SHOULD**
- In 2026 Apple's LLM-augmented ranking evaluates semantic coherence between keyword field content, screenshot content, and actual app functionality. Disconnected keyword clusters suppresses ranking even for terms with legitimate authority. Source: [ASO World 2026 ranking factors](https://asoworld.com/insight/app-store-ranking-in-2026-why-retention-and-engagement-now-matter-more-than-keywords/).
- Keywords should reflect genuine long-tail horary-specific terms that competitors ignore: `horary,chart,question,traditional,classical,significator,perfection,natal` are lower-competition with targeted intent.

### B. App Store Guideline 4.3b — Fortune Telling / Divination Spam Rule

**MUST**
- The app MUST demonstrate a unique, high-quality experience in its App Review submission. The App Store Review Guidelines 4.3(b) explicitly lists "fortune telling" alongside fart apps and flashlight apps as a saturated category. Apps "will be rejected unless they provide a unique, high-quality experience." Sources: [Apple Review Guidelines 4.3](https://developer.apple.com/app-store/review/guidelines/), [Apple Dev Forum 737999](https://developer.apple.com/forums/thread/737999), [iMore rejection report](https://www.imore.com/apple-rejects-developers-horoscope-app-says-app-store-has-enough).
- The app description submitted to App Review MUST front-load the unique value proposition — specifically: traditional medieval horary technique (vs generic sun-sign horoscopes), named classical method (Lilly/CA), question-specific chart calculation. This is the differentiation signal Apple reviewers look for.
- Screenshots MUST show the app in USE — actual chart with aspect lines, dignities table, verdict — not splash screens or logo art. Guideline 2.3.3. Screenshots double as the visual proof-of-uniqueness in App Review.
- Metadata (all fields) must render at a 4+ age rating. No disturbing imagery even if the app is rated higher. Guideline 2.3.8.

**MUST NOT**
- Do NOT submit as a "horoscope" or "daily forecast" app if the core mechanic is horary question-answering. Mislabeling category increases spam flag risk.
- Do NOT use screenshot overlays that look like a different app (e.g., generic astrology wheel with no unique UI). This feeds the 4.3b spam signal.

### C. Instagram Stories Share — URL Scheme Protocol

**MUST**
- iOS: The share mechanism uses `instagram-stories://share` URL scheme combined with `UIPasteboard`. Data is written to the pasteboard BEFORE opening the URL. The scheme alone does not carry content; content travels via pasteboard.
- The following pasteboard keys are the canonical identifiers (all confirmed via practitioner sources):
  - `com.instagram.sharedSticker.backgroundImage` — PNG/JPEG NSData for the full-bleed background
  - `com.instagram.sharedSticker.backgroundVideo` — MP4 video NSData (alternative to backgroundImage)
  - `com.instagram.sharedSticker.stickerImage` — PNG NSData with transparency (the overlay/sticker placed by user)
  - `com.instagram.sharedSticker.backgroundTopColor` — hex string e.g. `#1A0B2E` for gradient top
  - `com.instagram.sharedSticker.backgroundBottomColor` — hex string e.g. `#0D0520` for gradient bottom
  - `com.instagram.sharedSticker.contentURL` — a URL string the user can attach as a link sticker
- The `contentURL` link sticker requires Meta's **Link in Stories** feature to be available to the account. Not all accounts have access; do NOT present this as a guaranteed attribution path.
- `instagram-stories` MUST be added to `LSApplicationQueriesSchemes` in `Info.plist` (Expo config plugin handles this). Without it, `canOpenURL("instagram-stories://share")` returns false on iOS 9+ even with Instagram installed.
- A **Facebook App ID is NOT required** for the URL scheme method on iOS (it IS required for the official Facebook SDK approach). The URL scheme + pasteboard method works without registering a Facebook App ID. Source: multiple practitioner implementations (DEV.to article, GitHub Expo-Instagram-Stories, Medium iOS guide).
- MUST call `canOpenURL("instagram-stories://share")` before attempting — if Instagram is not installed, the URL open silently fails. Always gate with an `isInstagramAvailable()` check and show a fallback (system share sheet or copy-to-clipboard).

**MUST NOT**
- Do NOT pass a generic system share sheet URL to the instagram-stories scheme — the pasteboard approach is required for background + sticker composition.
- Do NOT pass oversized images. Recommended maximum background image: 2.5 MB. Larger images cause silent failure or Instagram-side cropping. Compress the rendered share card before writing to pasteboard.
- Do NOT write to pasteboard on Android via this iOS URL scheme — Android uses an Intent with `android.intent.action.SEND` and the `com.instagram.android` package. Different implementation path entirely.

**SHOULD**
- SHOULD render the share card as a 9:16 (1080×1920px) PNG for Instagram Stories native resolution. Off-ratio images get letterboxed by Instagram, which looks unprofessional.
- SHOULD use `stickerImage` (transparent PNG) for the app's result overlay rather than baking text into backgroundImage — this gives the user control to reposition it, which Instagram's UX encourages.
- SHOULD include a fallback to iOS system share sheet for users without Instagram installed. The fallback serves WhatsApp, Telegram, and iMessage, which are equally viral for the Russian-speaking target audience.

**Android note:**
- Android Instagram Stories sharing uses `Intent.ACTION_SEND` with `setPackage("com.instagram.android")` and extra key `"interactive_asset_uri"` for the sticker. It is a completely separate code path from iOS. Any Expo native module must handle both platforms separately.

### D. SKStoreReviewController / expo-store-review

**MUST**
- Apple's system enforces a hard cap of **3 review prompts per app per 365-day rolling window per device**. After 3 calls, `requestReview()` is silently swallowed — no error, no callback, nothing. Source: [ASO Maniac: App Store Review Popup guide](https://asomaniac.com/blog/app-store-review-popup), [Apple Dev Forum 115193](https://developer.apple.com/forums/thread/115193), [SwiftLee SKStoreReviewController guide](https://www.avanderlee.com/swift/skstorereviewcontroller-app-ratings/).
- MUST guard calls with `StoreReview.isAvailableAsync()` — the expo-store-review method. Returns `true` on iOS prod but `false` on TestFlight. Source: [expo-store-review docs](https://docs.expo.dev/versions/latest/sdk/storereview/).
- MUST NOT call `requestReview()` from a button tap. Apple's guidelines and expo-store-review docs both explicitly prohibit this. It must be triggered by a programmatic event, not user action.
- Because `requestReview()` returns `Promise<void>` with no success/failure signal, MUST maintain your OWN prompt count in persistent storage (AsyncStorage or SecureStore). Store: count shown (max 2 in first year to preserve the 3rd for a later high-value moment), date of last prompt, and whether the user has already rated.
- MUST respect minimum engagement before prompting: the system throttle is a floor, not a ceiling. Prompting at session 1 or 2 wastes one of your 3 annual slots on a user who has not yet experienced value.

**MUST NOT**
- Do NOT rely on the system silently dropping excess calls as your rate-limiting strategy. Build your own gate — track prompt count in storage and enforce it client-side.

**SHOULD**
- Implement a pre-prompt satisfaction gate: show a modal "Are you enjoying the app?" → Yes routes to `requestReview()`, No routes to an in-app feedback form (email or support link). This pattern is documented by multiple practitioners as shifting average rating by ~0.3–0.5 stars. Source: [CriticalMoments review prompt guide](https://criticalmoments.io/blog/improve_app_ratings), [Appbot prompt timing guide](https://appbot.co/blog/prompting-for-ratings-prompt-early-or-wait/).

### E. Review Prompt Timing for Astrology/Spiritual Apps

**MUST**
- The "aha moment" in a horary app is **receiving a verdict on a question the user genuinely asked**. The optimal prompt window is immediately after the first completed reading where the verdict was delivered AND the user spent more than N seconds (suggest: 15s) reading the interpretation. This is the highest-emotional-value moment in the entire session.
- SHOULD fire the first prompt only after 2+ completed readings (not the first), to filter users who did not understand the product.
- MUST NOT prompt during question entry (high friction), during chart calculation (waiting state), or immediately at app open.
- MUST NOT prompt after an error state (API failure, chart not generated). This is explicitly called out as a hostile timing by multiple UX sources. Source: [Appbot prompt timing guide](https://appbot.co/blog/prompting-for-ratings-prompt-early-or-wait/).

**SHOULD**
- Target "power users" (users who have returned for 3+ sessions) for the third prompt slot. Power users give more generous and more substantive reviews. Source: [CriticalMoments review prompt guide](https://criticalmoments.io/blog/improve_app_ratings).
- For a spiritual/contemplative app, avoid prompting immediately after a negative verdict ("No, this will not happen"). The user's emotional state is not conducive to generosity. Prompt after positive verdicts or after the user explicitly saves/bookmarks a reading.

---

## 4. Common Traps in This Domain

**ASO**
- **Trap: Using "horary" as the primary title keyword.** Search volume for "horary" is near-zero in both App Store and Play Store. "Horary astrology" has marginally more volume but still tiny. The title should lead with a broader hook ("astrology chart", "birth chart question") and use horary specificity in subtitle or description.
- **Trap: Duplicating keywords across title + subtitle + keyword field.** Apple's indexing already picks up words in the title and subtitle. Repeating "astrology" in all three fields wastes 9+ characters from your 100-char keyword field. Source: [ASOMobile keyword guide](https://asomobile.net/en/blog/lesson-3-text-optimization-for-the-app-store/).
- **Trap: Assuming keyword field is visible to users.** It is entirely hidden. Only affects algorithmic ranking, not conversion. Conversion depends on screenshots and title.
- **Trap: Single-locale metadata.** The Russian-speaking user base (the project's target) gets better conversion from a properly localized Russian App Store page. The Russian locale gets its own 30+30+100 allocation — effectively doubling keyword surface area.

**Instagram Stories Share**
- **Trap: Testing only in simulators.** The URL scheme + pasteboard pattern does NOT work in simulators. Must test on a physical device with Instagram installed. Source: multiple Expo RN implementation guides.
- **Trap: Forgetting to add `instagram-stories` to `LSApplicationQueriesSchemes`.** The app will call `canOpenURL` and always get `false`, silently breaking the feature. This is a common miss when the config plugin is not applied correctly.
- **Trap: Image too large.** Background images above 2.5 MB frequently cause the share to silently fail. Always compress before writing to pasteboard.
- **Trap: Expecting `contentURL` to always appear as a clickable link.** The link sticker in Instagram Stories is gated behind Meta's "Link in Stories" feature. For accounts without that feature (personal accounts below follower thresholds historically), the link may not be interactive. Do not design the viral loop to depend on link attribution from the story.
- **Trap: Sharing a portrait chart screenshot directly as backgroundImage.** A horary wheel chart is typically rendered in square or landscape. Writing it as a 9:16 Stories background will shrink or distort it. Design a dedicated 9:16 share card layout with the chart as a centered element.

**SKStoreReviewController**
- **Trap: Prompting on TestFlight and assuming production will behave the same.** On TestFlight `isAvailableAsync()` returns `false` — the prompt never shows. This is correct iOS behavior. Do NOT interpret this as a bug.
- **Trap: Not tracking prompt count in app storage.** Without your own counter, you have no way to know when you've used 2 of 3 annual slots. You will waste the third slot on a low-value moment.
- **Trap: Wiring the prompt to a "Rate us" button.** Apple explicitly prohibits triggering `requestReview()` from a button. The button can exist for navigation purposes (deep link to App Store page), but the in-app modal MUST be triggered programmatically. Source: [expo-store-review docs](https://docs.expo.dev/versions/latest/sdk/storereview/).

---

## 5. Regulatory / Compliance Notes

- **Section 4.3(b) — Fortune Telling Category:** Confirmed active as of 2026. Apple's App Store has "enough fortune telling apps" per the guidelines and the rejection is explicit. Horary astrology must be presented as a unique, classically-grounded method, not generic prediction. Mitigation already captured in `docs/superpowers/expert/_knowledge-base/horary-astrology.md`. Source: [Apple Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
- **Section 1.4.1 — Medical / Health Claims:** Any language in the app description or screenshots that implies diagnostic, therapeutic, or medical-grade predictive capability risks rejection. This is a carry-forward from the fertility audit (do not re-research). Relevant here: if the app's virality copy says "know your fate" or "predict your future" in literal (non-symbolic) terms, that approaches territory reviewers may scrutinize. Keep framing symbolic/entertainment.
- **Section 2.3.7 — Metadata Accuracy:** Apple can modify or reject metadata it deems inaccurate or manipulative. Keyword stuffing that is semantically disconnected from the app's actual function is now flagged by Apple's LLM-augmented ranking and may trigger a metadata revision request or ranking penalty without formal rejection.
- **GDPR / Privacy:** Not a primary focus of this audit. However, if the share card includes any user-entered question text (even partially), ensure explicit user consent before including personal data in a shareable image.
- **Instagram Platform Policy:** The URL scheme + pasteboard method is an approved, documented integration path. It does NOT require submitting to Meta's app review process (unlike Facebook Login or Messenger). However, Meta reserves the right to change the scheme keys without notice — this has happened before. The spec should treat this integration as "best-effort, gracefully degradable" not as a guaranteed product feature.

---

## 6. Recent Breaking Changes (last 12 months)

1. **Apple LLM-augmented ranking (2025–2026):** The App Store ranking algorithm has integrated semantic relevance scoring. As of 2026 reporting, keyword field contents that are semantically disconnected from the app's core function are penalized even for terms with historical ranking authority. This is a departure from the pure keyword-density model. Source: [ASO World 2026 ranking factors](https://asoworld.com/insight/app-store-ranking-in-2026-why-retention-and-engagement-now-matter-more-than-keywords/).

2. **expo-store-review v56.0.3 (released ~May 2026):** Latest published version as of research date. No breaking API changes reported; method signatures (`isAvailableAsync`, `requestReview`, `hasAction`, `storeUrl`) remain stable. The `hasAction()` method was the notable prior-cycle addition (distinguishes "can show native modal" from "can redirect to store"). Source: [expo-store-review npm](https://www.npmjs.com/package/expo-store-review).

3. **Instagram in-app browser deep-link breakage (2025):** Instagram's in-app browser (WKWebView on iOS) intentionally blocks OS-level deep-link interception. Links shared in Instagram Stories that open inside Instagram's browser DO NOT successfully trigger app-to-app URL scheme opens. This means if you include a `contentURL` in your share card and a user taps it from within Instagram, your app will NOT open via universal link or custom scheme. The user lands on a web fallback. This is documented behavior, not a bug. Source: [Linkrunner: Universal Links in in-app browsers](https://linkrunner.io/blog/universal-links-app-links-break-in-app-browsers).

4. **No new Instagram sharing API announced (2025–2026):** A search across Meta developer docs and community sources found no new official sharing API replacing the URL scheme + pasteboard method. The `instagram-stories://share` scheme remains the current standard for native iOS sharing. No deprecation notices found as of research date.

---

## 7. Design Constraints for the Plan (Non-Negotiable)

### ASO
1. MUST: App title ≤ 30 characters. Final string must be measured before submission.
2. MUST: Subtitle ≤ 30 characters.
3. MUST: Keyword field ≤ 100 characters, comma-no-space format, zero repetition with title/subtitle words.
4. MUST: Create separate localized metadata for Russian (ru) locale. En + ru doubles keyword surface area at zero extra effort.
5. MUST: App Review submission description must explicitly state: traditional horary method, classical technique (Lilly/CA), question-specific chart — to differentiate from 4.3b spam category.
6. MUST NOT: Use competitor app names (Co-Star, Nebula, TimePassages) in any metadata field.
7. MUST NOT: Include pricing terms or subscription marketing copy in the keyword field.
8. MUST: Screenshots must show actual chart rendering, dignities/aspects output, and verdict UI — not onboarding screens or logo art. This is both an Apple requirement (2.3.3) and the primary 4.3b differentiation signal.

### Instagram Stories Share
9. MUST: Add `instagram-stories` to `LSApplicationQueriesSchemes` in `Info.plist` via Expo config plugin.
10. MUST: Gate the share action with `canOpenURL("instagram-stories://share")` — if false, fall back to iOS system share sheet. Do not present Instagram Stories as the only share path.
11. MUST: Use pasteboard key `com.instagram.sharedSticker.backgroundImage` (not `backgroundVideo` for a static chart card).
12. MUST: Compress share card image to ≤ 2.5 MB before writing to `UIPasteboard`. Silent failure above threshold.
13. MUST: Design the share card layout as 9:16 (portrait) with the chart centered. Do not use the raw chart screenshot as the backgroundImage.
14. MUST: Android share path uses `Intent.ACTION_SEND` with `setPackage("com.instagram.android")` — separate implementation from iOS.
15. SHOULD: Include a stickerImage (transparent PNG with the reading verdict text) as the user-repositionable overlay layer, not baked into the background.
16. MUST NOT: Design the viral loop to depend on the `contentURL` link being clickable. Meta's Link in Stories feature is not universally available and the link will not open the app if tapped from inside Instagram's in-app browser (2025 behavior).

### SKStoreReviewController / expo-store-review
17. MUST: Install `expo-store-review` (current: v56.0.3). Use `StoreReview.isAvailableAsync()` to guard all calls.
18. MUST: Track prompt count and last-prompt date in persistent storage (AsyncStorage). Enforce maximum 3 prompts per 365-day window at the application layer — do not rely on system throttle alone.
19. MUST NOT: Trigger `requestReview()` from any user-visible "Rate us" button tap. The button may link to the App Store page directly; the in-app modal must be event-driven only.
20. MUST: Do not prompt during onboarding, chart calculation, error states, or first session.
21. MUST: Fire first prompt only after 2+ completed readings.

### Viral Mechanics
22. SHOULD: Implement a pre-prompt satisfaction gate before calling `requestReview()` — "Are you enjoying the app?" Yes → review prompt, No → feedback form. This is the most reliably documented rating-improvement pattern.
23. SHOULD: First review prompt fires after a positive verdict on reading #2+, after the user has spent ≥ 15 seconds on the interpretation screen.
24. SHOULD: Third review prompt slot (of 3 annual) should be reserved for power users (3+ return sessions). Track return sessions.
25. SHOULD: Do not prompt immediately after a negative verdict ("No"). The user's emotional state is adverse.

---

## 8. Open Questions for the Human

1. **Facebook App ID:** Does the project have (or plan to register) a Facebook App ID? The URL scheme + pasteboard method does NOT require one. But if the team ever wants to use the official Facebook iOS SDK (e.g., for login, analytics, or the FB Stories share SDK), an App ID will be needed. Clarify now so the Expo config plugin is set up correctly from day one.

2. **Share card design ownership:** The 9:16 share card is a distinct design artifact (separate from the in-app chart render). Who owns the design — is it in the current sprint scope, or deferred? The implementation spec cannot be finalized without a design that fits the 9:16 canvas.

3. **Attribution URL strategy:** If `contentURL` is unreliable (as established above), what is the fallback attribution plan? Options: branded hashtag in the share card text, branch.io / adjust deep link in the caption, or purely organic (no trackable attribution). This is a product/marketing decision.

4. **Russian-language keyword research:** The ru App Store keyword allocation (30+30+100) should be researched by a Russian-speaking ASO specialist or with an ASO tool (AppTweak, ASOMobile) using Cyrillic queries. Automated translation of English keywords into Russian produces suboptimal results — Russian search behavior differs. Is there a budget/resource for this?

5. **Review prompt localization:** `requestReview()` renders Apple's system UI, which is already localized by iOS. But the pre-prompt satisfaction gate (the custom modal before the system prompt) must be translated into Russian. Is this in scope for the current sprint?

6. **Play Store review timing:** Google's `ReviewManager` API (Android equivalent) has different throttle characteristics — it is session-based, not year-based, and the exact throttle is not publicly documented. If Android is in scope, the prompt strategy may need a separate tuning pass.

7. **App category selection:** The project should decide between "Entertainment", "Lifestyle", and "Education" App Store categories. This choice affects 4.3b scrutiny level and discoverability. "Education" with an emphasis on traditional astrological technique may lower spam-flag risk vs "Entertainment". What is the owner's preference?

---

## 9. Knowledge Base Updates

Appended to `docs/superpowers/expert/_knowledge-base/horary-astrology.md` under `## Updated 2026-06-04 — ASO + Virality`.

Created new KB file: `docs/superpowers/expert/_knowledge-base/aso-ios.md` — iOS App Store metadata policy reusable matrix.

Created new KB file: `docs/superpowers/expert/_knowledge-base/social-share-instagram.md` — Instagram Stories URL scheme parameter reference.

Created new KB file: `docs/superpowers/expert/_knowledge-base/in-app-review-ios.md` — SKStoreReviewController throttle rules and expo-store-review usage patterns.
