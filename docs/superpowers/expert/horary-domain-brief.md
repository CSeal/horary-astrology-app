---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [William-Lilly-Christian-Astrology-1647, astrology-api-docs, competitor-research-planning-phase, CLAUDE.md]
reviewed_by: owner-pending
---

# Horary Astrology — Domain Expert Brief

## Purpose

This document provides the domain knowledge foundation required for all engineers, designers, and agents working on the Horary Astrology app. It defines what horary astrology is, how it works technically, and how the astrology-api.io API maps to this methodology. No prior astrology knowledge is assumed.

---

## What is Horary Astrology?

Horary astrology is a branch of traditional (classical) astrology that answers specific questions by casting an astrological chart for the exact moment the question is sincerely asked and understood by an astrologer (or, in our case, received by the app). The resulting chart — called a **horary chart** — is interpreted to determine the answer.

Key distinction from other astrology:
- **Natal astrology** requires a birth date/time/place and describes a person's character and life path.
- **Transit astrology** overlays current planetary positions on a birth chart to forecast trends.
- **Horary astrology** requires only the moment of the question. No birth data needed. The chart IS the answer.

The technique has been practiced since at least the medieval period. The definitive modern reference is **William Lilly's "Christian Astrology" (1647)**, still the primary textbook for contemporary horary practitioners.

---

## The Five-Step Horary Process

### Step 1: The Question

The querent (person asking) formulates a sincere, specific question. Horary works best for:
- Binary outcome questions: "Will I get the job?"
- Specific-matter questions: "Is this house a good purchase?"
- Lost-item questions: "Where is my missing ring?"
- Relationship questions: "Does she have feelings for me?"

It does NOT work well for:
- Vague questions: "What will happen to me?"
- Multiple questions in one
- Questions asked out of idle curiosity (not sincere intent)
- Questions asked repeatedly until the answer changes ("horary spam")

### Step 2: Cast the Chart

A horary chart is cast for the exact moment the question is received. In our app, this is the timestamp of the API call. The chart requires:
- Date, time, and geographic coordinates (latitude/longitude)
- House system: **Regiomontanus** (the traditional standard for horary)
- Planetary positions computed from an ephemeris (astrology-api.io uses Swiss Ephemeris DE431)

### Step 3: Identify the Significators

**Significators** are the planets assigned to represent key parties in the question:

| Role | Significator Assignment |
|---|---|
| **Querent** (person asking) | Ruler of the Ascendant (1st house cusp sign) |
| **Quesited** (topic/matter) | Ruler of the house that governs the question topic |
| **Moon** | Co-significator of the querent; tracks the flow of events |

House-to-topic mapping (see House Rulerships section below) determines which planet represents the matter being asked about.

Example: "Will I get the job?" — The 10th house governs career. The ruler of the 10th house sign is the quesited significator. The ruler of the Ascendant sign is the querent significator.

### Step 4: Examine Aspects Between Significators

The key question is: are the querent's significator and the quesited significator moving toward or away from each other?

- **Applying aspect** (planets moving toward exact angle): indicates a future event is developing → positive indicator for YES
- **Separating aspect** (planets moving away from exact angle): indicates the event has already passed or will not occur → indicator for NO
- **No aspect forming** (planets not in aspect and not moving toward one): matter will not come to pass

Major aspects examined (by angle):
| Aspect | Angle | Meaning |
|---|---|---|
| Conjunction | 0° | Merger/meeting — generally positive if benefics involved |
| Sextile | 60° | Mild opportunity — positive |
| Square | 90° | Tension/difficulty — challenging but can still complete |
| Trine | 120° | Ease and flow — most positive |
| Opposition | 180° | Confrontation/separation — generally negative |

### Step 5: Check Modifying Conditions

Several conditions modify or override the basic aspect analysis:

| Condition | Effect |
|---|---|
| **Void-of-course Moon** | Moon makes no more major aspects before leaving its sign. Traditional meaning: "nothing will come of the matter." Strong NO indicator, though William Lilly noted exceptions (e.g., Moon in Cancer, Taurus, Sagittarius, or Pisces). |
| **Mutual reception** | Significators are each in the other's sign of rulership → strong YES indicator even without direct aspect |
| **Translation of light** | A third (faster) planet carries light between significators by aspecting both → event will happen through an intermediary |
| **Collection of light** | A slower planet receives aspects from both significators → YES via a third party |
| **Prohibition** | A third planet aspects one significator before it reaches the other → event is blocked |
| **Frustration** | One significator turns retrograde before completing the aspect → event falls apart |
| **Combust** | A significator is within 8°30' of the Sun → severely weakened planet; unreliable indicator |
| **Retrograde significator** | Planet moving backward → querent may change their mind; delays; things return to former state |

---

## Radicality Check

Before interpreting a horary chart, astrologers check if the chart is **radical** (fit to be judged). Radicality conditions:

1. **Ascendant degree**: Should be between 3° and 27° of the sign. Below 3° suggests the question is premature; above 27° suggests the matter is too late (already decided).
2. **Rising sign match**: The rising sign or its ruler should reflect the querent's physical description or circumstances (a subjective check for human astrologers; automated tools skip this).
3. **Saturn in the 1st or 7th house**: Traditional warning that the chart may not be radical; modern practitioners often disregard this.

In our API implementation, the `radicality` check is surfaced in the response but does not block judgment delivery.

---

## House Rulerships — Question Categories

| House | Governs | Question Examples |
|---|---|---|
| 1st | The querent themselves; the body | "Am I sick?" "Will I succeed?" |
| 2nd | Money, possessions, resources, moveable wealth | "Will I get the loan?" "Is this investment safe?" |
| 3rd | Siblings, short travel, communication, neighbors, contracts | "Will the letter arrive?" "Should I sign the contract?" |
| 4th | Home, property, real estate, father, endings, buried treasure | "Should I buy this house?" "Will my father recover?" |
| 5th | Children, pregnancy, creativity, romance, speculation, gambling | "Am I pregnant?" "Will this project succeed?" "Will he ask me out?" |
| 6th | Illness, work/employment (employee side), small animals | "Will I recover?" "Will I keep my job?" |
| 7th | Partners, romantic relationships, marriage, open enemies, consultants | "Will we get married?" "Will I win the lawsuit?" |
| 8th | Death, transformation, others' money, inheritance, surgery | "Will I inherit?" "Should I have the surgery?" |
| 9th | Long travel, foreign matters, higher education, religion, law | "Should I take the trip?" "Will I pass the exam?" |
| 10th | Career, profession, reputation, authority, mother | "Will I get the promotion?" "Should I start the business?" |
| 11th | Hopes, wishes, friends, groups, organizations | "Will my wish come true?" "Will the team succeed?" |
| 12th | Hidden enemies, self-undoing, confinement, institutions | "Am I being deceived?" |

---

## Judgment Output Mapping

The astrology-api.io API returns a `judgment` field. Here is how each value maps to interpretation:

| API Value | Meaning | Primary Indicators |
|---|---|---|
| `YES` | The matter will come to pass as desired | Applying trine, sextile, or conjunction between significators; mutual reception; strong dignities |
| `NO` | The matter will not come to pass | Separating aspects only; void-of-course Moon; prohibition; frustration; combust significator |
| `MAYBE` | Mixed testimonies; outcome uncertain or conditional | Some applying aspects combined with adverse conditions; retrograde planets |
| `UNCLEAR` | Chart cannot be reliably judged | Non-radical chart; insufficient aspects; conflicting major testimonies |

---

## Essential and Accidental Dignity

Planets are not equal in strength. Dignity affects how reliable a significator is.

### Essential Dignity (by sign position)

| Dignity | Strength | Description |
|---|---|---|
| Domicile (Rulership) | Strongest | Planet in its own sign (e.g., Mars in Aries) |
| Exaltation | Very strong | Planet in its sign of exaltation (e.g., Sun in Aries) |
| Triplicity | Moderate | Planet in a compatible element |
| Term | Mild | Planet within specific degree range in a sign |
| Face (Decan) | Weak | Planet in its 10° face |
| Detriment | Debilitated | Planet in the sign opposite its domicile (e.g., Mars in Libra) |
| Fall | Most debilitated | Planet in the sign opposite its exaltation (e.g., Sun in Libra) |

### Accidental Dignity (by chart position and condition)

| Condition | Strength Effect |
|---|---|
| Angular house (1, 4, 7, 10) | Stronger |
| Succedent house (2, 5, 8, 11) | Moderate |
| Cadent house (3, 6, 9, 12) | Weakened |
| Direct motion | Normal |
| Retrograde | Weakened / reversed |
| Combust (within 8°30' of Sun) | Severely weakened |
| Under the beams (within 17° of Sun) | Weakened |
| Cazimi (within 17' of Sun's exact degree) | Greatly strengthened |
| Oriental / occidental conditions | Minor modifiers |

---

## The Seven Traditional Planets

Horary uses the traditional seven planets (pre-telescope). Modern outer planets (Uranus, Neptune, Pluto) are sometimes included in contemporary practice but are not the primary significators.

| Planet | Symbol | Rules (Domicile) | Key Themes |
|---|---|---|---|
| Sun | ☉ | Leo | Authority, vitality, the father, leadership |
| Moon | ☽ | Cancer | Emotions, the public, women, change, flow of events |
| Mercury | ☿ | Gemini, Virgo | Communication, contracts, travel, commerce, the mind |
| Venus | ♀ | Taurus, Libra | Love, beauty, pleasure, money, arts |
| Mars | ♂ | Aries, Scorpio | Action, conflict, surgery, fire, desire |
| Jupiter | ♃ | Sagittarius, Pisces | Expansion, luck, justice, religion, long travel |
| Saturn | ♄ | Capricorn, Aquarius | Restriction, time, endings, death, authority, real estate |

---

## API Response Structure Reference

The astrology-api.io `POST /horary/ask` endpoint returns the following fields. This maps to our UI components:

```json
{
  "classification": "relationship",
  "judgment": "YES",
  "confidence_band": "HIGH",
  "significators": [
    {
      "planet": "Venus",
      "role": "querent",
      "sign": "Taurus",
      "house": 1,
      "dignity": "domicile",
      "retrograde": false
    },
    {
      "planet": "Mars",
      "role": "quesited",
      "sign": "Cancer",
      "house": 3,
      "dignity": "fall",
      "retrograde": false
    }
  ],
  "voc_treatment": "Moon is not void-of-course",
  "radicality": {
    "is_radical": true,
    "ascendant_degree": 14.3,
    "notes": "Chart is radical and fit to be judged"
  },
  "summary": "Venus, representing you, applies to a trine with Mars in the 3rd house. The applying aspect with Venus in strong dignity indicates the matter will proceed favorably. The Moon supports this judgment and is not void-of-course."
}
```

**UI mapping**:
- `judgment` → VerdictBadge component (YES/NO/MAYBE/UNCLEAR with color coding)
- `confidence_band` → ConfidencePill component (HIGH/MEDIUM/LOW)
- `significators` → SignificatorList component (planet name, role, dignity badge)
- `voc_treatment` → VocNote component (Moon status note)
- `summary` → InterpretationCard component (scrollable plain-language text)

---

## Implementation Notes for Engineers

1. **Timestamp handling**: The chart is cast for the moment the question is submitted. Use the device timestamp at the moment of API call submission, not the moment the user began typing. Convert to ISO 8601 with UTC offset.

2. **Location**: Regiomontanus houses require accurate latitude/longitude. GPS is preferred; fallback to user-provided city lookup. Always request location permission before the first question submission.

3. **Timezone**: Pass the IANA timezone string (e.g., `America/New_York`), not a UTC offset. Use `Intl.DateTimeFormat().resolvedOptions().timeZone` in React Native.

4. **Question length**: astrology-api.io accepts questions up to ~500 characters. Recommend a 280-character soft limit in the UI with a warning at 240, but do not hard-block until 500.

5. **Void-of-course Moon**: When `judgment === 'NO'` and `voc_treatment` mentions "void-of-course," the UI should surface a dedicated VOC explanation tooltip for beginner users.

6. **Confidence band display**: HIGH confidence → bold verdict; MEDIUM → normal weight; LOW → include explanatory note "The chart shows mixed indications."

7. **UNCLEAR judgment**: Display a distinct UI state — not a YES/NO badge. Show "Chart Unclear" with explanation from `summary`. Do not count this against the user's free question quota (implementation decision for Phase 2 — for MVP, all questions count equally).

---

## Glossary for UI Copy

| Term | Beginner-Friendly Definition |
|---|---|
| Horary chart | A snapshot of the sky at the exact moment your question was asked |
| Significator | The planet that represents you or your question in the chart |
| Applying aspect | Two planets moving toward each other — events are developing |
| Void-of-course Moon | The Moon has finished its business in this sign — often means "nothing comes of it" |
| Ascendant | The degree of the zodiac rising on the eastern horizon at the moment of your question |
| Dignity | How strong and reliable a planet is in its current position |
| Retrograde | A planet appearing to move backward — often signals delays or reversals |
| Regiomontanus | The house system (sky division method) used in traditional horary astrology |
