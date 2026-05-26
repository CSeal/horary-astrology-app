// src/hooks/useHoraryQuery.ts
// React Query v5 useMutation wrapper for POST /horary/ask.
// Side effects in onSuccess/onError callbacks (not useQuery — that API was removed in v5).
// Uses router.replace() for navigation (NOT router.navigate() — v4 semantics change).

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { horaryApi } from '../services/horaryApi';
import { useQuestionsStore } from '../stores/questionsStore';
import type { HoraryRequest, HoraryResponse, HoraryAPIError } from '../types/horary';
import type { JournalEntry } from '../types/journal';

function buildJournalEntry(
  request: HoraryRequest,
  response: HoraryResponse,
  city?: string
): JournalEntry {
  return {
    id: response.id,
    question: request.question,
    verdict: response.verdict,
    confidence_band: response.confidence_band,
    summary: response.summary,
    significators: response.significators,
    voc_moon: response.voc_moon,
    voc_treatment: response.voc_treatment,
    timestamp: new Date().toISOString(),
    city,
    latitude: request.latitude,
    longitude: request.longitude,
  };
}

export function useHoraryQuery(city?: string) {
  const router = useRouter();
  const addEntry = useQuestionsStore((s) => s.addEntry);
  const incrementMonthlyCount = useQuestionsStore((s) => s.incrementMonthlyCount);

  return useMutation<HoraryResponse, HoraryAPIError, HoraryRequest>({
    mutationFn: (request: HoraryRequest) => horaryApi.ask(request),
    onSuccess: async (data: HoraryResponse, variables: HoraryRequest) => {
      const entry = buildJournalEntry(variables, data, city);
      await addEntry(entry);
      await incrementMonthlyCount();
      router.replace(`/result/${entry.id}` as never);
    },
    onError: (_error: HoraryAPIError) => {
      router.back();
    },
  });
}
