// ============================================================================
// Astrology API — Horary Astrology (/api/v3/horary/*)
// Public barrel: import everything from here.
//
//   import type { AskHoraryRequest, AskHoraryResponse } from "./horary";
//
// Endpoints:
//   GET  /api/v3/horary/glossary/considerations   (2 credits)
//   GET  /api/v3/horary/glossary/categories       (2 credits)
//   POST /api/v3/horary/chart                      (2 credits)
//   POST /api/v3/horary/fertility-analysis         (2 credits)
//   POST /api/v3/horary/aspects                    (2 credits)
//   POST /api/v3/horary/analyze                    (2 credits)
//   POST /api/v3/horary/ask                        (10 credits)
//
// Base URL: https://api.astrology-api.io
// Auth:     Authorization: Bearer YOUR_SECRET_TOKEN
// ============================================================================

export * from "./common";
export * from "./datetime-location";
export * from "./chart-options";
export * from "./options";
export * from "./shared-models";
export * from "./errors";
export * from "./endpoints";
