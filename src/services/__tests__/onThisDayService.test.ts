// src/services/__tests__/onThisDayService.test.ts
// findOnThisDayEntries: previous-year entries within ±3 days-of-year of today,
// newest first. dismiss helpers persist a per-day flag in AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  findOnThisDayEntries,
  isDismissedToday,
  dismissToday,
} from '@/services/onThisDayService';
import type { JournalEntry } from '@/types/journal';

jest.mock(
  '@react-native-async-storage/async-storage',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const FIXED_NOW = new Date('2026-06-15T12:00:00.000Z');

function entryAt(iso: string): JournalEntry {
  return { timestamp: iso } as JournalEntry;
}

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(FIXED_NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('findOnThisDayEntries', () => {
  it('excludes entries from the current year', () => {
    const result = findOnThisDayEntries([entryAt('2026-06-15T09:00:00.000Z')]);
    expect(result).toHaveLength(0);
  });

  it('includes an entry exactly one year ago (same day-of-year)', () => {
    const result = findOnThisDayEntries([entryAt('2025-06-15T09:00:00.000Z')]);
    expect(result).toHaveLength(1);
  });

  it('includes an entry three days off in the previous year', () => {
    const result = findOnThisDayEntries([entryAt('2025-06-18T09:00:00.000Z')]);
    expect(result).toHaveLength(1);
  });

  it('excludes an entry four days off', () => {
    const result = findOnThisDayEntries([entryAt('2025-06-19T09:00:00.000Z')]);
    expect(result).toHaveLength(0);
  });

  it('sorts multiple previous-year entries newest first', () => {
    const result = findOnThisDayEntries([
      entryAt('2023-06-15T09:00:00.000Z'),
      entryAt('2025-06-15T09:00:00.000Z'),
      entryAt('2024-06-15T09:00:00.000Z'),
    ]);
    expect(result.map((e) => e.timestamp)).toEqual([
      '2025-06-15T09:00:00.000Z',
      '2024-06-15T09:00:00.000Z',
      '2023-06-15T09:00:00.000Z',
    ]);
  });

  it('returns an empty array when there are no previous-year entries', () => {
    const result = findOnThisDayEntries([entryAt('2026-01-01T09:00:00.000Z')]);
    expect(result).toEqual([]);
  });
});

describe('dismiss flag', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('reports not dismissed before dismissToday is called', async () => {
    await expect(isDismissedToday()).resolves.toBe(false);
  });

  it('reports dismissed after dismissToday is called', async () => {
    await dismissToday();
    await expect(isDismissedToday()).resolves.toBe(true);
  });
});
