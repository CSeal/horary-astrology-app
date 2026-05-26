// src/services/locationService.ts
// expo-location wrapper — foreground only.
// Do NOT request background location (Play Store policy).

import * as Location from 'expo-location';

export interface LocationResult {
  latitude: number;
  longitude: number;
  timezone: string;
  city?: string;
}

export const locationService = {
  async requestPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status;
  },

  async getCurrentLocation(): Promise<LocationResult> {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;

    // Resolve city name via reverse geocoding
    let city: string | undefined;
    try {
      const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
      city = geocode?.city ?? geocode?.subregion ?? geocode?.region ?? undefined;
    } catch {
      // City name is display-only — failure is non-fatal
    }

    // Timezone from device (IANA string)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return { latitude, longitude, timezone, city };
  },
};
