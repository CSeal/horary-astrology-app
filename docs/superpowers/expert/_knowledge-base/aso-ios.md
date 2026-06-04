# iOS App Store ASO Knowledge Base

Maintained by Compound V Phase 1B advisor. Append at the bottom on each pass.

---

## Updated 2026-06-04 — Metadata policy, keyword rules, fortune-telling category

### Canonical metadata field limits

| Field | Limit | Ranking weight | Notes |
|---|---|---|---|
| App Name (title) | 30 chars | Highest | Primary keyword signal; also display name |
| Subtitle | 30 chars | High | Second-strongest signal after title |
| Keyword field | 100 chars | Medium | Hidden from users; comma-no-space; no repetition |
| Promotional text | 170 chars | Not indexed | Above description; changeable without new build |
| Long description | ~4000 chars | Not indexed by keyword algo | Visible to users; drives conversion |

**Key rules:**
- Words in title/subtitle are automatically indexed — do NOT repeat in keyword field.
- Comma format: `word1,word2,word3` NOT `word1, word2, word3` (spaces waste characters).
- No articles, no plurals when singular present (Apple auto-combines phrases).
- No trademarked terms or competitor app names in ANY field (Guideline 2.3.7).
- No pricing terms in metadata.
- Each locale = separate full allocation (30+30+100). Localizing ru+en effectively doubles keyword surface area.

Source: [Apple Review Guidelines 2.3.7](https://developer.apple.com/app-store/review/guidelines/), [ASOMobile lesson 3](https://asomobile.net/en/blog/lesson-3-text-optimization-for-the-app-store/), [Appalize iOS keyword field rules](https://www.appalize.com/blog/keyword-research/ios-keyword-field-rules-character-limits-optimization/)

### 2026 algorithm behavior

As of 2026, Apple's ranking system uses LLM-augmented semantic relevance scoring. Keyword field contents that are semantically disconnected from the app's actual function (as evidenced by screenshots, description, and behavioral signals) generate lower scores even for terms where the app has legitimate authority. "Keyword stuffing" suppresses ranking — treat the 100 chars as a focused semantic cluster, not a maximum-coverage dump.

Source: [ASO World 2026 ranking factors](https://asoworld.com/insight/app-store-ranking-in-2026-why-retention-and-engagement-now-matter-more-than-keywords/)

### Section 4.3(b) — Fortune telling / divination saturation rule

Apple's guidelines (4.3b) explicitly list "fortune telling" as a saturated category alongside fart apps and flashlight apps. Apps in this category "will be rejected unless they provide a unique, high-quality experience."

Evidence of active enforcement in 2025/2026:
- Developer rejection documented at [Apple Dev Forum 737999](https://developer.apple.com/forums/thread/737999) — app removed features, still rejected with boilerplate citing 4.3
- [iMore report](https://www.imore.com/apple-rejects-developers-horoscope-app-says-app-store-has-enough) — Apple told developer "we simply have enough of these types of apps"
- [Struck astrology-dating app](https://techcrunch.com/2020/07/20/after-numerous-rejections-strucks-dating-app-for-the-co-star-crowd-hits-the-app-store/) — multiple rejections before approval; mitigation was strong technical differentiation

**Differentiation signals Apple reviewers accept (observed patterns):**
- Named classical technique with non-trivial methodology (not vague "AI predictions")
- Unique chart calculation (not just sun-sign horoscope)
- Screenshots showing real functional output (chart render + verdict), not splash screens
- Metadata that front-loads the specific unique value proposition

### Screenshot requirements (Guideline 2.3.3 + 2.3.8)

- Must show the app IN USE — actual UI with real data, not title art, login pages, or splash screens
- Text/image overlays allowed but screenshots must still represent app functionality
- All metadata (including screenshots) must be appropriate for 4+ age rating even if app is rated higher
- This rule is both a compliance requirement and the primary way to demonstrate 4.3b differentiation

### Category selection strategy

For astrology/divination apps:
- "Entertainment" — highest 4.3b scrutiny, competitive keyword landscape
- "Lifestyle" — moderate scrutiny, broader discovery
- "Education" — lower 4.3b scrutiny if technique-explanation content is substantial

Decision is product/business call; cannot be automated.
