# Horary Astrology Knowledge Base

Maintained by Compound V Phase 1B advisor. Append at the bottom on each pass.

---

## Updated 2026-06-03 — Pregnancy / Fertility / Gender questions (traditional technique + product reality)

### Reusable matrix: which horary categories need specialized vs standard technique

| Category family | Standard significator/perfection sufficient? | Specialized layer needed | Source |
|---|---|---|---|
| career, job, money, missing_item, travel, general | Yes | none | Lilly, CA Bk III |
| love, marriage | Mostly (7th-house derivation) | minor | Lilly |
| **pregnancy / fertility** | **No — needs extra layer** | 5th house + fruitful/barren signs + Moon-as-fertility + Part of Children + timing-by-house | [Lilly childbirth rules](https://www.renaissanceastrology.com/lillysrulesforchildbirth.html), [Skyscript pregnancy aphorisms](https://www.skyscript.co.uk/pregnancy.html) |
| health | No — needs decumbiture/6th-house layer | crisis-day timing | Lilly Bk III |

**Takeaway:** pregnancy/fertility is one of only ~2 horary families where the standard yes/no perfection engine genuinely under-reads the chart. The extra testimonies (fruitful signs, Moon, benefics in 5th, Part of Children) are *core traditional method*, not gamification.

### Traditional pregnancy/conception rules (verbatim where possible)

Conception likely when (Lilly):
- "If the Lord of the Ascendant be in the 7th, or the Lord of the 5th in the 1st, or the Lord of the 1st in the 5th"
- Jupiter "in the Ascendant, 3rd, 5th, 9th or 11th house, free from all manner of misfortune"
- Moon in 5th applying to Jupiter or Venus; benefics in fruitful (water) signs

Conception blocked / unlikely:
- Barren signs on Asc or 5th: **Leo, Virgo** (Gemini sometimes added). "If Leo or Virgo be there, she neither is at present, or hardly after will be with Child."
- Saturn or Mars in the 5th; Venus joined to Saturn/Mars; significators combust/retrograde/slow

Fruitful signs: **Cancer, Scorpio, Pisces** (Cancer strongest — Moon's domicile + Jupiter exaltation).
Barren signs: **Leo, Virgo** (Gemini).

### Timing-by-house matrix (lord of 5th → years to conception)

| Lord of 5th in house | Time to conception |
|---|---|
| 1st | 1st year |
| 2nd | 2nd year |
| 10th | 3rd year |
| 7th | 4th year |
| 4th | 5th year |

Movable signs hasten; fixed signs delay. Closer the benefic to the Ascendant, the sooner. Source: [Lilly childbirth rules](https://www.renaissanceastrology.com/lillysrulesforchildbirth.html).

> Note this is a *years*-granularity, multi-testimony heuristic — NOT a calendar date or fertile-window-by-day prediction. Any UI implying "you are fertile on date X" misrepresents the method.

### Gender (boy_or_girl) — multi-testimony tally, low confidence by design

Method = count masculine vs feminine testimonies across: Asc-ruler, 5th-ruler, hour-ruler, Moon, and the signs they occupy. Majority wins.
- Masculine planets: Sun, Mars, Jupiter, Saturn. Feminine: Moon, Venus. Mercury = neutral/contextual.
- Masculine signs: fire + air (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius). Feminine signs: earth + water.
- Houses: odd = masculine, even = feminine.

Critical caveat (Skyscript): **"Always form your judgement upon the majority of testimonies. If the indications look equally balanced — defer judgement."** Gender via horary is explicitly a balance-of-testimony call that frequently lands at "unclear." Treat `boy_or_girl` as the lowest-confidence subcategory in the entire app.

### Product / regulatory reality

- **Apple categorical risk:** Astrology/divination apps are routinely rejected under **Guideline 4.3 (Spam)** as "duplicates content and functionality of many other similar apps." Confirmed [Apple Dev Forum thread 737999](https://developer.apple.com/forums/thread/737999) — developer removed features, still rejected with boilerplate. Mitigation = clear differentiation (traditional horary niche, not generic horoscope) + polish, not feature count.
- **Apple medical scrutiny (1.4.1):** Apps that could be used to diagnose/treat get extra scrutiny and must "remind users to check with a doctor." Fertility/conception/IVF framing risks being read as health guidance. Keep framing symbolic/entertainment; add medical disclaimer; never present `fertility_score` as a clinical/medical metric. Source: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
- **fertility_score 0–100 is NOT a traditional concept.** No classical source produces a numeric fertility percentage; it's a vendor-synthesized aggregation. It reads as gamification and, worse, as a pseudo-medical probability. High emotional-harm surface for the target persona (women 25–40 TTC, possibly post-IVF/loss).
- **Persona sensitivity:** TTC (trying-to-conceive) and IVF audiences are emotionally high-stakes. A confident-looking false "favorable / 82/100" can cause real distress. The honest "unclear / defer judgement" output is a feature, not a bug, for this audience. (Direct community-forum evidence not retrieved this pass — see audit gaps.)

### Sources
- [Lilly's Rules for Childbirth and Pregnancy (Renaissance Astrology)](https://www.renaissanceastrology.com/lillysrulesforchildbirth.html) — fetched 2026-06-03
- [Skyscript: Traditional Aphorisms for Pregnancy](https://www.skyscript.co.uk/pregnancy.html) — fetched 2026-06-03
- [Anthony Louis: Will the baby be a boy or a girl?](https://tonylouis.wordpress.com/2018/03/31/will-the-baby-be-a-boy-or-a-girl/)
- [Apple Dev Forum 737999 — astrology app rejection (4.3 Spam)](https://developer.apple.com/forums/thread/737999) — fetched 2026-06-03
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## Updated 2026-06-04 — ASO + Virality

### App Store 4.3(b) rejection risk — reusable decision matrix

| App type | 4.3(b) risk level | Mitigation |
|---|---|---|
| Generic horoscope / daily forecast | High — saturated category | Must show unique feature set |
| Tarot / oracle card reader | High — explicit in 4.3(b) text | Needs unique UI + genuine content depth |
| **Traditional horary astrology** | **Medium — niche technique** | **Differentiate: named classical method (Lilly/CA), question-specific chart, medieval significator logic** |
| Natal chart calculator only | Medium | Common but established utility |
| Astrology education (technique reference) | Lower | "Education" category lowers scrutiny |

Key constraint: 4.3(b) is enforced at App Review time AND can be used for removal post-approval. The "unique, high-quality experience" standard is a living judgment call, not a one-time gate.

Source: [Apple Review Guidelines 4.3](https://developer.apple.com/app-store/review/guidelines/), [Apple Dev Forum 737999](https://developer.apple.com/forums/thread/737999), [iMore rejection report](https://www.imore.com/apple-rejects-developers-horoscope-app-says-app-store-has-enough)

### ASO metadata limits (canonical)

| Field | iOS App Store | Google Play |
|---|---|---|
| Title | 30 chars | 30 chars |
| Subtitle / Short description | 30 chars | 80 chars |
| Keyword field | 100 chars (hidden, comma-no-space) | N/A (algorithm infers from description) |
| Long description | Not indexed for keywords | Indexed |
| Each locale | Independent 30+30+100 allocation | Independent allocation |

Rule: words in title/subtitle do NOT need to be repeated in the keyword field — Apple double-indexes them.

Source: [Apple Review Guidelines 2.3.7](https://developer.apple.com/app-store/review/guidelines/), [ASOMobile keyword guide](https://asomobile.net/en/blog/lesson-3-text-optimization-for-the-app-store/), [Appalize iOS keyword field rules](https://www.appalize.com/blog/keyword-research/ios-keyword-field-rules-character-limits-optimization/)

### Review prompt throttle — SKStoreReviewController

Hard system limit: 3 prompts per app per device per 365-day rolling window. Silent swallow after limit reached. No API to check remaining count. Must track client-side.

Source: [ASO Maniac review popup guide](https://asomaniac.com/blog/app-store-review-popup), [Apple Dev Forum 115193](https://developer.apple.com/forums/thread/115193)

---

## Updated 2026-07-02 — Unused-endpoint domain value: sect, Lots, Sabian, whole-chart dignity, VOC-timing + analytics-sensitivity (roadmap audit)

Context: audit of astrology-api.io endpoints the shipped app does NOT yet call, judged for genuine traditional-horary (Lilly-method) analytical value vs "more data for its own sake." Anti-dilution frame: differentiation is depth + correctness of traditional technique, not breadth of modalities (competitor "Lunaton" lost ground bolting tarot/runes onto horary).

### Reusable matrix — does this data layer add real horary value?

| API data layer | Horary value | Verdict | Why / source |
|---|---|---|---|
| Whole-chart essential+accidental dignity for ALL 7 planets (not just significators) | HIGH | Surface | Lilly judges the whole chart — dispositors, almuten, any benefic/malefic aspecting the significators matter. |
| Sect (day/night, in-/out-of-sect malefic) | MEDIUM-HIGH | Surface as affliction-severity modifier | Sect "adjusts the volume": day chart → Mars is the worse malefic, Saturn tamer; night chart reverses. Tells you WHICH malefic afflicting a significator is the real threat. [ET Shipley](https://etshipley.com/current-writing/sect-in-astrology), [traditional-astrology.com](https://traditional-astrology.com/blog/day-chart-vs-night-chart.html) |
| Mutual reception between ANY pair | HIGH | Surface | Reception is horary's "get-out-of-jail" testimony; can perfect a matter with no direct aspect; also required for Collection of Light. |
| Moon's next applying aspect + exact time-to-perfection | HIGH | Surface | Moon = universal co-significator & "narrator"; its next aspect = "what happens next" and the primary timing engine. [kerykeion VOC](https://kerykeion.net/content/learn-astrology/horary-void-moon-horary) |
| Full 15-pair applying aspects (beyond significators) | MEDIUM-HIGH | Surface | Translation & Collection of Light BOTH require a third planet aspecting both significators — undetectable from significator-only aspect data, so the app can currently MISS a valid perfection. [Lilly, via kerykeion](https://kerykeion.net/content/learn-astrology/horary-collection-translation-light) |
| Significator ingress ("about to change sign") / station | MEDIUM | Surface as timing/last-chance flag | Significator about to change sign = matter about to change / last chance; stationing significator = highly significant. |
| Arabic Parts / Lots (general) | LOW in horary | Mostly skip | By Lilly's era only the Lot of Fortune survived, "rarely used and usually misunderstood"; Frawley (leading modern authority), as quoted in review: "I cannot remember ever judging a horary where Fortuna showed anything of importance." [Wikipedia Arabic parts](https://en.wikipedia.org/wiki/Arabic_parts), [traditionalmedicalastrology.org review](https://traditionalmedicalastrology.org/horary-textbook-john-frawley-review/) |
| Topical Lot matched to question house (esp. Part of Children, 5th) | MEDIUM | Surface ONLY on the matching topical screen | The one place a Part earns its keep: Part of Children is core Lilly pregnancy doctrine (see 2026-06-03 entry). Never a generic "Lots panel." |
| Sabian symbols | ~NONE for traditional horary | SKIP (brand-dilution risk) | Modern construct: created 1925 by Marc Edmund Jones + clairvoyant Elsie Wheeler; humanistic/psychological (Rudhyar) lineage, NOT Lilly-tradition. Repeats the modality dilution that cost "Lunaton." [sabiansymbols.com story](https://sabiansymbols.com/about/the-sabian-symbols-story/) |
| Moon phase / illumination % / "phase meaning" text | LOW | SKIP / de-emphasize | Phase mysticism drifts toward generic daily-horoscope content (the dilution trap). VOC + next-applying-aspect is the horary-native lunar signal, not phase vibes. |
| fertility_score (0–100) | see 2026-06-03 | SKIP as raw number | Non-traditional vendor synthesis; pseudo-medical; Apple 1.4.1 surface. |
| Server-rendered chart SVG | n/a (infra) | Engineering call, not a domain feature | Practitioner cares about correctness/legibility of the wheel, not client vs server rendering. |

### Sect in horary — the load-bearing distinction
Benefic/malefic assignment is sect-dependent: benefics Jupiter (day) / Venus (night); the OUT-of-sect malefic is the genuine troublemaker (day → Mars; night → Saturn), the in-sect malefic is "stern discipline, not destruction." Horary use: when a significator is afflicted by a malefic, sect tells you whether the affliction is severe (out-of-sect) or survivable (in-sect). Most web sources frame sect natally, but it's the same traditional framework Lilly-method horary sits in. [ET Shipley](https://etshipley.com/current-writing/sect-in-astrology), [traditional-astrology.com](https://traditional-astrology.com/blog/day-chart-vs-night-chart.html)

### Arabic Parts in horary — use sparingly
[Wikipedia](https://en.wikipedia.org/wiki/Arabic_parts): by Lilly's time only Lot of Fortune remained, "rarely used and usually misunderstood… mainly appears today in horary practice." Rule of thumb (same corpus): "most questions can be answered by looking at the seven inner planets, one or two Arabic parts, maybe a star and no more." → General Lots dump = noise; single topical Lot on its matching screen = legitimate depth.

### Analytics / telemetry sensitivity for a divination app (NEW — reusable for any astrology/horary/tarot product)
Horary questions are free-text about health, pregnancy, love/affairs, money/debt, legal trouble, death.
- **GDPR Art. 9 special categories** = health, sex life/orientation, religious/philosophical belief. ICO: analytics can process special-category data by INFERENCE — "product choices, user behaviour… search history or support messages can reveal health, religion… sexual orientation… even without direct collection." → Logging that a user asked a 5th-house pregnancy / 6th-house illness question INFERS health data; consulting astrology itself can imply philosophical belief. The question stream is special-category-by-inference. [gdpr-info Art.9](https://gdpr-info.eu/art-9-gdpr/), [ICO special category](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/)
- **FTC precedent (direct analogs):** BetterHelp — $7.8M, banned from sharing mental-health data w/ Facebook/Snapchat for ads (shared email, IP, questionnaire responses). Cerebral — $7M+, disclosed sensitive health data of 3.2M users to LinkedIn/Snapchat/TikTok via tracking SDKs in its app. Pattern = sensitive-category app → third-party analytics/ad SDK → enforcement. [FTC BetterHelp](https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-ban-betterhelp-revealing-consumers-data-including-sensitive-mental-health-information-facebook), [FTC Cerebral](https://www.ftc.gov/news-events/news/press-releases/2024/04/proposed-ftc-order-will-prohibit-telehealth-firm-cerebral-using-or-disclosing-sensitive-data)
- **Never send to any analytics/ad SDK:** question text (raw/truncated/hashed); question category joined to a user id; verdict joined to category; outcome ("came true") on health/pregnancy/legal categories; precise lat/long + exact question timestamp; any free-text (journal notes, custom titles); stable user id / IDFA / GAID joined to any of the above. Watch auto-capture SDKs that grab screen titles/text by default.
- **Safe:** aggregate feature-usage counts, funnels, retention, crash/perf, paywall events — provided NO sensitive property rides along.

### On-brand engagement mechanic
VOC-Moon / next-applying-aspect awareness ("Moon is void of course — tradition suggests waiting to ask"; "Moon applies to Jupiter in ~6h — a favorable window") is the horary-native re-engagement signal: technique-grounded (Lilly's "considerations before judgment"), opt-in, fires at astrologically meaningful moments, reinforces the serious-traditional brand; powered by the lunar-metrics endpoint. CONTRAST: generic moon-phase/full-moon "content" = daily-horoscope dilution trap; reject. [kerykeion VOC](https://kerykeion.net/content/learn-astrology/horary-void-moon-horary)

### Search gap (honest)
`horary astrology app practitioners want features complaints reddit 2025 2026` → ZERO results (same Layer-3 gap flagged 2026-06-03). Practitioner-value judgments below rest on classical corpus + technique authorities, NOT on a community-complaint corpus.
