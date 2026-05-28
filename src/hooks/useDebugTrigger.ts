// src/hooks/useDebugTrigger.ts
// Hidden activation gesture for developer debug mode (Android "Build Number"
// pattern): tap the version label 7 times within a 3-second rolling window.
// Progressive haptics hint that something is happening on taps 6 and 7.
//
// This hook only detects the gesture. PIN verification + the action menu live
// in DebugSheet — keeping the PIN entry cross-platform (Alert.prompt is iOS-only)
// and out of this hook. If DEBUG_PIN is unset the gesture still fires, but the
// sheet's PIN gate can never be satisfied, so debug mode stays unreachable.

import { useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';

const REQUIRED_TAPS = 7;
const TAP_WINDOW_MS = 3000;

export function useDebugTrigger(onTriggered: () => void) {
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);

  const registerTap = useCallback(() => {
    const now = Date.now();

    // Reset the streak if the user paused too long between taps.
    if (now - lastTapRef.current > TAP_WINDOW_MS) {
      tapCountRef.current = 0;
    }
    lastTapRef.current = now;
    tapCountRef.current += 1;

    const count = tapCountRef.current;

    if (count === REQUIRED_TAPS - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (count >= REQUIRED_TAPS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      tapCountRef.current = 0;
      lastTapRef.current = 0;
      onTriggered();
    }
  }, [onTriggered]);

  return { registerTap };
}
