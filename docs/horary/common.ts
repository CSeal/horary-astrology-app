// ============================================================================
// common.ts
// Shared / common types for Astrology API — Horary Astrology (/api/v3/horary/*)
// ============================================================================

/** Zodiac sign short codes used throughout responses. */
export type SignAbbr =
  | "Ari" | "Tau" | "Gem" | "Can" | "Leo" | "Vir"
  | "Lib" | "Sco" | "Sag" | "Cap" | "Aqu" | "Pis";

/** Full zodiac sign names (used in some lunar fields, e.g. moon_sign). */
export type SignName =
  | "Aries" | "Taurus" | "Gemini" | "Cancer" | "Leo" | "Virgo"
  | "Libra" | "Scorpio" | "Sagittarius" | "Capricorn" | "Aquarius" | "Pisces";

/** Traditional 7 planets used in horary judgment. */
export type TraditionalPlanet =
  | "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn";

/**
 * Celestial points accepted in chart_options.active_points.
 * Known values are enumerated; the API also accepts additional points
 * (asteroids, dwarf planets, fixed stars, etc.) hence the string fallback.
 */
export type KnownActivePoint =
  | "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn"
  | "Mean_Node" | "True_Node" | "Mean_South_Node" | "True_South_Node"
  | "Ascendant" | "Medium_Coeli" | "Chiron" | "Mean_Lilith"
  | "Part_of_Fortune" | "Part_of_Spirit";
export type ActivePoint = KnownActivePoint | (string & {});

/** The five Ptolemaic aspects used in horary. */
export type AspectType =
  | "conjunction" | "sextile" | "square" | "trine" | "opposition";

/** House system code. "R" = Regiomontanus (horary default). */
export type KnownHouseSystem = "R";
export type HouseSystemCode = KnownHouseSystem | (string & {});

export type ZodiacType = "Tropic" | "Sidereal";

export type KnownAyanamsa =
  | "lahiri" | "krishnamurti" | "raman" | "yukteshwar"
  | "true_citra" | "fagan_bradley";
export type Ayanamsa = KnownAyanamsa | (string & {});

export type Perspective =
  | "geocentric" | "heliocentric" | "draconic" | "barycentric";

/** Languages for interpretations/messages. */
export type KnownLanguageCode = "en" | "de" | "ru" | "fr";
export type LanguageCode = KnownLanguageCode | (string & {});

export type SeverityLevel = "low" | "medium" | "high";

/** Strength/importance bands used across analyses. */
export type ConfidenceBand = "very_low" | "low" | "medium" | "high" | "very_high";

/** Yes/No/Unclear judgment answer. */
export type JudgmentAnswer = "yes" | "no" | "unclear";

/** Recommendation outcomes. */
export type Recommendation = "proceed" | "wait" | "do_not_proceed";

/** Fertility classification of a sign / placement. */
export type FertilityLevel = "fruitful" | "barren" | "neutral";

/** Importance weighting label used in fertility analysis. */
export type ImportanceLevel = "primary" | "high" | "medium" | "low";

/** Essential dignity states. */
export type EssentialDignityState =
  | "domicile" | "exaltation" | "triplicity" | "term" | "face"
  | "detriment" | "fall" | "peregrine";

/** Accidental condition labels (house placement etc.). */
export type AccidentalCondition = "angular" | "succedent" | "cadent" | (string & {});

/** Time units used in timing predictions. */
export type TimeUnit = "hours" | "days" | "weeks" | "months" | "years";

/** VoC effective strength label. */
export type VocEffectiveStrength = "full" | "partial" | "none";

/** How VoC was treated in judgment. */
export type VocTreatment = "applied" | "not_applicable" | "ignored";
