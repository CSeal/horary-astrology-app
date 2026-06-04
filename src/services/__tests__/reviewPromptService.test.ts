// src/services/__tests__/reviewPromptService.test.ts
// Covers the FR-G02 review-prompt gating: verdict tone, entry count, install age,
// cooldown, native availability, and the success path (requestReview + state write).

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { reviewPromptService } from '@/services/reviewPromptService';
import {
  ASYNC_STORAGE_KEYS,
  REVIEW_MIN_ENTRIES,
  REVIEW_MIN_DAYS_SINCE_INSTALL,
} from '@/constants/config';

jest.mock(
  '@react-native-async-storage/async-storage',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(),
  requestReview: jest.fn(),
}));

const mockAvailable = StoreReview.isAvailableAsync as jest.Mock;
const mockRequest = StoreReview.requestReview as jest.Mock;

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const daysAgo = (n: number) => new Date(Date.now() - n * MS_PER_DAY).toISOString();

async function setInstall(daysOld: number): Promise<void> {
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.INSTALL_DATE, daysAgo(daysOld));
}

const ELIGIBLE_COUNT = REVIEW_MIN_ENTRIES;
const ELIGIBLE_INSTALL_AGE = REVIEW_MIN_DAYS_SINCE_INSTALL + 1;

describe('reviewPromptService.initInstallDate', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('stamps the install date on first call', async () => {
    await reviewPromptService.initInstallDate();
    const stored = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.INSTALL_DATE);
    expect(stored).not.toBeNull();
  });

  it('is idempotent — does not overwrite an existing install date', async () => {
    const original = daysAgo(30);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.INSTALL_DATE, original);
    await reviewPromptService.initInstallDate();
    expect(await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.INSTALL_DATE)).toBe(
      original
    );
  });
});

describe('reviewPromptService.maybePrompt', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    mockAvailable.mockResolvedValue(true);
    mockRequest.mockResolvedValue(undefined);
  });

  it('prompts and records state when all gates pass (YES)', async () => {
    await setInstall(ELIGIBLE_INSTALL_AGE);
    const result = await reviewPromptService.maybePrompt(ELIGIBLE_COUNT, 'YES');
    expect(result).toBe(true);
    expect(mockRequest).toHaveBeenCalledTimes(1);
    const state = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.REVIEW_PROMPT_STATE
    );
    expect(state).not.toBeNull();
    expect(JSON.parse(state as string).prompted_at).toEqual(expect.any(String));
  });

  it('prompts for MAYBE verdicts too', async () => {
    await setInstall(ELIGIBLE_INSTALL_AGE);
    expect(await reviewPromptService.maybePrompt(ELIGIBLE_COUNT, 'MAYBE')).toBe(
      true
    );
  });

  it.each(['NO', 'UNCLEAR'] as const)(
    'never prompts after a %s verdict',
    async (verdict) => {
      await setInstall(ELIGIBLE_INSTALL_AGE);
      expect(await reviewPromptService.maybePrompt(ELIGIBLE_COUNT, verdict)).toBe(
        false
      );
      expect(mockRequest).not.toHaveBeenCalled();
    }
  );

  it('does not prompt below the minimum entry count', async () => {
    await setInstall(ELIGIBLE_INSTALL_AGE);
    expect(
      await reviewPromptService.maybePrompt(REVIEW_MIN_ENTRIES - 1, 'YES')
    ).toBe(false);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('does not prompt before the install-age threshold', async () => {
    await setInstall(1);
    expect(await reviewPromptService.maybePrompt(ELIGIBLE_COUNT, 'YES')).toBe(
      false
    );
  });

  it('does not prompt when the native module is unavailable', async () => {
    mockAvailable.mockResolvedValue(false);
    await setInstall(ELIGIBLE_INSTALL_AGE);
    expect(await reviewPromptService.maybePrompt(ELIGIBLE_COUNT, 'YES')).toBe(
      false
    );
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('does not prompt when install date is missing', async () => {
    expect(await reviewPromptService.maybePrompt(ELIGIBLE_COUNT, 'YES')).toBe(
      false
    );
  });

  it('respects the cooldown since the last prompt', async () => {
    await setInstall(ELIGIBLE_INSTALL_AGE);
    await AsyncStorage.setItem(
      ASYNC_STORAGE_KEYS.REVIEW_PROMPT_STATE,
      JSON.stringify({ prompted_at: daysAgo(10) })
    );
    expect(await reviewPromptService.maybePrompt(ELIGIBLE_COUNT, 'YES')).toBe(
      false
    );
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('prompts again once the cooldown has elapsed', async () => {
    await setInstall(400);
    await AsyncStorage.setItem(
      ASYNC_STORAGE_KEYS.REVIEW_PROMPT_STATE,
      JSON.stringify({ prompted_at: daysAgo(200) })
    );
    expect(await reviewPromptService.maybePrompt(ELIGIBLE_COUNT, 'YES')).toBe(
      true
    );
  });
});
