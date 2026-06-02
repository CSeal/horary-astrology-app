// src/services/geocodingService.ts
// Photon by Komoot — open geocoding for the manual location picker.
// Photon is OSM-derived but built for autocomplete (Nominatim policy forbids
// client-side autocomplete against the public OSMF endpoint).
//
// Endpoint:  https://photon.komoot.io/api?q=...&lang=...&limit=5
// Docs:      https://photon.komoot.io/
//
// We restrict results to populated places via osm_tag filters so the picker
// never returns streets, businesses, or POIs.

import type { LocationOverride } from '@/types/location';

const PHOTON_ENDPOINT = 'https://photon.komoot.io/api';
const RESULT_LIMIT = 5;
const PLACE_TAGS = ['place:city', 'place:town', 'place:village'];

// The public Photon instance only accepts a fixed set of language codes; any
// other value (e.g. 'ru') returns HTTP 400. Map unsupported app locales to
// 'default', which returns each place's native OSM name — for a Russian user
// that means Cyrillic names (Москва), which is exactly what we want.
const PHOTON_SUPPORTED_LANGS = new Set(['en', 'de', 'fr']);
function toPhotonLang(lang: string): string {
  return PHOTON_SUPPORTED_LANGS.has(lang) ? lang : 'default';
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] }; // [lon, lat]
  properties: {
    name?: string;
    city?: string;
    country?: string;
    state?: string;
    osm_value?: string;
  };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

function buildDisplayName(p: PhotonFeature['properties']): string {
  const place = p.name ?? p.city ?? '';
  const region = p.state && p.state !== place ? `, ${p.state}` : '';
  const country = p.country ? `, ${p.country}` : '';
  return `${place}${region}${country}`.trim();
}

function toOverride(feature: PhotonFeature): LocationOverride | null {
  const [longitude, latitude] = feature.geometry.coordinates;
  const city = feature.properties.name ?? feature.properties.city;
  if (!city || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }
  return {
    latitude,
    longitude,
    city,
    displayName: buildDisplayName(feature.properties),
  };
}

export const geocodingService = {
  async search(
    query: string,
    lang: 'en' | 'ru',
    signal?: AbortSignal
  ): Promise<LocationOverride[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const params = new URLSearchParams({
      q: trimmed,
      lang: toPhotonLang(lang),
      limit: String(RESULT_LIMIT),
    });
    for (const tag of PLACE_TAGS) {
      params.append('osm_tag', tag);
    }

    const res = await fetch(`${PHOTON_ENDPOINT}?${params.toString()}`, {
      signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AstraSk/1.0 (horary-astrology)',
      },
    });
    if (!res.ok) {
      throw new Error('GEOCODE_ERROR');
    }
    const data = (await res.json()) as PhotonResponse;
    return data.features
      .map(toOverride)
      .filter((r): r is LocationOverride => r !== null);
  },
};
