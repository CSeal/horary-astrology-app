// src/types/location.ts
// Manual location override — set per-question via LocationPickerSheet.
// Never persisted across submissions or sessions.

export interface LocationOverride {
  latitude: number;
  longitude: number;
  city: string;
  displayName: string;
}
