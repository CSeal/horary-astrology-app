// src/services/__tests__/journalService.test.ts
// CRUD round-trips, newest-first ordering, the 500-entry prune boundary, and
// the corrupt-JSON fail-open path of journalService.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { journalService } from '@/services/journalService';
import { ASYNC_STORAGE_KEYS, MAX_JOURNAL_ENTRIES } from '@/constants/config';
import type { JournalEntry } from '@/types/journal';

jest.mock(
  '@react-native-async-storage/async-storage',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const JOURNAL_KEY = ASYNC_STORAGE_KEYS.JOURNAL;

function entry(id: string): JournalEntry {
  return {
    id,
    question: `Question ${id}?`,
    verdict: 'YES',
    confidence_band: 'high',
    summary: 'Summary.',
    significators: [],
    voc_moon: false,
    timestamp: '2026-05-28T12:00:00.000Z',
  };
}

describe('journalService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('addEntry then getAll returns the stored entry', async () => {
    await journalService.addEntry(entry('a'));
    const all = await journalService.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('a');
  });

  it('keeps newest-first order across multiple addEntry calls', async () => {
    await journalService.addEntry(entry('first'));
    await journalService.addEntry(entry('second'));
    const all = await journalService.getAll();
    expect(all.map((e) => e.id)).toEqual(['second', 'first']);
  });

  it('deleteEntry removes only the matching id', async () => {
    await journalService.addEntry(entry('keep'));
    await journalService.addEntry(entry('remove'));
    await journalService.deleteEntry('remove');
    const all = await journalService.getAll();
    expect(all.map((e) => e.id)).toEqual(['keep']);
  });

  it('clear empties the journal', async () => {
    await journalService.addEntry(entry('a'));
    await journalService.clear();
    await expect(journalService.getAll()).resolves.toEqual([]);
  });

  it('prunes to MAX_JOURNAL_ENTRIES, dropping the oldest', async () => {
    const overCapacity = Array.from({ length: MAX_JOURNAL_ENTRIES + 1 }, (_, i) =>
      entry(`e${i}`)
    );
    await journalService.save(overCapacity);
    const all = await journalService.getAll();
    expect(all).toHaveLength(MAX_JOURNAL_ENTRIES);
    expect(all[0].id).toBe('e0'); // first (newest) kept
    expect(all.find((e) => e.id === `e${MAX_JOURNAL_ENTRIES}`)).toBeUndefined();
  });

  it('returns [] when stored JSON is corrupt (fail-open)', async () => {
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    await AsyncStorage.setItem(JOURNAL_KEY, '{not valid json');
    await expect(journalService.getAll()).resolves.toEqual([]);
    err.mockRestore();
  });

  // Phase 2a — outcome tracking
  it('updateOutcome persists the outcome to AsyncStorage', async () => {
    await journalService.addEntry(entry('a'));
    await journalService.updateOutcome('a', 'came_true');
    const all = await journalService.getAll();
    expect(all[0].outcome).toBe('came_true');
  });

  it('updateOutcome can set outcome to null (clear)', async () => {
    await journalService.addEntry({ ...entry('b'), outcome: 'came_true' });
    await journalService.updateOutcome('b', null);
    const all = await journalService.getAll();
    expect(all[0].outcome).toBeNull();
  });

  it('updateOutcome on unknown id is a no-op and does not throw', async () => {
    await journalService.addEntry(entry('c'));
    await expect(
      journalService.updateOutcome('nonexistent', 'pending')
    ).resolves.toBeUndefined();
    const all = await journalService.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].outcome).toBeUndefined();
  });
});
