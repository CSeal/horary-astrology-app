// src/hooks/useHoraryQuery.ts
// React Query v5 useMutation wrapper for POST /horary/ask.
// Side effects in onSuccess/onError callbacks (not useQuery — that API was removed in v5).
// Uses router.replace() for navigation (NOT router.navigate() — v4 semantics change).

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { horaryApi } from '@/services/horaryApi';
import { mockHoraryApi } from '@/services/mockHoraryApi';
import { reviewPromptService } from '@/services/reviewPromptService';
import { useQuestionsStore } from '@/stores/questionsStore';
import { useDebugStore } from '@/stores/debugStore';
import { LOADING_MIN_DURATION } from '@/constants/config';
import { withMinDuration } from '@/hooks/withMinDuration';
import type { HoraryRequest, HoraryResponse, HoraryAPIError } from '@/types/horary';
import type { JournalEntry } from '@/types/journal';

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
    aspects: response.aspects,
    voc_moon: response.voc_moon,
    voc_treatment: response.voc_treatment,
    is_radical: response.is_radical,
    radicality_summary: response.radicality_summary,
    radicality_score: response.radicality_score,
    timing: response.timing,
    voc_moon_sign: response.voc_moon_sign,
    voc_degrees_to_sign_change: response.voc_degrees_to_sign_change,
    voc_next_sign: response.voc_next_sign,
    voc_exception_sign: response.voc_exception_sign,
    timestamp: new Date().toISOString(),
    city,
    latitude: request.latitude,
    longitude: request.longitude,
  };
}

export function useHoraryQuery(city?: string) {
  const router = useRouter();
  const addEntry = useQuestionsStore((s) => s.addEntry);

  return useMutation<HoraryResponse, HoraryAPIError, HoraryRequest>({
    mutationFn: (request: HoraryRequest) => {
      // Debug mode: stub the response instead of hitting the real API.
      const { mockMode, mockVerdict, skipMinLoading } = useDebugStore.getState();
      const call = mockMode
        ? mockHoraryApi.ask(request, mockVerdict)
        : horaryApi.ask(request);
      return skipMinLoading
        ? call
        : withMinDuration(call, LOADING_MIN_DURATION);
    },
    onSuccess: async (data: HoraryResponse, variables: HoraryRequest) => {
      const entry = buildJournalEntry(variables, data, city);
      await addEntry(entry);
      router.replace(`/result/${entry.id}` as never);

      // FR-G02 — best-effort review prompt. Deferred 2s so the verdict reveal
      // animation completes first; never awaited so it can't block navigation.
      const entriesCount = useQuestionsStore.getState().entries.length;
      setTimeout(() => {
        reviewPromptService.maybePrompt(entriesCount, data.verdict).catch(() => {
          /* review prompt is best-effort — swallow all errors */
        });
      }, 2000);
    },
    // No navigation on error: the request runs inline on Home (loading replaces
    // the form), so the Home screen surfaces mutation.error as a banner and the
    // form returns when isPending clears. Calling router.back() here threw
    // "GO_BACK was not handled" because Home is the root tab — nothing to pop.
  });
}
