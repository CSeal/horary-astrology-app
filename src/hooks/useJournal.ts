// src/hooks/useJournal.ts
// Journal helper hook — selectors + delete helper.

import { useQuestionsStore } from '@/stores/questionsStore';

export function useJournal() {
  const entries = useQuestionsStore((s) => s.entries);
  const deleteEntry = useQuestionsStore((s) => s.deleteEntry);

  function getEntryById(id: string) {
    return entries.find((e) => e.id === id) ?? null;
  }

  return {
    entries,
    deleteEntry,
    getEntryById,
  };
}
