// src/hooks/__tests__/useDebugTrigger.test.ts
// The 20-tap-in-4s activation gesture. The hook measures the window with
// Date.now() (not setTimeout), so time is driven by spying on Date.now.

import { renderHook, act } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { useDebugTrigger } from '@/hooks/useDebugTrigger';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const mockedImpact = Haptics.impactAsync as jest.Mock;

let nowValue = 10_000;
const advance = (ms: number) => {
  nowValue += ms;
};

beforeEach(() => {
  jest.clearAllMocks();
  nowValue = 10_000;
  jest.spyOn(Date, 'now').mockImplementation(() => nowValue);
});

afterEach(() => {
  (Date.now as jest.Mock).mockRestore();
});

function setup() {
  const onTriggered = jest.fn();
  const { result } = renderHook(() => useDebugTrigger(onTriggered));
  const tap = () => act(() => result.current.registerTap());
  return { onTriggered, tap };
}

describe('useDebugTrigger', () => {
  it('fires onTriggered after 20 rapid taps', () => {
    const { onTriggered, tap } = setup();
    for (let i = 0; i < 20; i++) tap();
    expect(onTriggered).toHaveBeenCalledTimes(1);
  });

  it('does not fire if a pause longer than the window breaks the streak', () => {
    const { onTriggered, tap } = setup();
    for (let i = 0; i < 10; i++) tap();
    advance(4_500); // exceeds the 4s window → next tap resets the streak
    for (let i = 0; i < 10; i++) tap();
    expect(onTriggered).not.toHaveBeenCalled();
  });

  it('plays a Medium haptic on tap 15 (dots appear) without firing', () => {
    const { onTriggered, tap } = setup();
    for (let i = 0; i < 15; i++) tap();
    expect(mockedImpact).toHaveBeenLastCalledWith('medium');
    expect(onTriggered).not.toHaveBeenCalled();
  });

  it('plays a Light haptic on tap 19 without firing yet', () => {
    const { onTriggered, tap } = setup();
    for (let i = 0; i < 19; i++) tap();
    expect(mockedImpact).toHaveBeenLastCalledWith('light');
    expect(onTriggered).not.toHaveBeenCalled();
  });

  it('plays a Heavy haptic and fires on the 20th tap', () => {
    const { onTriggered, tap } = setup();
    for (let i = 0; i < 20; i++) tap();
    expect(mockedImpact).toHaveBeenLastCalledWith('heavy');
    expect(onTriggered).toHaveBeenCalledTimes(1);
  });

  it('re-arms after firing so a second 20-tap run fires again', () => {
    const { onTriggered, tap } = setup();
    for (let i = 0; i < 40; i++) tap();
    expect(onTriggered).toHaveBeenCalledTimes(2);
  });

  it('resets tapCount to 0 after the tap window expires with no completion', () => {
    jest.useFakeTimers();
    const onTriggered = jest.fn();
    const { result } = renderHook(() => useDebugTrigger(onTriggered));
    const tap = () => act(() => result.current.registerTap());

    // Tap 5 times (not enough to trigger at 20)
    for (let i = 0; i < 5; i++) tap();
    expect(result.current.tapCount).toBe(5);

    // Advance time past the 4000ms window → setTimeout callback fires
    act(() => { jest.advanceTimersByTime(4100); });

    // tapCount should reset to 0
    expect(result.current.tapCount).toBe(0);
    expect(onTriggered).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('cleanup on unmount without any taps does not throw (resetTimerRef is null)', () => {
    const onTriggered = jest.fn();
    const { unmount } = renderHook(() => useDebugTrigger(onTriggered));
    // Unmount immediately without any taps — resetTimerRef.current is null
    // This covers the cleanup function itself AND the false branch of if (resetTimerRef.current)
    expect(() => unmount()).not.toThrow();
    expect(onTriggered).not.toHaveBeenCalled();
  });

  it('cleanup on unmount after taps clears the pending reset timer', () => {
    jest.useFakeTimers();
    const onTriggered = jest.fn();
    const { result, unmount } = renderHook(() => useDebugTrigger(onTriggered));

    // Tap a few times to set resetTimerRef.current
    act(() => result.current.registerTap());
    act(() => result.current.registerTap());
    act(() => result.current.registerTap());

    // Unmount — resetTimerRef.current is set, so clearTimeout is called (true branch)
    expect(() => unmount()).not.toThrow();

    jest.useRealTimers();
  });
});
