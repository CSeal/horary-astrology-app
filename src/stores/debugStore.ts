// src/stores/debugStore.ts
// In-memory developer debug flags. Intentionally NOT persisted to AsyncStorage:
// an accidentally-activated debug mode must not survive an app restart in a
// production binary. State resets to defaults on every cold start.
//
// Activation is gated by a PIN (see useDebugTrigger.ts + DEBUG_PIN). Nothing
// here is user-facing; the DebugSheet only renders once `isActive` is true.

import { create } from 'zustand';
import type { VerdictType } from '../types/horary';

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

  activate: () => void;
  setMockMode: (on: boolean) => void;
  setMockVerdict: (verdict: VerdictType) => void;
  setSkipMinLoading: (on: boolean) => void;
  triggerForceUpdate: () => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  isActive: false,
  mockMode: false,
  mockVerdict: 'YES',
  skipMinLoading: false,
  forceUpdateOverride: false,

  activate: () => set({ isActive: true }),
  setMockMode: (on) => set({ mockMode: on }),
  setMockVerdict: (verdict) => set({ mockVerdict: verdict }),
  setSkipMinLoading: (on) => set({ skipMinLoading: on }),
  triggerForceUpdate: () => set({ forceUpdateOverride: true }),
}));
