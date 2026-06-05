// src/hooks/useDebugTrigger.ts
// Hidden activation gesture for developer debug mode (Android "Build Number"
// pattern): tap the version label 7 times within a 3-second rolling window.
// Progressive haptics hint that something is happening on taps 6 and 7.
//
// This hook only detects the gesture. PIN verification + the action menu live
// in DebugSheet — keeping the PIN entry cross-platform (Alert.prompt is iOS-only)
// and out of this hook. If DEBUG_PIN is unset the gesture still fires, but the
// sheet's PIN gate can never be satisfied, so debug mode stays unreachable.

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

const REQUIRED_TAPS = 20;
const TAP_WINDOW_MS = 4000; // wider window for 20 taps
const SHOW_DOTS_FROM = 15;  // dots appear on this tap and beyond

export function useDebugTrigger(onTriggered: () => void) {
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Reactive count for the UI progress indicator (0 = not started).
  const [tapCount, setTapCount] = useState(0);

  // Clear any pending reset timer on unmount so it can't fire setState after
  // the component is gone (also prevents a leaked timer handle in tests).
  useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    []
  );

  const registerTap = useCallback(() => {
    const now = Date.now();

    // Reset the streak if the user paused too long between taps.
    if (now - lastTapRef.current > TAP_WINDOW_MS) {
      tapCountRef.current = 0;
    }
    lastTapRef.current = now;
    tapCountRef.current += 1;

    const count = tapCountRef.current;
    setTapCount(count);

    // Auto-clear the progress indicator after the tap window expires.
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
      setTapCount(0);
    }, TAP_WINDOW_MS);

    if (count === SHOW_DOTS_FROM) {
      // Dots appear — medium feedback signals "you're in the final stretch".
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(/* istanbul ignore next */ () => {});
    } else if (count === REQUIRED_TAPS - 1) {
      // One tap left — light tick.
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(/* istanbul ignore next */ () => {});
    } else if (count >= REQUIRED_TAPS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(/* istanbul ignore next */ () => {});
      tapCountRef.current = 0;
      lastTapRef.current = 0;
      setTapCount(0);
      /* istanbul ignore else */
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      onTriggered();
    }
  }, [onTriggered]);

  return { registerTap, tapCount, requiredTaps: REQUIRED_TAPS, showDotsFrom: SHOW_DOTS_FROM };
}
