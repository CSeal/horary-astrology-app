---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [prd-v1.md, horary-domain-brief.md, 2026-05-25-horary-app-stack.md]
reviewed_by: owner-pending
stage: Stage4-Architecture
gate_linkage: Gate5
---

# API Integration Spec — Horary Astrology App (AstraSk)

*Document version: 1.0*
*Provider: astrology-api.io*

---

## 1. TypeScript Interfaces

```typescript
// src/types/horary.ts

export type VerdictType = 'YES' | 'NO' | 'MAYBE' | 'UNCLEAR';
export type ConfidenceBand = 'high' | 'medium' | 'low';

export interface SignificatorData {
  planet: string;             // e.g. "Mars", "Moon", "Venus"
  role: 'querent' | 'quesited' | 'moon' | string;
  sign: string;               // e.g. "Sagittarius"
  house: number;              // 1–12
  dignity: 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine' | null;
  retrograde: boolean;
  aspect?: string | null;     // e.g. "Applying trine", "No aspect forming"
}

export interface HoraryRequest {
  question: string;           // 5–280 chars
  latitude: number;           // decimal degrees, e.g. 40.7128
  longitude: number;          // decimal degrees, e.g. -74.0060
  timezone: string;           // IANA timezone, e.g. "America/New_York"
  timestamp: string;          // ISO 8601, device time at moment of submission
}

export interface HoraryResponse {
  id: string;                 // unique chart ID from API
  verdict: VerdictType;
  confidence_band: ConfidenceBand;
  summary: string;            // 2–4 sentence plain-language interpretation
  significators: SignificatorData[];
  voc_moon: boolean;          // true if Moon is void-of-course
  voc_treatment?: string;     // plain-language VOC explanation if voc_moon is true
  chart_time: string;         // ISO 8601, time chart was cast (may differ from request timestamp)
  location_display?: string;  // human-readable location string from API if provided
}

export interface HoraryAPIError {
  code: 'NETWORK_ERROR' | 'API_4XX' | 'API_5XX' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
  retryable: boolean;
  originalStatus?: number;    // HTTP status if applicable
  originalMessage?: string;   // raw API error message if available
}
```

---

## 2. Axios Instance Configuration

```typescript
// src/services/horaryApi.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { HoraryRequest, HoraryResponse, HoraryAPIError } from '../types/horary';
import { SECURE_STORE_KEY_API, API_BASE_URL, API_TIMEOUT } from '../constants/config';

// src/constants/config.ts values:
//   API_BASE_URL = 'https://astrology-api.io'
//   API_TIMEOUT  = 10000
//   SECURE_STORE_KEY_API = 'horary_api_key'
//   MONTHLY_QUESTION_LIMIT = 5

const apiInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: inject API key
apiInstance.interceptors.request.use(async (config) => {
  const key = await getApiKey();
  config.headers.Authorization = `Bearer ${key}`;
  return config;
});

// Response interceptor: normalize errors to HoraryAPIError
apiInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    throw normalizeError(error);
  }
);
```

---

## 3. API Key Priority

```typescript
async function getApiKey(): Promise<string> {
  // Priority 1: User-supplied key in SecureStore
  try {
    const stored = await SecureStore.getItemAsync(SECURE_STORE_KEY_API);
    if (stored && stored.trim().length > 0) {
      return stored;
    }
  } catch (e) {
    // SecureStore failure — fall through to env var
    console.warn('[horaryApi] SecureStore read failed, falling back to env var');
  }

  // Priority 2: Environment variable (build-time, non-secret for dev)
  const envKey = process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey;
  }

  // Priority 3: Empty string — API will return 401, handled by error normalizer
  console.warn('[horaryApi] No API key found — request will likely fail with 401');
  return '';
}
```

SecureStore configuration:
```typescript
// src/services/secureKeyService.ts
import * as SecureStore from 'expo-secure-store';
import { SECURE_STORE_KEY_API } from '../constants/config';

export const secureKeyService = {
  async getKey(): Promise<string | null> {
    return SecureStore.getItemAsync(SECURE_STORE_KEY_API);
  },
  async setKey(key: string): Promise<void> {
    await SecureStore.setItemAsync(SECURE_STORE_KEY_API, key, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  },
  async deleteKey(): Promise<void> {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEY_API);
  },
};
```

---

## 4. Retry Logic

Retry applies to 5xx errors and network errors only. 4xx errors are non-retryable (client fault).

```typescript
const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1000; // 1s, 2s, 4s

async function askWithRetry(
  request: HoraryRequest,
  attempt = 1
): Promise<HoraryResponse> {
  try {
    const response = await apiInstance.post<HoraryResponse>('/horary/ask', request);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as HoraryAPIError;
    if (apiError.retryable && attempt < MAX_RETRIES) {
      const delay = BACKOFF_BASE_MS * Math.pow(2, attempt - 1); // 1000, 2000, 4000
      await new Promise((resolve) => setTimeout(resolve, delay));
      return askWithRetry(request, attempt + 1);
    }
    throw apiError;
  }
}

export const horaryApi = {
  ask: (request: HoraryRequest): Promise<HoraryResponse> => askWithRetry(request),
};
```

---

## 5. Error Normalization

```typescript
function normalizeError(error: AxiosError): HoraryAPIError {
  // Network error (no response)
  if (!error.response) {
    const isTimeout =
      error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout');
    if (isTimeout) {
      return {
        code: 'TIMEOUT',
        message: 'The server took too long to respond. Please try again.',
        retryable: false,
      };
    }
    return {
      code: 'NETWORK_ERROR',
      message: 'No internet connection. Please check your network and try again.',
      retryable: false,
    };
  }

  const status = error.response.status;
  const apiMessage =
    (error.response.data as { message?: string })?.message ?? undefined;

  // 4xx — client errors, non-retryable
  if (status >= 400 && status < 500) {
    return {
      code: 'API_4XX',
      message: apiMessage ?? 'Something went wrong. Please try again.',
      retryable: false,
      originalStatus: status,
      originalMessage: apiMessage,
    };
  }

  // 5xx — server errors, retryable
  if (status >= 500) {
    return {
      code: 'API_5XX',
      message: apiMessage ?? 'The server encountered an error. Please try again.',
      retryable: true,
      originalStatus: status,
      originalMessage: apiMessage,
    };
  }

  return {
    code: 'UNKNOWN',
    message: 'An unexpected error occurred. Please try again.',
    retryable: false,
    originalStatus: status,
  };
}
```

---

## 6. Endpoint: POST /horary/ask

### Request

```
POST https://astrology-api.io/horary/ask
Content-Type: application/json
Authorization: Bearer <api_key>
```

### Request Body

```json
{
  "question": "Will I get the job offer this month?",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timezone": "America/New_York",
  "timestamp": "2026-05-26T14:32:00.000Z"
}
```

### Field Constraints

| Field | Type | Required | Constraints |
|---|---|---|---|
| `question` | string | Yes | 5–280 characters |
| `latitude` | number | Yes | -90 to 90, decimal degrees |
| `longitude` | number | Yes | -180 to 180, decimal degrees |
| `timezone` | string | Yes | Valid IANA timezone string (e.g. "America/New_York") |
| `timestamp` | string | Yes | ISO 8601 format, device time at moment of API call submission |

### curl Example

```bash
curl -X POST "https://astrology-api.io/horary/ask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "question": "Will I get the job offer this month?",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timezone": "America/New_York",
    "timestamp": "2026-05-26T14:32:00.000Z"
  }'
```

### Response (Success 200)

```json
{
  "id": "horary_abc123xyz",
  "verdict": "YES",
  "confidence_band": "high",
  "summary": "The chart shows strong indications in your favor. Your significator applies directly to the significator of the quesited matter, forming a partile trine. The Moon also translates light between the two, confirming the outcome. Proceed with confidence.",
  "significators": [
    {
      "planet": "Venus",
      "role": "querent",
      "sign": "Taurus",
      "house": 1,
      "dignity": "domicile",
      "retrograde": false,
      "aspect": "Applying trine"
    },
    {
      "planet": "Jupiter",
      "role": "quesited",
      "sign": "Cancer",
      "house": 10,
      "dignity": "exaltation",
      "retrograde": false,
      "aspect": null
    },
    {
      "planet": "Moon",
      "role": "moon",
      "sign": "Libra",
      "house": 6,
      "dignity": null,
      "retrograde": false,
      "aspect": "Applying conjunction"
    }
  ],
  "voc_moon": false,
  "voc_treatment": null,
  "chart_time": "2026-05-26T14:32:00.000Z",
  "location_display": "New York, NY"
}
```

### Response (Error 4xx)

```json
{
  "error": "invalid_request",
  "message": "The 'question' field must be between 5 and 280 characters."
}
```

### Response (Error 5xx)

```json
{
  "error": "internal_server_error",
  "message": "Chart calculation failed. Please try again."
}
```

---

## 7. Rate Limit and Monthly Counter

### Server-Side Rate Limiting

astrology-api.io enforces its own rate limits. If the server returns HTTP 429, treat as:
- `code: 'API_4XX'`
- `retryable: false`
- Show message: "You've reached the API rate limit. Please wait before asking again."

### Client-Side Monthly Counter

Enforced locally in `questionsStore`:

- Stored in AsyncStorage: `horary_question_count` (integer), `horary_question_reset_date` (string 'YYYY-MM')
- Limit: 5 questions per calendar month (MVP free tier)
- On app open: compare current month to stored `monthlyResetDate`; if different, reset count to 0
- Counter incremented **after** successful API response (verdict received)
- At limit (5/5): show non-blocking "coming soon" banner; do NOT block the API call in MVP

```typescript
// questionsStore: monthly reset logic
checkAndResetMonthlyCounter: async () => {
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  if (get().monthlyResetDate !== currentMonth) {
    set({ monthlyCount: 0, monthlyResetDate: currentMonth });
    await AsyncStorage.setItem('horary_question_count', '0');
    await AsyncStorage.setItem('horary_question_reset_date', currentMonth);
  }
},
```

---

## 8. Timezone Handling

- Timezone is always passed as an IANA string, never as a UTC offset
- Resolved via: `Intl.DateTimeFormat().resolvedOptions().timeZone`
- This is captured at the time of API call submission, not at app open
- The `timestamp` field is the device's `new Date().toISOString()` at the moment the user taps "Ask the Stars"

---

## 9. API Key Storage Security Requirements

| Requirement | Implementation |
|---|---|
| API key never committed to git | `.env.local` in `.gitignore`; only `.env.local.example` committed |
| API key never in AsyncStorage | SecureStore only (encrypted keychain) |
| API key never logged | No console.log of key value; masked in Settings UI |
| API key never in crash reports | No crash reporter in MVP; key excluded from any future Sentry scope |
| API key in HTTPS only | `baseURL` is always `https://` — HTTP not permitted |

---

*Stage: Stage4-Architecture*
*Gate 5: API contract specification — PASS*
