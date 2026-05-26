// src/stores/questionsStore.ts
// Zustand v5 — named export only: import { create } from 'zustand'
// Manages journal entries + monthly question counter.
// AsyncStorage keys: horary_journal, horary_question_count, horary_question_reset_date

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_STORAGE_KEYS } from '../constants/config';
import { journalService } from '../services/journalService';
import type { JournalEntry } from '../types/journal';

interface QuestionsState {
  entries: JournalEntry[];
  monthlyCount: number;
  monthlyResetDate: string; // 'YYYY-MM'
  addEntry: (entry: JournalEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  incrementMonthlyCount: () => Promise<void>;
  checkAndResetMonthlyCounter: () => Promise<void>;
  hydrate: () => Promise<void>;
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7); // 'YYYY-MM'
}

export const useQuestionsStore = create<QuestionsState>((set, get) => ({
  entries: [],
  monthlyCount: 0,
  monthlyResetDate: getCurrentMonth(),

  addEntry: async (entry: JournalEntry) => {
    await journalService.addEntry(entry);
    const updated = await journalService.getAll();
    set({ entries: updated });
  },

  deleteEntry: async (id: string) => {
    await journalService.deleteEntry(id);
    const updated = await journalService.getAll();
    set({ entries: updated });
  },

  incrementMonthlyCount: async () => {
    const newCount = get().monthlyCount + 1;
    set({ monthlyCount: newCount });
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.QUESTION_COUNT, String(newCount));
    } catch {
      console.error('[questionsStore] Failed to persist monthly count');
    }
  },

  checkAndResetMonthlyCounter: async () => {
    const currentMonth = getCurrentMonth();
    if (get().monthlyResetDate !== currentMonth) {
      set({ monthlyCount: 0, monthlyResetDate: currentMonth });
      try {
        await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.QUESTION_COUNT, '0');
        await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.QUESTION_RESET_DATE, currentMonth);
      } catch {
        console.error('[questionsStore] Failed to persist monthly counter reset');
      }
    }
  },

  hydrate: async () => {
    try {
      const [entries, count, resetDate] = await Promise.all([
        journalService.getAll(),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.QUESTION_COUNT),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.QUESTION_RESET_DATE),
      ]);

      const currentMonth = getCurrentMonth();
      const storedMonth = resetDate ?? currentMonth;
      const isNewMonth = storedMonth !== currentMonth;

      set({
        entries,
        monthlyCount: isNewMonth ? 0 : parseInt(count ?? '0', 10),
        monthlyResetDate: isNewMonth ? currentMonth : storedMonth,
      });

      if (isNewMonth) {
        await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.QUESTION_COUNT, '0');
        await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.QUESTION_RESET_DATE, currentMonth);
      }
    } catch {
      console.error('[questionsStore] Failed to hydrate questions store');
    }
  },
}));
