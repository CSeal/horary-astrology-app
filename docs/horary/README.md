# Astrology API — Horary Astrology TypeScript types

TypeScript type definitions for the **Horary Astrology** section of the
Astrology API (`/api/v3/horary/*`).

- **Base URL:** `https://api.astrology-api.io`
- **Auth:** `Authorization: Bearer YOUR_SECRET_TOKEN`

## Endpoints

| Method | Path | Credits | Request type | Response type |
|--------|------|---------|--------------|---------------|
| GET  | /api/v3/horary/glossary/considerations | 2 | — | `GetConsiderationsGlossaryResponse` |
| GET  | /api/v3/horary/glossary/categories     | 2 | — | `GetCategoriesGlossaryResponse` |
| POST | /api/v3/horary/chart                   | 2 | `HoraryChartRequest` | `HoraryChartResponse` |
| POST | /api/v3/horary/fertility-analysis      | 2 | `FertilityAnalysisRequest` | `FertilityAnalysisResponse` |
| POST | /api/v3/horary/aspects                 | 2 | `HoraryAspectsRequest` | `HoraryAspectsResponse` |
| POST | /api/v3/horary/analyze                 | 2 | `HoraryAnalyzeRequest` | `HoraryAnalyzeResponse` |
| POST | /api/v3/horary/ask                     | 10 | `AskHoraryRequest` | `AskHoraryResponse` |

## Structure

```
horary/
  index.ts               # public barrel — import from here
  common.ts              # primitive enums/unions (signs, planets, aspects, ...)
  datetime-location.ts   # DateTimeLocation input
  chart-options.ts       # ChartOptions, FixedStarsConfig, ActiveAspectConfig
  options.ts             # HoraryOptions, AskHoraryOptions
  shared-models.ts       # reused models (dignities, significators, judgment, ...)
  errors.ts              # 400 / 422 error shapes
  endpoints/
    index.ts
    glossary-considerations.ts
    glossary-categories.ts
    chart.ts
    fertility-analysis.ts
    aspects.ts
    analyze.ts
    ask.ts
```

## Usage

```ts
import type { AskHoraryRequest } from "./horary";

const body: AskHoraryRequest = {
  question: "Will I get the job I interviewed for?",
  question_time: { year: 2026, month: 1, day: 15, hour: 7, minute: 49, city: "London", country_code: "GB" },
};
```

## Notes

- The `question` field on the classic endpoints (`chart`, `fertility-analysis`, `analyze`) is
  **deprecated** — accepted for backwards compatibility but not used in calculation.
  Classification is driven by `category` / `subcategory` (and by the AI classifier on `/ask`).
- Some deeply nested objects in the demo docs are shown abbreviated
  (e.g. `chart_data.planetary_positions`, `reception_analysis`, `quesited_position`);
  these are typed as `unknown` / open records where the exact schema is not exposed.
- Open string-unions use a `| (string & {})` fallback for autocomplete of known values
  while still allowing others (e.g. `ActivePoint`, `Ayanamsa`).

_Generated from the Astrology API interactive documentation._
