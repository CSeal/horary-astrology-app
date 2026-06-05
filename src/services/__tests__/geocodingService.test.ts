// src/services/__tests__/geocodingService.test.ts
// Covers geocodingService.search(): short-query short-circuit, !res.ok throw,
// display-name assembly, invalid-feature filtering, and AbortSignal pass-through.

import { geocodingService } from '@/services/geocodingService';

function photonFeature(props: {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: [number, number];
}) {
  return {
    geometry: { coordinates: props.coordinates ?? [37.6173, 55.7558] }, // [lon, lat]
    properties: {
      name: props.name,
      city: props.city,
      state: props.state,
      country: props.country,
    },
  };
}

function mockFetchOk(features: unknown[]) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ features }),
  }) as jest.Mock;
}

describe('geocodingService.search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('short-circuits to [] for queries under 2 chars without fetching', async () => {
    globalThis.fetch = jest.fn() as jest.Mock;
    await expect(geocodingService.search('a', 'en')).resolves.toEqual([]);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('throws GEOCODE_ERROR when the response is not ok', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false }) as jest.Mock;
    await expect(geocodingService.search('Moscow', 'en')).rejects.toThrow(
      'GEOCODE_ERROR'
    );
  });

  it('maps a full feature into a LocationOverride with a composed displayName', async () => {
    mockFetchOk([
      photonFeature({
        name: 'Moscow',
        state: 'Moscow',
        country: 'Russia',
        coordinates: [37.6173, 55.7558],
      }),
    ]);
    const [result] = await geocodingService.search('Moscow', 'en');
    expect(result).toEqual({
      latitude: 55.7558,
      longitude: 37.6173,
      city: 'Moscow',
      // state === place name → region segment is omitted
      displayName: 'Moscow, Russia',
    });
  });

  it('joins distinct region and country into the displayName', async () => {
    mockFetchOk([
      photonFeature({
        name: 'Springfield',
        state: 'Illinois',
        country: 'USA',
        coordinates: [-89.65, 39.78],
      }),
    ]);
    const [result] = await geocodingService.search('Springfield', 'en');
    expect(result.displayName).toBe('Springfield, Illinois, USA');
  });

  it('drops features that have no city/name', async () => {
    mockFetchOk([
      photonFeature({ country: 'Russia' }), // no name/city → filtered
      photonFeature({ name: 'Kazan', country: 'Russia' }),
    ]);
    const results = await geocodingService.search('Ka', 'ru');
    expect(results).toHaveLength(1);
    expect(results[0].city).toBe('Kazan');
  });

  it('passes the AbortSignal through to fetch', async () => {
    mockFetchOk([]);
    const controller = new AbortController();
    await geocodingService.search('Berlin', 'en', controller.signal);
    const [, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(options.signal).toBe(controller.signal);
  });

  it('forwards a Photon-supported language verbatim', async () => {
    mockFetchOk([]);
    await geocodingService.search('Berlin', 'en');
    const [url] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('lang=en');
  });

  it('maps unsupported languages (ru) to "default" — Photon 400s on ru', async () => {
    mockFetchOk([]);
    await geocodingService.search('Москва', 'ru');
    const [url] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('lang=default');
    expect(url).not.toContain('lang=ru');
  });

  it('uses city as fallback for place name when name is undefined', async () => {
    mockFetchOk([
      photonFeature({
        // name is undefined (not set) — city is the fallback
        city: 'Paris',
        state: 'Île-de-France',
        country: 'France',
        coordinates: [2.3522, 48.8566],
      }),
    ]);
    const [result] = await geocodingService.search('Paris', 'en');
    expect(result.city).toBe('Paris');
    expect(result.displayName).toContain('Paris');
    expect(result.displayName).toContain('France');
  });

  it('omits country segment from displayName when country is absent', async () => {
    mockFetchOk([
      photonFeature({
        name: 'Lyon',
        state: 'Auvergne-Rhône-Alpes',
        // country is undefined
        coordinates: [4.8357, 45.764],
      }),
    ]);
    const [result] = await geocodingService.search('Lyon', 'en');
    expect(result.city).toBe('Lyon');
    // country segment should not appear
    expect(result.displayName).not.toMatch(/,\s*undefined/);
    // state IS different from place name so it should appear
    expect(result.displayName).toContain('Auvergne');
  });
});
