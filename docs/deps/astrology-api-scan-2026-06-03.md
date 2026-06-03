# astrology-api.io — API Scan
**Scanned:** 2026-06-03  
**API version:** 3.2.0  
**Base URL:** `https://api.astrology-api.io`  
**Auth:** `Authorization: Bearer <api_key>`  
**Content-Type:** `application/json`

---

## Summary

Horary-specific API group under `/api/v3/horary/`. Seven endpoints confirmed.  
**Language support confirmed:** `en`, `ru`, `de`, `fr`, `pt`, `es`, `zh`, `ja`, `ar`, `pl` (minimum — all returned 200 with language-native `interpretation` text).  
Free plan quota: **50 credits/month** · 2 credits per horary request = 25 horary calls.

---

## Endpoints

### 1. `GET /api/v3/horary/glossary/considerations`

Returns the 8 classical horary radicality considerations (William Lilly).

**Auth:** Required  
**Credits:** 2

**Response shape:**
```json
{
  "success": true,
  "data": {
    "considerations": [
      {
        "name": "early_ascendant",
        "display_name": "Early Ascendant",
        "traditional_meaning": "Question is premature or not yet fully formed",
        "threshold": "Less than 3° of sign",
        "severity": "medium",   // "low" | "medium" | "high"
        "weight": 15
      },
      // ... 7 more
    ],
    "total": 8,
    "source": "William Lilly's 'Christian Astrology' and classical horary texts",
    "radicality_rules": {
      "0_considerations": "Chart is radical (fit to be judged)",
      "1-2_considerations": "Chart is radical but use caution",
      "3-4_considerations": "Chart radicality is questionable",
      "5+_considerations": "Chart is not radical (unfit for judgment)"
    },
    "via_combusta": {
      "range": "15° Libra to 15° Scorpio",
      "absolute_longitude": "195° to 225°",
      "description": "The 'Burning Way' - an unfortunate region of the zodiac"
    }
  },
  "metadata": { "api_version": "3.2.0", "credits_used": 2, ... }
}
```

**All consideration names:**
`early_ascendant`, `late_ascendant`, `moon_void_of_course`, `saturn_in_1st`, `saturn_in_7th`, `via_combusta_moon`, `via_combusta_ascendant`, `ascendant_ruler_combust`

---

### 2. `GET /api/v3/horary/glossary/categories`

Returns all question categories with significators, house assignments, and subcategories.

**Auth:** Required  
**Credits:** 2

**Response shape:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": "job",
        "display_name": "Job & Employment",
        "houses": [6],
        "house_names": ["6th House of Health/Service"],
        "significators": ["L6"],
        "significator_meanings": { "L6": "Lord of 6th House..." },
        "description": "6th house of employment and service",
        "subcategories": [
          { "subcategory": "get_job", "description": "Will I get the job?", "significators": ["L6"] },
          { "subcategory": "keep_job", "description": "Will I keep my job?", "significators": ["L6"] }
        ]
      }
    ],
    "total": 11,
    "source": "William Lilly's 'Christian Astrology' and traditional horary methods",
    "concepts": { "house_lords": {...}, "natural_significators": {...}, "querent_vs_quesited": {...} },
    "traditional_rulerships": {
      "rulerships": {
        "Sun": ["Leo"], "Moon": ["Cancer"], "Mercury": ["Gemini","Virgo"],
        "Venus": ["Taurus","Libra"], "Mars": ["Aries","Scorpio"],
        "Jupiter": ["Sagittarius","Pisces"], "Saturn": ["Capricorn","Aquarius"]
      },
      "note": "Modern planets (Uranus, Neptune, Pluto) are NOT used as house rulers"
    }
  }
}
```

**All 11 categories:**
`pregnancy`, `fertility`, `love`, `marriage`, `career`, `job`, `money`, `health`, `missing_item`, `travel`, `general`

**Subcategories per category:**
| Category | Subcategories |
|----------|--------------|
| pregnancy | `will_conceive`, `will_have_children`, `boy_or_girl`, `safe_delivery` |
| fertility | `will_conceive`, `ivf_success` |
| love | `marriage`, `fidelity`, `rival`, `breakup`, `who_interested`, `compatibility` |
| marriage | `will_marry`, `marriage_happy`, `reconciliation` |
| career | `get_position`, `project_success`, `reputation`, `authority_favorable` |
| job | `get_job`, `keep_job` |
| money | `gain`, `debt_repaid`, `inheritance`, `should_invest`, `will_become_wealthy` |
| health | `will_recover`, `is_dangerous`, `nature_of_illness`, `treatment_good`, `when_crisis` |
| missing_item | `will_find`, `where_is`, `who_stole`, `will_return`, `stolen_or_lost` |
| travel | `safe_journey`, `profitable`, `will_return`, `should_emigrate` |
| general | `yes_no` |

---

### 3. `POST /api/v3/horary/chart`

Returns raw chart data only (positions, houses, dignities, Arabic parts). No judgment.

**Auth:** Required  
**Credits:** 2

**Request body:**
```json
{
  "question": "string (required)",
  "question_time": {
    "year": 2026,
    "month": 6,
    "day": 3,
    "hour": 12,
    "minute": 0,
    "second": 0,
    "city": "London",          // use city OR lat/lon
    "country_code": "GB",
    "latitude": 51.5,          // alternative to city
    "longitude": -0.1,
    "timezone": "Europe/London"
  },
  "options": {
    "language": "en"           // see Language Support section
  }
}
```

**Note:** `category` is NOT accepted at top level for this endpoint.  
**Note:** `zodiac_type` is NOT accepted in `options` — use `chart_options` instead (see analyze endpoint).

**Response shape:**
```json
{
  "success": true,
  "data": {
    "question": "...",
    "chart_data": {
      "subject_data": { "name": "Horary Question", "year": ..., "month": ..., "day": ..., "hour": ..., "minute": ..., "second": ... },
      "planetary_positions": [
        { "name": "Sun", "sign": "Gem", "degree": 12.89, "absolute_longitude": 72.89, "is_retrograde": false }
      ],
      "houses": [
        { "number": 1, "sign": "Vir", "degree": 6.64, "absolute_longitude": 156.64 }
      ],
      "house_system": "R",
      "ascendant_sign": "Vir"
    },
    "dignities": [
      {
        "planet": "Sun",
        "sign": "Gem",
        "domicile_ruler": "Mercury",
        "exaltation_ruler": null,
        "essential_dignity": "term",   // "domicile"|"exaltation"|"detriment"|"fall"|"term"|"peregrine"|null
        "dignity_score": 2,
        "accidental_conditions": []
      }
    ],
    "arabic_parts": [
      { "name": "Part of Fortune", "sign": "Aqu", "degree": 2.86, "absolute_longitude": 302.86, "house": 1, "interpretation": "..." }
    ],
    "house_system": "R"
  },
  "metadata": { "api_version": "3.2.0", "credits_used": 2, ... }
}
```

---

### 4. `POST /api/v3/horary/analyze` ⭐ (primary endpoint used by app)

Full horary analysis: chart + significators + radicality + judgment + timing.

**Auth:** Required  
**Credits:** 2

**Request body:**
```json
{
  "question": "string (required)",
  "category": "job",                 // see categories list (required)
  "subcategory": "get_job",          // optional
  "subject_role": "self",            // optional — top-level, NOT in options
                                     // "self"|"spouse_partner"|"third_party_friend"|
                                     // "third_party_employer"|"third_party_parent"|
                                     // "third_party_child"|"third_party_other"
  "question_time": {
    "year": 2026,
    "month": 6,
    "day": 3,
    "hour": 12,
    "minute": 0,
    "second": 0,
    "city": "London",
    "country_code": "GB",
    "latitude": 51.5,          // alternative to city
    "longitude": -0.1,
    "timezone": "Europe/London"
  },
  "chart_options": {
    "zodiac_type": "Tropic"    // "Tropic"|"Sidereal" — NOTE: goes in chart_options, NOT options
  },
  "include_timing": true,      // optional boolean
  "options": {
    "language": "en"           // see Language Support section
  }
}
```

**⚠️ FIELD PLACEMENT RULES (confirmed via schema validation):**
- `zodiac_type` → `chart_options.zodiac_type` (NOT `options.zodiac_type`)
- `subject_role` → top-level field (NOT inside `options`)
- Sending these in `options` returns HTTP 422 with `"extra_forbidden"` error

**Response shape:**
```json
{
  "success": true,
  "data": {
    "question": "...",
    "category": "job",
    "subcategory": null,
    "radicality": {
      "is_radical": true,
      "score": 100.0,
      "considerations": [
        {
          "name": "early_ascendant",
          "is_present": false,
          "severity": "medium",
          "message": "...(localized text)...",
          "value": 6.64
        }
      ],
      "recommendation": "proceed",   // "proceed"|"caution"|"refuse"
      "summary": "...",
      "flags": []
    },
    "significators": [
      {
        "role": "querent",            // "querent"|"quesited"
        "planet": "Mercury",
        "reason": "Lord of 1st house (Ascendant in Vir)",
        "house": 1,
        "dignity_info": {
          "planet": "Mercury",
          "sign": "Can",
          "domicile_ruler": "Moon",
          "exaltation_ruler": null,
          "essential_dignity": "term",
          "dignity_score": 2,
          "accidental_conditions": ["angular"]  // array of strings
        }
      }
    ],
    "aspect_perfections": [],
    "lunar_analysis": {
      "moon_longitude": 286.67,
      "moon_sign": "Cap",
      "degrees_to_sign_change": 13.33,
      "is_void_of_course": false,
      "voc_exception_sign": null,
      "voc_effective_strength": null,
      "applying_aspects": [
        {
          "planet": "Venus",
          "aspect_type": "opposition",
          "orb": 1.62,
          "is_applying": true,
          "degrees_to_perfection": 1.8,
          "event_order": 1,
          "is_to_quesited": false,
          "crosses_sign_boundary": false,
          "perfection_sign": "Cap"
        }
      ],
      "last_aspect": {
        "planet": "Saturn",
        "aspect_type": "square",
        "separation_degrees": 4.22,
        "context_meaning": "..."
      },
      "moon_to_quesited": { ... },
      "extended_mode": true,
      "max_lookahead_degrees": 45.0,
      "quesited_position": 3,
      "intervening_events": [...],
      "intervening_analysis": {
        "benefic_aspects": 2,
        "malefic_aspects": 0,
        "harmonious_aspects": 0,
        "challenging_aspects": 2,
        "sign_changes": 0,
        "path_character": "challenged",  // "clear"|"challenged"|"mixed"
        "total_intervening": 2
      }
    },
    "reception_analysis": {
      "has_mutual_reception": false,
      "has_one_way_reception": false,
      "reception_type": null,
      "description": "No mutual reception between significators"
    },
    "judgment": {
      "answer": "yes",               // "yes"|"no"|"unclear"|"reask_later"
      "confidence": 65.0,            // 0–100
      "confidence_band": "medium",   // "high"|"medium"|"low"
      "reasoning": "...",
      "key_factors": ["..."],
      "testimony_score": { "positive": 100.0, "negative": 0.0, "neutral": 0.0 },
      "interpretation": "...(localized, multi-sentence interpretation text)...",
      "voc_considered": false,
      "voc_treatment": "ignored_due_to_aspect",  // string or null
      "timing": null,
      "engine_overrides_applied": []
    },
    "timing": null,
    "secondary_perfection": {
      "translation": { "has_translation": false, ... },
      "collection": { "has_collection": false, ... },
      "prohibition": { "has_prohibition": false, ... },
      "frustration": { "has_frustration": false, ... },
      "enables_perfection": false,
      "prevents_perfection": false,
      "has_direct_aspect": true,
      "summary": "Direct aspect between significators exists"
    },
    "chart_data": {
      "subject_data": { ... },
      "house_system": "R",
      "ascendant_sign": "Vir",
      "planetary_positions": [ { "name": "Sun", "sign": "Gem", "degree": 12.89, "absolute_longitude": 72.89, "house": 10, "is_retrograde": false } ],
      "house_cusps": { "1": "Vir", "2": "Vir", ..., "12": "Leo" }
    },
    "turned_for": null
  },
  "metadata": {
    "timestamp": "2026-06-03T11:10:21.430224Z",
    "calculation_time_ms": 3,
    "api_version": "3.2.0",
    "endpoint": "horary.analyze",
    "request_id": "req_f36ba734b0e4",
    "cache_hit": false,
    "credits_used": 2
  },
  "warnings": null,
  "pagination": null
}
```

---

### 5. `POST /api/v3/horary/aspects`

Returns aspect data for a horary chart. Not yet called with valid auth due to quota.

**Auth:** Required  
**Credits:** 2 (estimated)

**Expected request body:** Same `question_time` structure as `/chart` + `options.language`.

---

### 6. `POST /api/v3/horary/fertility-analysis`

Specialized fertility/pregnancy analysis. Not yet called with valid auth due to quota.

**Auth:** Required  
**Credits:** 2 (estimated)

---

### 7. `POST /api/v3/horary/ask`

Confirmed exists. Not fully probed due to quota exhaustion. Likely a simplified wrapper around `/analyze`.

**Auth:** Required

---

## Language Support

Confirmed via live testing against `/api/v3/horary/analyze` (all returned 200 with native-language `interpretation` text):

| Code | Language | Confirmed | Notes |
|------|----------|-----------|-------|
| `en` | English | ✅ | Default |
| `ru` | Russian | ✅ | "Да, при условии..." |
| `de` | German | ✅ | "Ja, vorausgesetzt..." |
| `fr` | French | ✅ | "Oui, à condition..." |
| `pt` | Portuguese | ✅ | "Sim, desde que..." |
| `es` | Spanish | ✅ | "Sí, siempre que..." |
| `zh` | Chinese (Simplified) | ✅ | Full Chinese text |
| `ja` | Japanese | ✅ | Full Japanese text |
| `ar` | Arabic | ✅ | Full Arabic text |
| `pl` | Polish | ✅ | "Tak, pod warunkiem..." |
| `uk` | Ukrainian | ⚠️ | Not tested — quota exhausted |

**Conclusion:** The API fully supports all 6 app languages (`en`, `ru`, `de`, `fr`, `pt`, `es`). No fallback needed.

---

## Error Response Schema

```json
{
  "success": false,
  "error": {
    "error_code": "UNAUTHORIZED",        // string
    "message": "Invalid or expired token",
    "severity": "high",                  // "low"|"medium"|"high"
    "suggestions": ["..."]
  },
  "timestamp": "2026-06-03T11:09:40.049208"
}
```

**Known error codes:**
- `UNAUTHORIZED` — invalid/missing API key
- `RATE_LIMIT_EXCEEDED` — monthly quota exceeded (`quota_limit`, `current_usage`, `remaining_quota` included)
- Validation errors return HTTP 422 with `{ "detail": [{ "type": "extra_forbidden", "loc": ["body", "options", "zodiac_type"], "msg": "Extra inputs are not permitted" }] }`

---

## Metadata Block (all endpoints)

```json
{
  "timestamp": "2026-06-03T...",
  "calculation_time_ms": 3,
  "api_version": "3.2.0",
  "endpoint": "horary.analyze",
  "request_id": "req_f36ba734b0e4",
  "cache_hit": false,
  "cache_age_seconds": null,
  "credits_used": 2,
  "server_location": null,
  "calculation_method": null
}
```

---

## Credits & Pricing

| Plan | Price | Credits/month | Horary calls |
|------|-------|--------------|--------------|
| Free | $0 | 50 | 25 |
| Pro | $11 | 1,000 | 500 |
| Pro Plus | $21 | 7,000 | 3,500 |
| Ultra | $37 | 55,000 | 27,500 |
| Business | $99 | 220,000 | 110,000 |
| Enterprise | $399+ | Unlimited | Unlimited |

Each horary endpoint call costs **2 credits**.

---

## Known Issues / Action Items for the App

### BUG: `horaryApi.ts:137` — hardcoded language fallback

```ts
// Current (wrong for 6-language app):
const language = i18n.language === 'ru' ? 'ru' : 'en';

// Should be (API supports all 6):
const SUPPORTED_API_LANGUAGES = ['en', 'ru', 'de', 'fr', 'pt', 'es'] as const;
const language = SUPPORTED_API_LANGUAGES.includes(i18n.language as typeof SUPPORTED_API_LANGUAGES[number])
  ? i18n.language
  : 'en';
```

### CONFIRMED OK: `horaryMapper.ts` field placement

- `zodiac_type` → `chart_options.zodiac_type` ✅ (correct)
- `subject_role` → top-level field ✅ (correct)
- `language` → `options.language` ✅ (correct)

### NOTE: Free plan quota

50 credits = 25 horary calls per month. App `MONTHLY_QUESTION_LIMIT = 5` fits within the free plan.  
Users with personal API keys get their own plan quota.
