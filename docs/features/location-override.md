# Feature: Manual Location Override

**Status:** Implemented (2026-05-26)
**Created by:** claude-sonnet
**Related:** [ask-flow.md](ask-flow.md), [onboarding.md](onboarding.md)

A user-facing escape hatch when device GPS gives the wrong city. The user taps the location row in `AskForm`, a bottom sheet opens, they search for the correct city, pick a result, and the chart is cast using those coordinates instead of the GPS reading. The override is **per-question** — cleared automatically after a successful submission so the next question defaults back to GPS.

---

## Why this exists

Horary astrology requires the device's location *at the moment the question is asked* (see [horary-domain-brief.md](../superpowers/expert/horary-domain-brief.md)). In practice GPS can be wrong for several reasons:

- Bad GPS reception indoors / in rural areas
- VPN-confused IP geolocation (the OS GPS itself is not VPN-routed, but reverse geocoding may fall back to IP)
- Simulator / emulator returning a default location
- User explicitly knows GPS is off by a city or two

A 50 km coordinate error shifts house cusps by less than 1° — meaningful only when the Ascendant is near a sign boundary, but visible enough to bother attentive users. (Timezone errors are far worse: a 1-hour timezone shift moves the Ascendant by ~15°. Timezone is always taken from the device's `Intl` API, never from coordinates — even with an override.)

---

## Doctrinal scope (what override is and is not)

> **Override = GPS-failure recovery, not a "set my home city" preference.**

The chart is cast for *where the device is when the question is received* (Lilly / Houlding). Persisting an override across sessions would silently corrupt charts if the user travels and forgets the override is active — so it does not persist. The bottom sheet shows a copy hint to reinforce this:

> *"Use your current location — not the city of the person you are asking about."*

---

## User flow

```
HomeScreen
  └─ AskForm
       └─ location row (tappable)  →  LocationPickerSheet
            ┌──────────────────────────────┐
            │ Set location                 │
            │ ┌──────────────────────────┐ │
            │ │ 📍 Detected by GPS       │ │
            │ │    Helsinki              │ │ ← shows GPS-resolved city
            │ └──────────────────────────┘ │
            │                              │
            │ Hint copy (doctrinal)        │
            │                              │
            │ 🔍 Search city...            │ ← TextInput, 350ms debounce
            │                              │
            │ Moscow, Russia               │ ← Photon results
            │ Moscow, ID, US               │
            │ ...                          │
            │                              │
            │ [Use GPS]   ← visible iff override active
            │                              │
            │ Data © OpenStreetMap         │
            └──────────────────────────────┘
```

After picking a result, the AskForm renders an override chip instead of the GPS row:

```
📍 Moscow · manual  ✕   ← tap ✕ to revert to GPS
```

After submission (`mutation.isSuccess`) the override is cleared automatically — the next question starts fresh with the device's GPS.

---

## Source files

| File | Role |
|---|---|
| [src/components/LocationPickerSheet.tsx](../../src/components/LocationPickerSheet.tsx) | Bottom sheet UI — `@gorhom/bottom-sheet` non-modal variant |
| [src/services/geocodingService.ts](../../src/services/geocodingService.ts) | Photon API wrapper for city search |
| [src/types/location.ts](../../src/types/location.ts) | `LocationOverride` interface |
| [src/components/AskForm.tsx](../../src/components/AskForm.tsx) | Tappable location row, override chip |
| [src/app/(tabs)/index.tsx](../../src/app/(tabs)/index.tsx) | `override` state, picker wiring, per-question reset |
| [src/i18n/en.ts](../../src/i18n/en.ts), [src/i18n/ru.ts](../../src/i18n/ru.ts) | `locationPicker.*` namespace |

No native module changes — the entire feature is **OTA-safe**.

---

## Geocoding provider — Photon by Komoot

We use [photon.komoot.io](https://photon.komoot.io) because:

- **Nominatim's usage policy explicitly forbids client-side autocomplete** against the public OSMF endpoint — even at low rates. Photon is purpose-built for autocomplete on OSM data.
- No API key, no rate limit visible to the client.
- Multilingual including Cyrillic (we pass `lang=ru` when the app locale is Russian).
- Results are filtered to populated places only via `osm_tag=place:city,place:town,place:village` — the picker never returns streets, businesses, or POIs.

Request shape:

```
GET https://photon.komoot.io/api
    ?q=<query>
    &lang=<en|ru>
    &limit=5
    &osm_tag=place:city
    &osm_tag=place:town
    &osm_tag=place:village

Headers:
  User-Agent: Hora/1.0 (horary-astrology)
  Accept: application/json
```

Response is GeoJSON; we map `features[].geometry.coordinates` (`[lon, lat]`) and `features[].properties` (`name`, `city`, `state`, `country`) into the internal `LocationOverride` shape.

**Attribution:** "Data © OpenStreetMap contributors" is displayed at the bottom of the sheet per OSM licensing.

---

## Data flow

```
LocationPickerSheet (bottom sheet)
  │
  ├─ TextInput value ──► useDebounce(350ms) ──► debouncedQuery
  │                                                 │
  │                                                 ▼
  ├─ useEffect([debouncedQuery, lang]) ──► geocodingService.search()
  │                                          │      │
  │                                          │      └─ AbortController cancels in-flight
  │                                          ▼
  │                                       Photon API
  │                                          │
  │                                          ▼
  ├─ setResults(LocationOverride[])
  │
  └─ user taps result ──► onPick(override) ──► HomeScreen.setOverride(picked)

HomeScreen (per-question state)
  │
  ├─ override: useState<LocationOverride | null>(null)
  │
  ├─ handleSubmit() builds HoraryRequest:
  │    coords    = override ?? location          ← override has priority
  │    timezone  = location?.timezone ?? Intl…   ← ALWAYS device, never derived
  │
  └─ useEffect([mutation.isSuccess]):
       if (isSuccess && override) setOverride(null)   ← per-question reset
```

---

## Per-question scope — why it resets after submission

The override clears when `mutation.isSuccess` becomes `true`. This protects against the "traveling user forgets the override" failure mode:

| Scenario | Without reset | With per-question reset |
|---|---|---|
| User in Helsinki, GPS shows wrong city, picks Moscow, asks Q1 | Q1 uses Moscow ✅ | Q1 uses Moscow ✅ |
| Same user travels to Paris next week, asks Q2 | Q2 still uses Moscow ❌ | Q2 uses Paris (GPS) ✅ |

The trade-off: a user whose GPS is *chronically* wrong (e.g. always on a VPN that confuses reverse geocoding) has to re-pick the city each time. We accept this because doctrinal correctness > convenience for a rare case.

---

## Timezone handling

Timezone is **independent** of coordinates and **always** comes from the device:

```ts
const timezone =
  location?.timezone ??
  Intl.DateTimeFormat().resolvedOptions().timeZone;
```

Even when the override is active, the request's `timezone` field is the device's IANA string. We do NOT use any client-side coord→tz lookup (e.g. `tz-lookup`) because:

1. The horary doctrine says the chart belongs to the place where the question is received — that's the device.
2. A timezone error of 1 hour shifts the Ascendant by ~15° (sign-changing); coordinate errors of 50 km shift cusps by <1°. The timezone is the load-bearing field.
3. We trust the OS to know its own timezone; deriving it client-side from coordinates introduces a second-order error path with no upside.

---

## Edge cases handled

| Case | Behavior |
|---|---|
| User opens picker, types <2 chars | No request sent; results cleared; no spinner |
| User types fast | `useDebounce(350ms)` collapses to one request after typing pauses |
| Network failure on geocode | Inline error message in sheet; `errors.geocodeError` |
| User picks a result, then dismisses sheet | Override is committed (no "cancel" semantics) |
| User picks override, then GPS resolves to a new city | Override stays — the user's explicit choice wins |
| `permissionStatus === 'denied'` AND override set | Submit button enabled — override supplies the coords |
| `permissionStatus === 'denied'` AND no override | Submit button disabled, banner says "Open Settings" |
| Successful submission | Override clears; next question defaults back to GPS |
| Failed submission | Override is preserved (no reset on `isError`) so retry uses the same coords |
| User taps ✕ on chip | Override clears immediately; row reverts to GPS display |

---

## Library notes

- **`@gorhom/bottom-sheet@^5.2.6`** — requires v5.1.8+ for Reanimated 4 compatibility. We use the **default export `BottomSheet`** (non-modal), not `BottomSheetModal`. This avoids needing `BottomSheetModalProvider` in `_layout.tsx`. The sheet is rendered as a sibling of `SafeAreaView` inside `CosmosBackground`.
- **`use-debounce@^10.1.1`** — pure JS, no native deps. We use `useDebounce(query, 350)` to throttle Photon requests.
- **`BottomSheetTextInput`** — must be used inside a bottom sheet instead of plain `TextInput` to avoid keyboard handling and focus issues with the sheet's pan gesture.
- **`BottomSheetFlatList`** — same reason: native scroll/gesture coordination with the sheet's drag handle.

---

## Accessibility

| Element | Role | Label |
|---|---|---|
| Location row in AskForm (GPS mode) | `button` | `a11y.openLocationPicker` |
| Override chip ✕ button | `button` | `a11y.clearOverride` |
| Result item in sheet | `button` | (city name, default) |
| Search input | implicit `textbox` | placeholder = `locationPicker.search` |

---

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 errors
npm test            # 10/10 pass
```

Manual smoke test:

- [ ] Tap location row → sheet opens
- [ ] Type "Moscow" → 5 results appear within ~600ms
- [ ] Pick "Moscow, Russia" → sheet closes, chip shows `Moscow · manual ✕`
- [ ] Tap ✕ → chip disappears, GPS row returns
- [ ] Pick override → submit question → after navigation back, override is cleared
- [ ] Deny GPS permission → set manual override → submit works
- [ ] Type Cyrillic "Москва" while RU locale → Russian results returned
- [ ] Disable network → search shows `locationPicker.error`

---

## Future considerations (out of scope for MVP)

- **Recent picks** — store last 3 override cities (still per-session, not persisted) so users hitting the same wrong-GPS scenario don't re-type
- **"Use my city" shortcut** — surface the user's IP-resolved city as a one-tap candidate (requires explicit consent disclosure: "IP location is approximate")
- **Verdict-screen confirmation** — render "Chart cast for: Moscow · 14:23 MSK" prominently so the user can spot a wrong manual selection in the result, not just the form
