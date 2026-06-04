// src/services/reviewPromptService.ts
// FR-G02 — event-driven 5-star review prompt (Apple SKStoreReviewController via
// expo-store-review). Apple forbids triggering requestReview() from a button tap,
// so this fires from useHoraryQuery.onSuccess after a positive verdict — gated by
// install age, reading count, and a 180-day cooldown.
//
// All gates fail closed: any missing data or unavailable native module → no prompt.
// The native call is silently dropped by iOS after 3 prompts per 365-day window.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import {
  ASYNC_STORAGE_KEYS,
  REVIEW_MIN_ENTRIES,
  REVIEW_MIN_DAYS_SINCE_INSTALL,
  REVIEW_MIN_DAYS_BETWEEN_PROMPTS,
} from '@/constants/config';
import type { VerdictType } from '@/types/horary';

interface ReviewPromptState {
  prompted_at: string | null; // ISO string, or null if never prompted
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / MS_PER_DAY;
}

export const reviewPromptService = {
  // Call once on app launch (idempotent) — stamps the install date the first time.
  async initInstallDate(): Promise<void> {
    const existing = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.INSTALL_DATE);
    if (!existing) {
      await AsyncStorage.setItem(
        ASYNC_STORAGE_KEYS.INSTALL_DATE,
        new Date().toISOString()
      );
    }
  },

  // Main entry point — call after the journal save in useHoraryQuery.onSuccess.
  // Returns true only if the native prompt was actually requested.
  async maybePrompt(entriesCount: number, verdict: VerdictType): Promise<boolean> {
    // Gate 1 — only after emotionally positive verdicts.
    if (verdict !== 'YES' && verdict !== 'MAYBE') return false;

    // Gate 2 — enough readings to have formed an opinion.
    if (entriesCount < REVIEW_MIN_ENTRIES) return false;

    // Gate 3 — native review available (false on TestFlight / Expo Go).
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return false;

    // Gate 4 — installed long enough ago.
    const installDate = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.INSTALL_DATE
    );
    if (!installDate) return false;
    if (daysSince(installDate) < REVIEW_MIN_DAYS_SINCE_INSTALL) return false;

    // Gate 5 — respect the cooldown since the last prompt.
    const stateStr = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.REVIEW_PROMPT_STATE
    );
    const state: ReviewPromptState = stateStr
      ? (JSON.parse(stateStr) as ReviewPromptState)
      : { prompted_at: null };
    if (
      state.prompted_at !== null &&
      daysSince(state.prompted_at) < REVIEW_MIN_DAYS_BETWEEN_PROMPTS
    ) {
      return false;
    }

    // All gates passed — prompt and record the attempt.
    await StoreReview.requestReview();
    await AsyncStorage.setItem(
      ASYNC_STORAGE_KEYS.REVIEW_PROMPT_STATE,
      JSON.stringify({ prompted_at: new Date().toISOString() } as ReviewPromptState)
    );
    return true;
  },
};
