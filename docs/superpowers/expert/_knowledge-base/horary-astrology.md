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
