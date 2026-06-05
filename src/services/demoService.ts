// src/services/demoService.ts
// Manages the seeding and clearing of demo journal entries.
// Used by onboarding and the debug sheet to populate the journal with
// realistic fixture data without consuming API credits.

import { useQuestionsStore } from '@/stores/questionsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { DEMO_ENTRIES } from '@/fixtures/demoJournal';

export const DEMO_ID_PREFIX = 'demo-';

export const demoService = {
  /**
   * Seed the journal with all DEMO_ENTRIES if not already seeded.
   * Also sets hasApiKey so the API key guard does not block demo users.
   */
  async seed(): Promise<void> {
    if (demoService.isDemoSeeded()) {
      return;
    }
    useSettingsStore.getState().setHasApiKey(true);
    const { addEntry } = useQuestionsStore.getState();
    for (const entry of DEMO_ENTRIES) {
      await addEntry(entry);
    }
  },

  /**
   * Remove all demo entries from the journal one by one.
   */
  async clear(): Promise<void> {
    const { entries, deleteEntry } = useQuestionsStore.getState();
    const demoIds = entries
      .filter((e) => e.id.startsWith(DEMO_ID_PREFIX))
      .map((e) => e.id);
    for (const id of demoIds) {
      await deleteEntry(id);
    }
  },

  /**
   * Returns true if at least one demo entry is present in the journal.
   */
  isDemoSeeded(): boolean {
    const { entries } = useQuestionsStore.getState();
    return entries.some((e) => e.id.startsWith(DEMO_ID_PREFIX));
  },

  /**
   * Returns the count of demo entries currently in the store.
   */
  getDemoEntryCount(): number {
    const { entries } = useQuestionsStore.getState();
    return entries.filter((e) => e.id.startsWith(DEMO_ID_PREFIX)).length;
  },
};
