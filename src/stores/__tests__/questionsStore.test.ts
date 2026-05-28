// src/stores/__tests__/questionsStore.test.ts
// Unit tests for questionsStore — monthly counter, hydrate month-rollover,
// and the debug-only reset/clear actions.
// See docs/quality-gates.md section 2.2 for the original test spec.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuestionsStore } from '@/stores/questionsStore';
import { journalService } from '@/services/journalService';
import { ASYNC_STORAGE_KEYS } from '@/constants/config';
import type { JournalEntry } from '@/types/journal';

// Mock AsyncStorage
jest.mock(
  '@react-native-async-storage/async-storage',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock journalService to avoid real AsyncStorage reads
jest.mock('../../services/journalService', () => ({
  journalService: {
    getAll: jest.fn().mockResolvedValue([]),
    addEntry: jest.fn().mockResolvedValue(undefined),
    deleteEntry: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
}));

const currentMonth = () => new Date().toISOString().slice(0, 7);

function entry(id: string): JournalEntry {
  return {
    id,
    question: 'Q?',
    verdict: 'YES',
    confidence_band: 'high',
    summary: 'S.',
    significators: [],
    voc_moon: false,
    timestamp: '2026-05-28T12:00:00.000Z',
  };
}

describe('questionsStore — monthly counter', () => {
  beforeEach(() => {
    useQuestionsStore.setState({
      entries: [],
      monthlyCount: 0,
      monthlyResetDate: currentMonth(),
    });
  });

  it('increments monthlyCount', async () => {
    await useQuestionsStore.getState().incrementMonthlyCount();
    expect(useQuestionsStore.getState().monthlyCount).toBe(1);
  });

  it('increments to 5 over 5 calls', async () => {
    const { incrementMonthlyCount } = useQuestionsStore.getState();
    for (let i = 0; i < 5; i++) {
      await incrementMonthlyCount();
    }
    expect(useQuestionsStore.getState().monthlyCount).toBe(5);
  });

  it('resets counter when month changes', async () => {
    useQuestionsStore.setState({ monthlyCount: 3, monthlyResetDate: '2026-04' });
    await useQuestionsStore.getState().checkAndResetMonthlyCounter();
    const state = useQuestionsStore.getState();
    expect(state.monthlyCount).toBe(0);
    expect(state.monthlyResetDate).toBe(currentMonth());
  });

  it('does not reset counter in same month', async () => {
    useQuestionsStore.setState({ monthlyCount: 3, monthlyResetDate: currentMonth() });
    await useQuestionsStore.getState().checkAndResetMonthlyCounter();
    expect(useQuestionsStore.getState().monthlyCount).toBe(3);
  });
});

describe('questionsStore — hydrate', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    (journalService.getAll as jest.Mock).mockResolvedValue([]);
    useQuestionsStore.setState({
      entries: [],
      monthlyCount: 0,
      monthlyResetDate: currentMonth(),
    });
  });

  it('loads persisted count and entries within the same month', async () => {
    (journalService.getAll as jest.Mock).mockResolvedValueOnce([entry('a')]);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.QUESTION_COUNT, '4');
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.QUESTION_RESET_DATE, currentMonth());

    await useQuestionsStore.getState().hydrate();

    const state = useQuestionsStore.getState();
    expect(state.monthlyCount).toBe(4);
    expect(state.entries.map((e) => e.id)).toEqual(['a']);
    expect(state.monthlyResetDate).toBe(currentMonth());
  });

  it('resets the counter to 0 when the stored month is stale', async () => {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.QUESTION_COUNT, '5');
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.QUESTION_RESET_DATE, '2026-01');

    await useQuestionsStore.getState().hydrate();

    const state = useQuestionsStore.getState();
    expect(state.monthlyCount).toBe(0);
    expect(state.monthlyResetDate).toBe(currentMonth());
    // Reset is persisted back to storage
    await expect(
      AsyncStorage.getItem(ASYNC_STORAGE_KEYS.QUESTION_COUNT)
    ).resolves.toBe('0');
  });

  it('applies defaults when nothing is stored', async () => {
    await useQuestionsStore.getState().hydrate();
    const state = useQuestionsStore.getState();
    expect(state.monthlyCount).toBe(0);
    expect(state.monthlyResetDate).toBe(currentMonth());
  });
});

describe('questionsStore — debug actions', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    useQuestionsStore.setState({
      entries: [entry('x'), entry('y')],
      monthlyCount: 3,
      monthlyResetDate: currentMonth(),
    });
  });

  it('resetMonthlyCount zeroes the counter and persists it', async () => {
    await useQuestionsStore.getState().resetMonthlyCount();
    expect(useQuestionsStore.getState().monthlyCount).toBe(0);
    await expect(
      AsyncStorage.getItem(ASYNC_STORAGE_KEYS.QUESTION_COUNT)
    ).resolves.toBe('0');
  });

  it('clearAllEntries empties entries and calls journalService.clear', async () => {
    await useQuestionsStore.getState().clearAllEntries();
    expect(useQuestionsStore.getState().entries).toEqual([]);
    expect(journalService.clear).toHaveBeenCalledTimes(1);
  });
});
