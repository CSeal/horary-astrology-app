// src/stores/__tests__/questionsStore.test.ts
// Unit tests for questionsStore — journal hydration and debug clear action.
// See docs/quality-gates.md section 2.2 for the original test spec.
// Note: monthly question counting was removed in Group 1 refactor — limit enforcement
// is server-side (API returns 429 → LIMIT_EXCEEDED).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuestionsStore } from '@/stores/questionsStore';
import { journalService } from '@/services/journalService';
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

describe('questionsStore — hydrate', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    (journalService.getAll as jest.Mock).mockResolvedValue([]);
    useQuestionsStore.setState({ entries: [] });
  });

  it('loads entries from journalService', async () => {
    (journalService.getAll as jest.Mock).mockResolvedValueOnce([entry('a'), entry('b')]);
    await useQuestionsStore.getState().hydrate();
    expect(useQuestionsStore.getState().entries.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('sets empty entries when nothing is stored', async () => {
    await useQuestionsStore.getState().hydrate();
    expect(useQuestionsStore.getState().entries).toEqual([]);
  });
});

describe('questionsStore — debug actions', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    useQuestionsStore.setState({ entries: [entry('x'), entry('y')] });
  });

  it('clearAllEntries empties entries and calls journalService.clear', async () => {
    await useQuestionsStore.getState().clearAllEntries();
    expect(useQuestionsStore.getState().entries).toEqual([]);
    expect(journalService.clear).toHaveBeenCalledTimes(1);
  });
});
