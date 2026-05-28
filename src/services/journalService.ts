// src/services/journalService.ts
// AsyncStorage CRUD for the journal.
// Key: horary_journal — stores a JSON array of JournalEntry, newest first.
// Maximum 500 entries — oldest pruned when exceeded.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_STORAGE_KEYS, MAX_JOURNAL_ENTRIES } from '@/constants/config';
import type { JournalEntry } from '@/types/journal';

export const journalService = {
  async getAll(): Promise<JournalEntry[]> {
    try {
      const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.JOURNAL);
      if (!raw) return [];
      return JSON.parse(raw) as JournalEntry[];
    } catch {
      console.error('[journalService] Failed to read journal');
      return [];
    }
  },

  async save(entries: JournalEntry[]): Promise<void> {
    try {
      const pruned = entries.slice(0, MAX_JOURNAL_ENTRIES);
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.JOURNAL, JSON.stringify(pruned));
    } catch {
      console.error('[journalService] Failed to save journal');
    }
  },

  async addEntry(entry: JournalEntry): Promise<void> {
    const existing = await journalService.getAll();
    const updated = [entry, ...existing].slice(0, MAX_JOURNAL_ENTRIES);
    await journalService.save(updated);
  },

  async deleteEntry(id: string): Promise<void> {
    const existing = await journalService.getAll();
    const updated = existing.filter((e) => e.id !== id);
    await journalService.save(updated);
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.JOURNAL);
    } catch {
      console.error('[journalService] Failed to clear journal');
    }
  },
};
