// src/stores/__tests__/questionsStore.test.ts
// Unit tests for questionsStore — monthly counter reset logic.
// See docs/quality-gates.md section 2.2 for full test spec.

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock journalService to avoid real AsyncStorage reads
jest.mock('../../services/journalService', () => ({
  journalService: {
    getAll: jest.fn().mockResolvedValue([]),
    addEntry: jest.fn().mockResolvedValue(undefined),
    deleteEntry: jest.fn().mockResolvedValue(undefined),
  },
}));

import { useQuestionsStore } from '../questionsStore';

describe('questionsStore — monthly counter', () => {
  beforeEach(() => {
    useQuestionsStore.setState({
      entries: [],
      monthlyCount: 0,
      monthlyResetDate: new Date().toISOString().slice(0, 7),
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
    // Reset date should be updated to current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    expect(state.monthlyResetDate).toBe(currentMonth);
  });

  it('does not reset counter in same month', async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    useQuestionsStore.setState({ monthlyCount: 3, monthlyResetDate: currentMonth });
    await useQuestionsStore.getState().checkAndResetMonthlyCounter();
    expect(useQuestionsStore.getState().monthlyCount).toBe(3);
  });
});
