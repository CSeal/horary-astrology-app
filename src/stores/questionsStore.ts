// src/stores/questionsStore.ts
// Zustand v5 — named export only: import { create } from 'zustand'
// Manages journal entries. Question limits are enforced server-side (API returns 429 → LIMIT_EXCEEDED).
// AsyncStorage key: horary_journal

import { create } from 'zustand';
import { journalService } from '@/services/journalService';
import { notificationService } from '@/services/notificationService';
import type { JournalEntry } from '@/types/journal';

interface QuestionsState {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
  updateOutcome: (id: string, outcome: JournalEntry['outcome']) => Promise<void>;
  // Debug-only — wipe all entries. Not part of normal app flow.
  clearAllEntries: () => Promise<void>;
}

export const useQuestionsStore = create<QuestionsState>((set) => ({
  entries: [],

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

  updateOutcome: async (id: string, outcome: JournalEntry['outcome']) => {
    await journalService.updateOutcome(id, outcome);
    const updated = await journalService.getAll();
    set({ entries: updated });
    // Stage 6c — a recorded conclusive outcome makes the reminder redundant.
    if (outcome === 'came_true' || outcome === 'did_not_happen') {
      notificationService.cancel(id).catch(/* istanbul ignore next */ () => {});
    }
  },

  hydrate: async () => {
    try {
      const entries = await journalService.getAll();
      set({ entries });
    } catch {
      console.error('[questionsStore] Failed to hydrate questions store');
    }
  },

  clearAllEntries: async () => {
    await journalService.clear();
    set({ entries: [] });
  },
}));
