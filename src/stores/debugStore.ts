// src/stores/debugStore.ts
// In-memory developer debug flags. Intentionally NOT persisted to AsyncStorage:
// an accidentally-activated debug mode must not survive an app restart in a
// production binary. State resets to defaults on every cold start.
//
// Activation is gated by a PIN (see useDebugTrigger.ts + DEBUG_PIN). Nothing
// here is user-facing; the DebugSheet only renders once `isActive` is true.

import { create } from 'zustand';
import type { VerdictType } from '@/types/horary';

export type ForceErrorType = 'TIMEOUT' | 'NETWORK_ERROR' | 'INVALID_API_KEY' | 'LIMIT_EXCEEDED' | 'API_5XX' | null;

interface DebugState {
  // True once the user has passed the 7-tap + PIN gate this session.
  isActive: boolean;
  // When true, useHoraryQuery returns a stubbed response instead of a real POST.
  mockMode: boolean;
  // Which verdict the stubbed response returns.
  mockVerdict: VerdictType;
  // When true, skip the artificial LOADING_MIN_DURATION delay.
  skipMinLoading: boolean;
  // When true, _layout renders the force-update gate (for testing the gate).
  // Non-dismissable by design — restart the app to clear (in-memory flag).
  forceUpdateOverride: boolean;
  // When true, _layout resets splashDone so AnimatedSplash replays from start.
  replaySplash: boolean;
  // When true, demo journal is seeded and mock mode is implied.
  isDemoActive: boolean;
  // When non-null, useHoraryQuery throws a simulated error of this type.
  forceErrorType: ForceErrorType;
  // Simulated API delay: 0=instant, 600=realistic, 2000=slow.
  mockDelayMs: 0 | 600 | 2000;

  activate: () => void;
  deactivate: () => void;
  setMockMode: (on: boolean) => void;
  setMockVerdict: (verdict: VerdictType) => void;
  setSkipMinLoading: (on: boolean) => void;
  triggerForceUpdate: () => void;
  triggerReplaySplash: () => void;
  clearReplaySplash: () => void;
  setIsDemoActive: (val: boolean) => void;
  setForceErrorType: (type: ForceErrorType) => void;
  setMockDelayMs: (ms: 0 | 600 | 2000) => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  isActive: false,
  mockMode: false,
  mockVerdict: 'YES',
  skipMinLoading: false,
  forceUpdateOverride: false,
  replaySplash: false,
  isDemoActive: false,
  forceErrorType: null,
  mockDelayMs: 600,

  activate: () => set({ isActive: true }),
  deactivate: () => set({ isActive: false, mockMode: false }),
  setMockMode: (on) => set({ mockMode: on }),
  setMockVerdict: (verdict) => set({ mockVerdict: verdict }),
  setSkipMinLoading: (on) => set({ skipMinLoading: on }),
  triggerForceUpdate: () => set({ forceUpdateOverride: true }),
  triggerReplaySplash: () => set({ replaySplash: true }),
  clearReplaySplash: () => set({ replaySplash: false }),
  setIsDemoActive: (val) => set({ isDemoActive: val }),
  setForceErrorType: (type) => set({ forceErrorType: type }),
  setMockDelayMs: (ms) => set({ mockDelayMs: ms }),
}));
