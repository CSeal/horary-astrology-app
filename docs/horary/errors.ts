// ============================================================================
// errors.ts
// Shared error response shapes (400 / 422).
// ============================================================================

/** 400 — Invalid horary parameters. */
export interface HoraryBadRequestError {
  detail: string;
}

/** A single FastAPI-style validation issue. */
export interface ValidationIssue {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

/** 422 — Validation error (check question format / fields). */
export interface ValidationError {
  detail: ValidationIssue[];
}
