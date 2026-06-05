---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [aso-brief.md, prd-v1.md, docs/qa-summary.md, src/i18n/en.ts, app.json]
reviewed_by: owner-pending
---

# App Store Reviewer Notes — Hora: Horary Chart

**Bundle ID:** com.hora.app
**Version:** 1.0.0
**Date prepared:** 2026-06-04
**Privacy Policy URL:** [PRIVACY_POLICY_URL]

---

## Section 1: App Description for Reviewer

**For the "Notes" field in App Store Connect → App Review Information:**

Hora is a horary astrology calculator that uses the classical William Lilly method (17th century) combined with modern AI interpretation to analyze user questions. The app casts an astrological chart for the precise moment a question is asked, then uses AI to interpret the chart's planetary significators and deliver a verdict (YES / NO / MAYBE / UNCLEAR) in plain language.

**This is not a fortune-telling app.** Horary astrology is a 600-year-old analytical technique codified in William Lilly's "Christian Astrology" (1647). The app is positioned as an educational and analytical tool — the same framing used by lunar calendar apps, traditional astrology reference apps, and astrological chart calculators that have been approved on the App Store.

The app does NOT:
- Generate random predictions
- Claim guaranteed outcomes
- Offer paid psychic or human-assisted readings
- Collect user data beyond what is required for chart calculation (see Privacy Policy)

The app DOES:
- Apply a deterministic, publicly documented astrological calculation method (Swiss Ephemeris DE431, Regiomontanus houses)
- Generate AI interpretation of the calculated chart
- Save readings locally to the user's private journal
- Display an entertainment disclaimer in Settings → About

**Guideline 4.3(b) compliance:** The app provides a unique, high-quality horary astrology experience not available from any other App Store listing. It is the only native mobile horary app with AI plain-language interpretation, full Russian language support, and a question journal. It is differentiated from both general horoscope apps and raw chart tools.

---

## Section 2: Entertainment Disclaimer

**This text must appear in the app before submission. Recommended location: Settings → About section.**

Add the following string to the Settings screen "About" section (below the version number):

```
For entertainment and educational purposes only. Hora uses traditional horary 
astrology (William Lilly, 17th century) to analyze questions. Results are not 
professional advice and should not be used as a substitute for qualified legal, 
financial, medical, or psychological guidance.
```

**i18n key to add to en.ts:**
```typescript
settings: {
  ...
  disclaimer: 'For entertainment and educational purposes only. Hora uses traditional horary astrology (William Lilly, 17th century) to analyze questions. Results are not professional advice and should not be used as a substitute for qualified legal, financial, medical, or psychological guidance.',
  disclaimerTitle: 'About Hora',
}
```

**Implementation note:** This disclaimer should be visible without requiring the user to scroll, ideally as static text near the bottom of the Settings screen or in a dedicated "About" card that is always visible when the Settings screen loads.

---

## Section 3: Reviewer Access — Mock Mode

Hora uses a Bring Your Own Key (BYOK) model: each user provides their own astrology-api.io API key. There is no shared demo key.

Use the built-in Mock Mode to test all app features without any API key:

1. Open the app and complete onboarding (tap "Next" twice, then allow or skip location)
2. Go to the **Settings** tab (rightmost tab, almanac icon)
3. Tap the version label at the bottom (e.g. "v 1.0.0") **20 times** within 4 seconds
4. A PIN prompt appears — enter: **[DEMO_PIN]**
5. Developer Mode unlocks
6. Enable **"Mock API responses"** toggle
7. Choose a verdict (YES / NO / UNCLEAR)
8. Go to **Home** tab → ask any question → full verdict flow runs with simulated data

All screens are accessible in Mock Mode: verdict, full reading, journal, chart wheel, outcome tracking.

> **Note:** The BYOK model means no account registration is required — users get their own key from astrology-api.io.

### Step-by-Step Test Walkthrough

**Scenario 1: Basic question flow**
1. Launch the app
2. Complete 3-step onboarding (Welcome → How It Works → Location)
3. On the Home screen, tap the question input field
4. Type a question of at least 5 characters, e.g., "Will I get the job offer this month?"
5. Select a question category (e.g., "Career") — optional
6. Tap "Ask the Stars"
7. Wait for the loading animation (approximately 1-2 seconds)
8. The Verdict Screen appears showing: verdict badge (YES/NO/MAYBE/UNCLEAR), confidence band (HIGH/MEDIUM/LOW), AI interpretation paragraph, and planetary significators
9. Tap "See the full reading" to see significators, aspects, and timing data on the Full Reading screen
10. Tap the "Journal" tab to see the saved entry

**Scenario 2: Language switch**
1. Go to Settings tab
2. Under "LANGUAGE", tap the "EN" / "RU" toggle
3. All UI strings immediately update to Russian (or back to English)
4. No app restart required

**Scenario 3: Journal deletion**
1. In the Journal tab, swipe left on any journal entry
2. A red "Delete" action appears
3. Tap "Delete" → confirm in the dialog
4. The entry is removed

**Scenario 4: API key management**
1. Go to Settings → API KEY section
2. Enter a key and tap "Save Key"
3. The source indicator updates to "Using: personal key"
4. Tap "Remove key" to revert to the app default

---

## Section 4: Age Rating Justification

### Recommended Age Rating: 4+

**Apple App Store:**

| Content Category | Rating Applied | Justification |
|---|---|---|
| Violence | None | No violent content |
| Mature/Suggestive Themes | None | Celestial/cosmic visual theme is not sexually suggestive |
| Horror | None | Dark UI theme is aesthetic, not horror |
| Alcohol, Tobacco, Drugs | None | Not present |
| Gambling | None | Not present |
| Sexual Content | None | Not present |
| Profanity | None | Not present |
| Cartoon/Fantasy Violence | None | Not present |

**Recommended rating: 4+**

The dark celestial design theme (deep space colors, star field, gold accents) is aesthetic — it aligns with apps like Co-Star, The Pattern, and Night Sky, all of which are rated 4+.

**Google Play:**

Recommended rating: **Everyone**

The app contains no mature content, violence, gambling, or user-generated social features that would require a higher rating.

---

## Section 5: Pregnancy/Fertility Category Justification

Hora supports horary astrology questions in the "Pregnancy" and "Fertility" question categories. These are routed through the same `/api/v3/horary/analyze` endpoint as all other questions (career, love, money, etc.) and return the same verdict format (YES/NO/MAYBE/UNCLEAR).

**This is not a health or medical app.** The pregnancy/fertility categories are equivalent to what a "lunar calendar" or "fertility moon cycle" app offers — traditional folk methods for timing decisions, presented as cultural/educational content. All mainstream lunar calendar apps with fertility tracking (Flo, Clue, Moon Calendar) are rated 4+ or Everyone without health disclaimers.

**The app does NOT:**
- Access HealthKit or Google Fit
- Store biometric data
- Claim medical accuracy
- Request any health-related system permissions

**The in-app disclaimer** (see Section 2) explicitly states that results are not professional advice and should not replace qualified medical guidance.

**No special age rating or health declaration is required** for traditional astrological method apps that include pregnancy question types.

---

## Section 6: Privacy Policy

Privacy Policy URL: **[PRIVACY_POLICY_URL]**

(To be deployed via GitHub Pages — see scripts/build-privacy.js and .github/workflows/deploy-privacy.yml)

Key privacy facts for the reviewer:
- No user accounts, no registration
- No analytics SDK
- No advertising network
- Journal data stored locally on-device only
- Location sent per-request to astrology-api.io for chart calculation (HTTPS)
- Uninstall removes all data

---

## Section 7: App Store Review — Additional Notes

**Primary concern for reviewers:** Apple Guideline 4.3(b) (fortune telling). Our pre-emptive response:

1. The app name includes "Horary Chart" — framing the product as a chart calculation tool
2. The subtitle reads "Ask. Get an Instant Answer." — benefit-focused, not fortune-telling language
3. The description explicitly names the classical method (William Lilly, Regiomontanus houses, Swiss Ephemeris DE431)
4. The screenshots show actual chart functionality: verdict display, significator rows, AI interpretation, question journal
5. The Settings screen includes the entertainment disclaimer
6. The onboarding explains the methodology at step 2 ("The sky casts your horary chart")

If the reviewer requires further documentation of the horary technique's academic credibility, William Lilly's "Christian Astrology" (1647) is available digitally and is the foundational reference text for this 600-year-old method.

---

*Hora: Horary Chart — Reviewer Notes v1.0*
*Date: 2026-06-04*
