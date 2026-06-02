// src/types/location.ts
// Manually-picked location. Two distinct uses share this shape:
//   1. Per-question override (Home) — ephemeral, cleared after each submission.
//   2. Home location (settings) — persisted; the default/fallback when GPS is
//      unavailable or the source is set to 'manual'. See settingsStore.

export interface LocationOverride {
  latitude: number;
  longitude: number;
  city: string;
  displayName: string;
}
