---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [prd-v1.md, mvp-scope.md, 2026-05-25-horary-app-stack.md]
reviewed_by: owner-pending
stage: Stage4-Architecture
gate_linkage: Gate5, Gate7
---

# Quality Gates — Horary Astrology App (AstraSk)

*Document version: 1.0*

---

## 1. TypeScript Requirements

- `strict: true` in `tsconfig.json` (already defaulted in Expo SDK 55 template)
- No `any` types in any source file — use proper interfaces from `src/types/`
- All API response fields typed with explicit interfaces (`HoraryResponse`, `SignificatorData`)
- All Zustand store state typed with interfaces (`SettingsState`, `QuestionsState`)
- All route params typed via `src/types/navigation.ts`
- `noImplicitReturns: true` — all code paths must return explicitly
- Type errors fail the CI build

---

## 2. Jest Unit Tests

Test runner: `jest-expo` preset. Install: `npx expo install jest-expo jest`.
Testing library: `@testing-library/react-native` v12.x.

Configuration in `package.json`:
```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterFramework": ["@testing-library/react-native/extend-expect"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

### 2.1 horaryApi.ts Unit Tests

File: `src/services/__tests__/horaryApi.test.ts`

```typescript
// Mock axios at the module level
jest.mock('axios');
// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('test_api_key'),
}));
```

Test cases:

| Test | Description | Expected |
|---|---|---|
| `ask() — successful response` | Mock axios returns 200 with valid HoraryResponse | Returns typed HoraryResponse with correct fields |
| `ask() — retries on 500` | Mock axios returns 500 twice, then 200 | Makes 3 total calls, returns success on 3rd |
| `ask() — stops retrying after 3 failures` | Mock axios always returns 500 | Throws HoraryAPIError { code: 'API_5XX', retryable: true } |
| `ask() — no retry on 4xx` | Mock axios returns 401 | Throws HoraryAPIError { code: 'API_4XX', retryable: false }, makes only 1 call |
| `ask() — timeout error` | Mock axios rejects with ECONNABORTED | Throws HoraryAPIError { code: 'TIMEOUT', retryable: false } |
| `ask() — network error` | Mock axios rejects with no response | Throws HoraryAPIError { code: 'NETWORK_ERROR', retryable: false } |
| `getApiKey() — SecureStore priority` | SecureStore returns 'user_key', env var set | Uses SecureStore key, not env var |
| `getApiKey() — fallback to env var` | SecureStore returns null, env var set | Uses env var key |
| `getApiKey() — SecureStore failure` | SecureStore throws, env var set | Logs warning, uses env var key |

```typescript
describe('horaryApi.ask()', () => {
  const validRequest: HoraryRequest = {
    question: 'Will I get the job?',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
    timestamp: new Date().toISOString(),
  };

  it('returns HoraryResponse on 200', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockHoraryResponse });
    const result = await horaryApi.ask(validRequest);
    expect(result.verdict).toMatch(/^(YES|NO|MAYBE|UNCLEAR)$/);
    expect(result.confidence_band).toMatch(/^(high|medium|low)$/);
  });

  it('retries twice on 500 then succeeds', async () => {
    (axios.post as jest.Mock)
      .mockRejectedValueOnce(make5xxError())
      .mockRejectedValueOnce(make5xxError())
      .mockResolvedValueOnce({ data: mockHoraryResponse });
    const result = await horaryApi.ask(validRequest);
    expect(axios.post).toHaveBeenCalledTimes(3);
    expect(result.verdict).toBeDefined();
  });

  it('throws after 3 retries on persistent 500', async () => {
    (axios.post as jest.Mock).mockRejectedValue(make5xxError());
    await expect(horaryApi.ask(validRequest)).rejects.toMatchObject({
      code: 'API_5XX',
    });
    expect(axios.post).toHaveBeenCalledTimes(3);
  });

  it('does not retry on 401', async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce(make4xxError(401));
    await expect(horaryApi.ask(validRequest)).rejects.toMatchObject({
      code: 'API_4XX',
      retryable: false,
    });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
});
```

### 2.2 questionsStore Unit Tests

File: `src/stores/__tests__/questionsStore.test.ts`

```typescript
// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

Test cases:

| Test | Description | Expected |
|---|---|---|
| `incrementMonthlyCount` | Start at 0, call increment | monthlyCount === 1 |
| `incrementMonthlyCount × 5` | Call 5 times | monthlyCount === 5 |
| `checkAndResetMonthlyCounter — same month` | monthlyResetDate matches current month | monthlyCount unchanged |
| `checkAndResetMonthlyCounter — new month` | monthlyResetDate is previous month | monthlyCount resets to 0, monthlyResetDate updated |
| `addEntry` | Add a JournalEntry | entries.length increases by 1, entry retrievable by id |
| `deleteEntry` | Add then delete by id | entries.length decreases by 1 |
| `hydrate` | Populate AsyncStorage, call hydrate | Store state matches persisted values |

```typescript
describe('questionsStore — monthly counter', () => {
  beforeEach(() => {
    const store = useQuestionsStore.getState();
    store.monthlyCount = 0;
    store.monthlyResetDate = new Date().toISOString().slice(0, 7);
  });

  it('increments monthlyCount', async () => {
    await useQuestionsStore.getState().incrementMonthlyCount();
    expect(useQuestionsStore.getState().monthlyCount).toBe(1);
  });

  it('resets counter when month changes', async () => {
    useQuestionsStore.setState({ monthlyCount: 3, monthlyResetDate: '2026-04' });
    await useQuestionsStore.getState().checkAndResetMonthlyCounter();
    expect(useQuestionsStore.getState().monthlyCount).toBe(0);
    expect(useQuestionsStore.getState().monthlyResetDate).toBe('2026-05');
  });

  it('does not reset counter in same month', async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    useQuestionsStore.setState({ monthlyCount: 3, monthlyResetDate: currentMonth });
    await useQuestionsStore.getState().checkAndResetMonthlyCounter();
    expect(useQuestionsStore.getState().monthlyCount).toBe(3);
  });
});
```

---

## 3. Smoke Tests (6 Critical Paths)

These smoke tests are manual verification runs on a physical device (or Expo Go) before each release candidate.

| # | Smoke Test | Steps | Expected Behavior |
|---|---|---|---|
| SM-01 | Happy path: ask and receive verdict | 1. Launch app. 2. Grant location. 3. Type a 20-char question. 4. Tap "Ask the Stars". 5. Wait for result. | Loading animation appears. Verdict screen shows YES/NO/MAYBE/UNCLEAR with color-coded card. Summary text visible. Journal tab shows new entry. |
| SM-02 | Journal persistence across restart | 1. Complete SM-01. 2. Force-close app. 3. Reopen. 4. Navigate to Journal tab. | Previous reading is visible in Journal with correct verdict badge, question text, and date. |
| SM-03 | Language switch to Russian | 1. Open Settings. 2. Toggle language to Russian. 3. Navigate to Home. | All visible UI strings (tab labels, button text, placeholders, section headers) render in Russian/Cyrillic. |
| SM-04 | API key input and persistence | 1. Open Settings. 2. Enter a test API key. 3. Tap Save. 4. Force-close app. 5. Reopen Settings. | Key is masked. Source indicator shows "Using: personal key". Key persists after restart. |
| SM-05 | Monthly counter display and reset simulation | 1. Note current count on Home. 2. Submit question. 3. Return to Home. 4. Simulate month change by manually setting stored date to previous month. 5. Restart app. | Counter increments correctly after question. Counter resets to 0 after simulated month change. |
| SM-06 | Location denial error state | 1. Revoke location permission in device Settings. 2. Launch app. 3. Observe Home screen. | Non-crashing error state shown: "Location access needed — tap to open Settings." Submit button behavior gracefully handles denied state. |

---

## 4. Acceptance Criteria Table (Binary Pass/Fail)

All criteria are binary: PASS = fully met, FAIL = not met or partially met.

| FR | Feature | Acceptance Criteria | Result |
|---|---|---|---|
| FR-01 | Ask a Question | Submit button disabled when input < 5 chars. Submitting valid question navigates to loading state. Character count updates in real time. Hard limit enforced at 280 chars. | — |
| FR-02 | Auto-Detect Location | City name and coordinates displayed within 3 seconds on permission-granted device. Error state (not crash) shown on permission denial. | — |
| FR-03 | Cast Horary Chart | API call made with correct payload (question, lat, lng, IANA timezone, ISO 8601 timestamp). Loading animation shown minimum 1.5 seconds. Verdict displayed on success. Error banner on failure. | — |
| FR-04 | Display Verdict | YES = green, NO = red, MAYBE = amber, UNCLEAR = muted gray. Confidence dots match HIGH (5)/MEDIUM (3)/LOW (1–2). UNCLEAR shows "Chart Unclear", not YES/NO. | — |
| FR-05 | Display Summary | Summary text verbatim from API. LOW confidence appends mixed-indications note. VOC note shown when voc_moon is true. | — |
| FR-06 | Display Significators | Querent and quesited shown with planet name, role, sign, house. Retrograde symbol (℞) appears when retrograde: true. Dignity badge for Domicile/Exaltation/Detriment/Fall. | — |
| FR-07 | Save to Journal | Journal entry persisted to AsyncStorage after verdict is displayed. Entry retrievable from Journal tab. Entry contains: question, judgment, timestamp, significators, summary. | — |
| FR-08 | View Journal | Entries grouped by month. Tapping entry shows full verdict. Swipe-left reveals Delete. Confirming delete removes entry. Empty state shown when journal is empty. | — |
| FR-09 | Language Toggle | Switching language in Settings immediately updates all visible UI strings. Russian strings render in Cyrillic. Language persists after app restart. | — |
| FR-10 | Question Counter | Counter increments on each successful question. Counter resets on calendar month change. "Coming soon" banner at 5/5. No payment prompt, no app lockout. Settings shows correct progress bar. | — |
| FR-11 | API Key Management | API key stored in SecureStore. Key is masked in UI. Source indicator updates correctly. API calls use the stored key. Removing key reverts to app default. | — |
| FR-12 | Onboarding | Onboarding shown only on first launch. Location permission dialog triggered from onboarding. "Get Started" navigates to Home. Completing onboarding sets `horary_onboarding_complete` flag. | — |

---

## 5. Performance Budgets

| Metric | Target | Measurement Method |
|---|---|---|
| App cold start | < 2 seconds | Xcode Instruments / Android Profiler on mid-range device |
| API response (question → verdict) | < 2 seconds p95 | Axios interceptor timing log |
| Loading screen minimum duration | 1.5 seconds | `Promise.all([apiCall, delay(1500)])` pattern |
| Journal list render (100 entries) | < 500ms | React Native Performance Monitor |
| Language switch latency | < 200ms | Observed on device (immediate apparent update) |

---

## 6. Accessibility Minimums

| Requirement | Standard | Verification |
|---|---|---|
| Text contrast ratio | 4.5:1 minimum (WCAG AA) | Color Contrast Analyzer on design tokens |
| Tap target size | 44 × 44pt minimum | Manual measurement in Xcode/Android layout inspector |
| Dynamic Type | All text scales with system font size | Test on iOS with Accessibility > Display & Text Size > Larger Text |
| Screen reader labels | All interactive elements have `accessibilityLabel` | VoiceOver sweep on Home, Verdict, Journal, Settings screens |
| Color not sole signal | Verdict cards include text labels | Verify each verdict type in grayscale mode |

---

## 7. Gate 5 Criteria

Gate 5 passes when all of the following are confirmed:

| Criterion | Status |
|---|---|
| `docs/technical-architecture.md` complete with full file tree, data flow, state management | PASS |
| `docs/api-integration-spec.md` complete with TypeScript interfaces, retry logic, error normalization | PASS |
| `docs/quality-gates.md` complete with unit test specs, smoke tests, acceptance criteria | PASS |
| `docs/delivery-roadmap.md` complete with sprint breakdown and parallel dispatch map | PASS |
| `docs/superpowers/plans/partition-map.md` complete with disjoint file map (no duplicates) | PASS |
| Expo project initialized with SDK 55 and all dependencies | PASS |
| No StyleSheet.create() in architecture decisions | PASS |
| No hardcoded colors in component specs | PASS |
| No TypeScript `any` in type definitions | PASS |

---

*Stage: Stage4-Architecture*
*Gate 5: Test strategy defined — PASS*
*Gate 7: Briefing and acceptance checks complete — PASS*
