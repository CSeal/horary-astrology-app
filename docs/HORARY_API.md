# Astrology API v3 — Horary Astrology

**Base URL:** `https://api.astrology-api.io`
**Auth:** `Authorization: Bearer <your-api-key>` (ключ из dashboard.astrology-api.io)
**Content-Type:** `application/json`
**API version:** 3.2.10 | **Spec:** https://api.astrology-api.io/api/v3/openapi.json
**Коды ответов:** 200 OK, 400 Bad Request, 422 Validation Error, 401 UNAUTHORIZED.

## Обзор эндпоинтов

| Метод | Путь | Назначение |
|------|------|-----------|
| GET | /api/v3/horary/glossary/considerations | Справочник 8 классических соображений о радикальности карты |
| GET | /api/v3/horary/glossary/categories | Справочник категорий/подкатегорий вопросов |
| POST | /api/v3/horary/chart | Построить хорарную карту (дома, дигнитии, арабские точки) |
| POST | /api/v3/horary/fertility-analysis | Специализированный анализ вопросов о зачатии/беременности |
| POST | /api/v3/horary/aspects | Все аспекты с градусами до точности (тайминг событий) |
| POST | /api/v3/horary/analyze | Полный хорарный анализ с вердиктом (да/нет/неясно) |
| POST | /api/v3/horary/ask | Вопрос на естественном языке → AI-классификация + анализ + ответ |
| GET | /api/v3/glossary/horary-categories | Альтернативный справочник категорий (требует auth) |

---

## Общие объекты (схемы)

### DateTimeLocation
Момент, когда вопрос был понят астрологом — «рождение» карты.
- `year`, `month`, `day`, `hour`, `minute` — integer, обязательны
- `second` — integer, по умолчанию 0
- `latitude`, `longitude` — number; обязательны, если не указан `city`
- `city` — string; обязателен, если не указаны координаты
- `country_code` — ISO 3166-1 alpha-2 (рекомендуется вместе с `city`)
- `timezone` — TZ-имя (Europe/London); опционально, авто-определяется

### ChartOptions
- `house_system` — по умолчанию "P" (Placidus); для хорара рекомендуется "R" (Regiomontanus)
- `zodiac_type` — "Tropic" (по умолч.) / "Sidereal"
- `active_points` — массив точек
- `precision` — integer 0–8 (по умолч. 2)

### HoraryOptions
- `language` — en (по умолч.), de, ru, fr, es и др.

### AskHoraryOptions
- `language` — если null, язык авто-определяется из текста вопроса
- `classification_threshold` — number, по умолч. 0.7

---

## 1. GET /api/v3/horary/glossary/considerations
Справочник 8 традиционных соображений о радикальности карты (по «Christian Astrology» Уильяма Лилли): ранний асцендент (<3°), поздний асцендент (>27°), Луна «без курса» (void of course) и др. Возвращает названия, пороги, уровни важности (low/medium/high) и описания. Параметров нет.

## 2. GET /api/v3/horary/glossary/categories
Справочник категорий вопросов и подкатегорий.
**Query:** `language` (string, по умолч. en) — язык значений сигнификаторов (en, ru, de, fr, es).

---

## 3. POST /api/v3/horary/chart → HoraryChartResponse
Строит хорарную карту.

**HoraryChartRequest:**
- `question_time` — DateTimeLocation, **обязательно**
- `chart_options` — ChartOptions (по умолч. Regiomontanus "R")
- `options` — HoraryOptions (язык)
- `question` — легаси-поле, в расчёте не используется

**Ответ:** chart_data (object), dignities (DignityInfo[]), arabic_parts (ArabicPart[]), house_system (string).

```json
{
  "question_time": { "year": 2026, "month": 1, "day": 15, "hour": 14, "minute": 30, "second": 0, "city": "London", "country_code": "GB" }
}
```

---

## 4. POST /api/v3/horary/fertility-analysis → FertilityAnalysisResponse
Специализированный анализ вопросов о зачатии/беременности: fertility score (0–100), анализ плодовитых/бесплодных знаков, арабские точки (Part of Children, Part of Pregnancy), анализ 5-го дома, окна благоприятного тайминга.

**FertilityAnalysisRequest:**
- `question_time` — DateTimeLocation, **обязательно**
- `chart_options` — ChartOptions
- `include_timing` — boolean, по умолч. true
- `extended_lunar_sequence` — boolean, по умолч. true (45° lookahead, 10–22 аспекта)
- `max_lookahead_degrees` — number, по умолч. 45
- `question` — легаси, не используется

**Ответ:** fertility_score, answer, sign_fertility_analysis, arabic_parts, fifth_house_analysis, lunar_analysis, significator_aspects, planetary_future_aspects, timing_windows, interpretation, radicality.

---

## 5. POST /api/v3/horary/aspects → HoraryAspectsResponse
Все аспекты планет с градусами до точности — для тайминга событий. Традиционные 7 планет; аспекты: соединение (0°), секстиль (60°), квадрат (90°), трин (120°), оппозиция (180°). Время ответа ~50 мс.

**HoraryAspectsRequest:**
- `question_time` — DateTimeLocation, **обязательно**
- `max_lookahead_degrees` — number, по умолч. 45 (можно 90 для расширенного)
- `include_separating` — boolean, по умолч. false
- `planets` — массив или null (по умолч. все 7: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn)
- `chart_options` — ChartOptions
- `include_ingresses` — boolean, по умолч. true
- `include_stations` — boolean, по умолч. true (Солнце/Луна исключаются)
- `max_station_days` — number, по умолч. 365

**Ответ:** applying_aspects (PlanetaryFutureAspect[]), separating_aspects, count, max_lookahead_degrees, planets_used, chart_time, ingresses, stations.

**PlanetaryFutureAspect:** planet1, planet2, aspect_type, degrees_to_perfection, orb, applying_planet, receiving_planet, perfection_sign, is_applying, p1_retrograde, p2_retrograde.

---

## 6. POST /api/v3/horary/analyze → HoraryAnalysisResponse
Полный хорарный анализ с вердиктом: проверка радикальности, идентификация сигнификаторов, анализ перфекции аспектов, рецепция, вердикт да/нет/неясно. Терминология: category = «материя» (предмет вопроса), subcategory = конкретный вопрос.

**HoraryAnalysisRequest:**
- `category` — string, **обязательно** (определяет дома и планеты для суждения)
- `question_time` — DateTimeLocation, **обязательно**
- `subcategory` — string или null
- `subject_role` — string, по умолч. "self" (другие значения «поворачивают» карту по доктрине производных домов Лилли)
- `chart_options` — ChartOptions
- `include_timing` — boolean, по умолч. true
- `extended_lunar_sequence` — boolean, по умолч. true
- `max_lookahead_degrees` — number, по умолч. 45
- `options` — HoraryOptions (язык)
- `question` — легаси, не используется

**Ответ:** category, subcategory, radicality (RadicalityCheckResponse), significators (SignificatorInfo[]), aspect_perfections (AspectPerfection[]), lunar_analysis (LunarSequence), reception_analysis, judgment (Judgment), timing, secondary_perfection, chart_data, turned_for.

**Judgment:** answer, confidence, confidence_band, reasoning, key_factors, testimony_score, voc_considered, voc_treatment, timing, engine_overrides_applied.

```json
{ "category": "career", "subcategory": "get_position",
  "question_time": { "year":2026,"month":2,"day":10,"hour":9,"minute":15,"city":"New York","country_code":"US" },
  "chart_options": { "house_system":"R" }, "include_timing": true }
```

---

## 7. POST /api/v3/horary/ask → AskHoraryResponse
Вопрос на естественном языке (макс. 500 символов). API через AI классифицирует его в категорию/подкатегорию, проводит полный классический хорарный анализ и возвращает технический результат + ответ простым языком на языке вопроса. Язык авто-определяется (override через options.language).
**Стоимость:** 10 кредитов за запрос (два LLM-вызова: классификация + резюме).

**AskHoraryRequest:**
- `question` — string, **обязательно**
- `question_time` — DateTimeLocation, **обязательно**
- `chart_options` — ChartOptions
- `options` — AskHoraryOptions

**Ответ** = все поля HoraryAnalysisResponse плюс:
- `ai_classification` (AIClassification): category, subcategory, subject_role, transformed_intent, is_horary_appropriate, rejection_reason, confidence, reasoning, detected_language, alternatives, warnings
- `ai_answer` (AIAnswer): plain_answer, summary, recommendation

```json
{ "question": "Когда я выйду замуж?",
  "question_time": { "year":2026,"month":5,"day":17,"hour":14,"minute":30,"city":"Moscow","country_code":"RU" } }
```

---

## Вспомогательные подсхемы ответов
- **SignificatorInfo:** role, planet, reason, house, dignity_info
- **DignityInfo:** planet, sign, domicile_ruler, exaltation_ruler, essential_dignity, dignity_score, accidental_conditions
- **AspectPerfection:** planet1, planet2, aspect_type, orb, is_applying, will_perfect, degrees_to_perfection
- **ArabicPart:** name, sign, degree, absolute_longitude, house, interpretation
- **LunarSequence:** moon_longitude, moon_sign, degrees_to_sign_change, is_void_of_course, …

---

## Заметки для использования в проекте
- Для хорара ставьте chart_options.house_system = "R" (Regiomontanus) — традиционный и дефолтный для хорарных эндпоинтов.
- Поле question во всех POST — легаси, на расчёт не влияет: результат определяют category / subcategory / question_time (для /ask — текст вопроса).
- В DateTimeLocation указывайте либо city+country_code, либо latitude+longitude.
- /ask стоит 10 кредитов (использует LLM); остальные — обычные расчётные.
