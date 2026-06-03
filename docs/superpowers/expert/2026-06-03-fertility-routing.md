---
created_by: claude-opus (Compound V Phase 1B domain advisor)
updated_by: claude-opus
source_inputs: [api-integration-spec.md v2.0, astrology-api-scan-2026-06-03.md, horary-domain-brief.md, Lilly childbirth rules, Skyscript pregnancy aphorisms, Apple Review Guidelines + Dev Forum 737999]
reviewed_by: owner-pending
stage: superpowers-v Phase 1B
gate_linkage: Gate8
---

# Phase 1B Domain Audit — Pregnancy/Fertility API Routing (`/fertility-analysis` vs `/analyze`)

## 1. Domain(s) Identified

1. **horary-astrology** (traditional / Lilly-method) — specifically the pregnancy/fertility/childbirth sub-domain.
2. **app-store-compliance** (Apple/Google review of astrology + health-adjacent apps) — secondary.

## 2. Sources Consulted

**KB reused:** none existed for this domain. Created `_knowledge-base/horary-astrology.md` this pass. Internal `horary-domain-brief.md` (2026-05-25) read and treated as authoritative for general method.

**Web (parallel batch, 9 queries 2026-06-03), then 3 fetches:**
- Lilly childbirth/pregnancy rules — [renaissanceastrology.com](https://www.renaissanceastrology.com/lillysrulesforchildbirth.html) (fetched)
- Skyscript traditional pregnancy aphorisms — [skyscript.co.uk/pregnancy.html](https://www.skyscript.co.uk/pregnancy.html) (fetched)
- Gender determination method — [Anthony Louis blog](https://tonylouis.wordpress.com/2018/03/31/will-the-baby-be-a-boy-or-a-girl/)
- "When will I be pregnant?" worked example — [Mirror of Sienna](https://www.themirrorofsienna.com/horary-when-will-i-be-pregnant/)
- Apple astrology rejection (4.3 Spam) — [Apple Dev Forum 737999](https://developer.apple.com/forums/thread/737999) (fetched)
- Apple guidelines 1.4.1 / 5.2 — [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

**Search gaps (honest):** Two Layer-3 persona queries returned ZERO results:
- `site:reddit.com/r/AskAstrologers horary pregnancy fertility` → no links
- `site:reddit.com astrology fertility prediction ... emotional impact disappointment` → no links

Russian-persona query surfaced only tarot/gadanie sites, not horary practitioner forums. **I have NOT located direct community evidence of how the target persona reacts to fertility-prediction apps.** Claims about emotional harm below are reasoned from domain + Apple's own medical-scrutiny posture, NOT from a forum corpus. Flagged as such.

## 3. Domain Constraints the Brainstorm Probably Missed

- **MUST treat pregnancy/fertility as a genuinely specialized horary family.** Unlike career/money/love, the standard significator-perfection engine under-reads these charts. Traditional method *requires* extra testimonies: 5th-house ruler, **fruitful signs** (Cancer/Scorpio/Pisces) vs **barren signs** (Leo/Virgo, sometimes Gemini) on Asc/5th, Moon-as-fertility-significator, benefics (Jupiter/Venus) in/aspecting the 5th, and the **Part of Children** (an Arabic Part). Source: [Lilly](https://www.renaissanceastrology.com/lillysrulesforchildbirth.html), [Skyscript](https://www.skyscript.co.uk/pregnancy.html). → This is the strongest argument FOR `/fertility-analysis`: its `fifth_house_analysis`, `sign_fertility_analysis`, and `arabic_parts` map 1:1 onto real Lilly doctrine the `/analyze` engine doesn't surface.
- **MUST NOT present `fertility_score` (0–100) as an astrological quantity or a probability.** No classical source produces a numeric fertility percentage; it is a vendor synthesis. Surfacing a bare "82/100" reads as (a) gamification and (b) a pseudo-medical likelihood. Either suppress the number in the UI or relabel it as a qualitative band tied to the `answer` enum (`favorable/challenging/mixed/unclear`).
- **MUST map the specialized `answer` enum, not force it into yes/no.** `/fertility-analysis` returns `favorable | challenging | mixed | unclear` — this is *more* honest than coercing a fertility chart into the app's `YES/NO/MAYBE/UNCLEAR` verdict badge. If routing to `/fertility-analysis`, the verdict component needs a fertility-specific label set.
- **SHOULD treat `boy_or_girl` as the lowest-confidence output in the entire app.** Gender = tally of masculine/feminine testimonies (Asc-ruler, 5th-ruler, hour-ruler, Moon + their signs). Skyscript's own rule: *"If the indications look equally balanced — defer judgement."* Standard horary *can* attempt it but lands "unclear" often. Bias the UI toward humility here regardless of routing.
- **SHOULD frame timing as years/qualitative, never a fertile-day-by-date window.** Traditional timing-by-house yields *years* (lord of 5th in 1st→year 1, 2nd→year 2, 10th→year 3, 7th→year 4, 4th→year 5), modulated by movable/fixed signs. `timing_windows` is meaningful for fertility (timing is a first-class concern for TTC users) BUT must not be rendered as a medical ovulation/fertile-window calendar.

## 4. Common Traps in This Domain

- **Trap: assuming "more data = more value."** `/fertility-analysis` returns 4 extra structured blocks. If the MVP UI only renders verdict + interpretation text (current normalizer per `api-integration-spec.md §11` does NOT extract `aspects`, `timing`, dignity_score, etc.), then `sign_fertility_analysis`, `fifth_house_analysis`, and `arabic_parts` would be **paid-for and discarded** — 2 credits for 1 credit's worth of rendered output.
- **Trap: the interpretation-text equivalence.** Both endpoints return an `interpretation` string already localized (ru confirmed). For a text-only MVP screen, the *user-visible* difference between the two endpoints can be near-zero — except that `/fertility-analysis`'s interpretation is generated against the specialized model and should read as more on-topic.
- **Trap: gamified score → emotional harm with this persona.** Target = women 25–40 actively TTC, plausibly post-loss or post-IVF. A confident "favorable, 82/100" that doesn't pan out is a distinct harm class vs a wrong career reading. The classical "defer judgement / unclear" stance is protective and should be preserved, not engineered away.
- **Trap: credit math under a 5/month cap.** App enforces `MONTHLY_QUESTION_LIMIT = 5`. Credits are a *separate* backend budget (free plan = 50 credits/mo per scan doc). At 2 credits/fertility call the per-user fertility ceiling is fine, but mixing 1- and 2-credit categories complicates the credits-vs-questions accounting the brainstorm may have conflated. Confirm credits are pooled server-side, not per-user-quota.

## 5. Regulatory / Compliance Notes

- **Apple Guideline 4.3 (Spam) — categorical astrology risk.** Confirmed live rejections: *"Your app primarily features astrology, horoscopes, palm reading, fortune telling or zodiac reports … duplicates the content and functionality of many other similar apps."* ([Dev Forum 737999](https://developer.apple.com/forums/thread/737999), boilerplate, no resolution even after feature removal). Differentiation (traditional-horary niche, craft, polish) is the only known mitigation — NOT relevant to A-vs-B directly, but the fertility specialization can be a *positive* differentiator in review notes.
- **Apple Guideline 1.4.1 (Medical).** Apps usable to diagnose/treat get heightened scrutiny and must remind users to consult a doctor. Fertility/conception/IVF framing is the most medical-adjacent surface in this app. → MUST add a medical disclaimer on fertility/pregnancy screens; MUST NOT present any output as a fertility likelihood or medical recommendation. This risk is **higher under Option A** (specialized fertility endpoint, fertility_score) than Option B (generic horary verdict). Source: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
- **Apple Guideline 5.2 (health data privacy).** Only triggers if you collect health/fertility data. The app casts on question-timestamp only (no cycle/medical input), so currently out of scope — but DO NOT add cycle-tracking inputs to "improve" fertility readings without revisiting 5.2.
- **No India PCPNDT-style sex-selection statute applies** to a Russian-market entertainment astrology app, but sex-determination framing is culturally and ethically sensitive; keep `boy_or_girl` clearly entertainment-framed.

## 6. Recent Breaking Changes (last 12 months)

- None specific to horary domain method (it's a 1647 corpus; stable).
- API-side: `/ask` cost moved 2→10 credits (confirmed 2026-06-03, per `api-integration-spec.md` Q3). Not directly A-vs-B but reinforces credit-cost sensitivity. `/fertility-analysis` = 2 credits, `/analyze` = 1 credit confirmed same scan.
- No 2025–2026 Apple guideline change found that newly bans astrology beyond the long-standing 4.3 posture.

## 7. Design Constraints for the Plan (non-negotiable)

1. Pregnancy/fertility is a specialized horary family; the plan MUST acknowledge the 5th-house / fruitful-sign / Part-of-Children layer exists, regardless of which endpoint is chosen.
2. If `/fertility-analysis` is chosen (Option A), the plan MUST render at least the `answer` enum + interpretation + (qualitative) `fifth_house_analysis` summary — otherwise the 2nd credit buys nothing visible. Do not pay for data you discard.
3. `fertility_score` MUST NOT appear in the UI as a raw 0–100 number presented as probability or medical likelihood. If shown at all, render as a qualitative band aligned to `answer`.
4. Fertility/pregnancy screens MUST carry an entertainment + "not medical advice, consult a doctor" disclaimer (Apple 1.4.1 mitigation).
5. The verdict component MUST support a fertility-specific label set (`favorable/challenging/mixed/unclear`) if Option A is used, OR map cleanly to the standard badge if Option B.
6. `boy_or_girl` MUST default to a high-humility / "indications may be inconclusive" presentation in either option.
7. Timing output (if surfaced) MUST be qualitative/long-range, never a medical fertile-window calendar.
8. Confirm credit accounting is server-side-pooled and independent of `MONTHLY_QUESTION_LIMIT=5` before mixing 1- and 2-credit endpoints.

## 8. Open Questions for the Human (product/business decisions)

1. **Brand posture on fertility:** Is AstraSk comfortable being seen as a "fertility prediction" tool for an emotionally vulnerable persona, or should fertility/pregnancy be framed strictly as traditional-horary curiosity? This drives A vs B more than any technical factor.
2. **Does the MVP fertility/pregnancy screen render structured blocks or text-only?** If text-only for MVP, the specialized endpoint's extra payload is wasted (argues B for now, A later).
3. **Credit budget vs question quota:** are the 50 free credits/mo pooled across all users or per-user, and does the 2-credit fertility call threaten the budget at expected volume?
4. **Is `fertility_score` ever to be shown?** Product/legal call — recommend no, or qualitative-only.
5. **Should `boy_or_girl` ship in MVP at all?** It's the weakest, most sensitive subcategory. Deferring it reduces both technique risk and ethical surface.

## 9. Knowledge Base Updates

Created `_knowledge-base/horary-astrology.md` with:
- Reusable "which categories need specialized technique" matrix
- Verbatim Lilly conception/blocking rules, fruitful/barren signs
- Timing-by-house matrix
- Gender multi-testimony method + defer-judgement caveat
- Apple 4.3 / 1.4.1 compliance notes for astrology+fertility apps
All claims source-cited.

---

## Recommendation — which routing serves the MVP user better

**For MVP today: Option B (`/analyze`, 1 credit) IF the fertility screen is text-verdict-only; switch to Option A (`/fertility-analysis`, 2 credits) the moment the screen renders structured fertility blocks.**

Reasoning:
- Domain truth says pregnancy/fertility genuinely deserves the specialized layer — Option A is the *astrologically correct* endpoint. The `fifth_house_analysis`, `sign_fertility_analysis`, and `arabic_parts` are real Lilly doctrine, not invented metrics.
- BUT the current app normalizer (`api-integration-spec.md §11`) renders only verdict + interpretation text and explicitly drops aspects/timing/dignity extras. Under that UI, Option A pays 2 credits to discard ~4 of its 6 distinctive fields. The user sees essentially the same verdict + paragraph either way.
- The one field that *is* free value in Option A even text-only is the `answer` enum (`favorable/challenging/mixed/unclear`), which is more honest for fertility than a forced YES/NO — but that alone doesn't justify doubling cost and adding a fertility-specific verdict component for MVP.
- Compliance leans the same way: Option A's `fertility_score` and explicit fertility framing raise the Apple-1.4.1 medical-scrutiny surface; Option B keeps the app uniformly "traditional horary judgment," easier to defend as entertainment.

**Net:** Ship MVP on B for scope/cost/compliance simplicity, and put A on the immediate roadmap tied to a real fertility-detail screen (5th-house + fruitful-sign + Part-of-Children rendering) where its extra payload becomes visible user value. The deciding factor is Open Question 1/2 (product), not technique — escalate those to the owner.
