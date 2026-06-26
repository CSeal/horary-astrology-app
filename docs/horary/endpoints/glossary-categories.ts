// ============================================================================
// endpoints/glossary-categories.ts
// GET /api/v3/horary/glossary/categories   (2 credits)
// Reference of question categories, houses and significators.
// No request body / query params.
// ============================================================================

export interface HoraryCategoryGlossaryItem {
  /** Machine category, e.g. "pregnancy". */
  category: string;
  /** Display name, e.g. "Pregnancy & Conception". */
  display_name: string;
  /** Relevant house numbers. */
  houses: number[];
  /** House names, e.g. ["5th House of Children"]. */
  house_names: string[];
  /** Significator codes, e.g. ["L5", "Moon", "Jupiter"]. */
  significators: string[];
  /** Map of significator code -> meaning. */
  significator_meanings: Record<string, string>;
  /** Short description of how the category is judged. */
  description: string;
}

/** 200 — Reference of horary question categories and significators. */
export interface GetCategoriesGlossaryResponse {
  categories: HoraryCategoryGlossaryItem[];
  /** Total number of categories. */
  total: number;
}
