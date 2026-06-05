// src/hooks/__tests__/useStreak.test.ts
// Streak math: current streak tolerates a missing "today", max streak scans
// the full history. useJournal is mocked to inject controlled timestamps.

import { renderHook } from '@testing-library/react-native';
import { useStreak } from '@/hooks/useStreak';
import { useJournal } from '@/hooks/useJournal';
import type { JournalEntry } from '@/types/journal';

jest.mock('@/hooks/useJournal', () => ({ useJournal: jest.fn() }));

const mockUseJournal = useJournal as jest.Mock;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function entryDaysAgo(n: number): JournalEntry {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  const ts = new Date(d.getTime() - n * MS_PER_DAY).toISOString();
  return { timestamp: ts } as JournalEntry;
}

function setEntries(entries: JournalEntry[]) {
  mockUseJournal.mockReturnValue({
    entries,
    deleteEntry: jest.fn(),
    getEntryById: jest.fn(),
  });
}

afterEach(() => jest.clearAllMocks());

describe('useStreak', () => {
  it('returns zero for empty entries', () => {
    setEntries([]);
    const { result } = renderHook(() => useStreak());
    expect(result.current).toEqual({ current: 0, max: 0 });
  });

  it('counts a single entry today', () => {
    setEntries([entryDaysAgo(0)]);
    const { result } = renderHook(() => useStreak());
    expect(result.current).toEqual({ current: 1, max: 1 });
  });

  it('counts a single entry yesterday without penalising for today', () => {
    setEntries([entryDaysAgo(1)]);
    const { result } = renderHook(() => useStreak());
    expect(result.current).toEqual({ current: 1, max: 1 });
  });

  it('breaks the current streak when the latest entry is two days ago', () => {
    setEntries([entryDaysAgo(2)]);
    const { result } = renderHook(() => useStreak());
    expect(result.current).toEqual({ current: 0, max: 1 });
  });

  it('counts five consecutive days ending today', () => {
    setEntries([0, 1, 2, 3, 4].map(entryDaysAgo));
    const { result } = renderHook(() => useStreak());
    expect(result.current).toEqual({ current: 5, max: 5 });
  });

  it('handles a gap: recent 2-day run, current is the recent run', () => {
    setEntries([0, 1, 4, 5, 6].map(entryDaysAgo));
    const { result } = renderHook(() => useStreak());
    expect(result.current).toEqual({ current: 2, max: 3 });
  });

  it('keeps max from an old run while current is the recent run', () => {
    const old = [40, 41, 42, 43, 44, 45, 46].map(entryDaysAgo);
    const recent = [0, 1].map(entryDaysAgo);
    setEntries([...old, ...recent]);
    const { result } = renderHook(() => useStreak());
    expect(result.current).toEqual({ current: 2, max: 7 });
  });
});
