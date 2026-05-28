// src/hooks/__tests__/useDebugTrigger.test.ts
// The 7-tap-in-3s activation gesture. The hook measures the window with
// Date.now() (not setTimeout), so time is driven by spying on Date.now.

import { renderHook, act } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { useDebugTrigger } from '@/hooks/useDebugTrigger';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Heavy: 'heavy' },
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
  it('fires onTriggered after 7 rapid taps', () => {
    const { onTriggered, tap } = setup();
    for (let i = 0; i < 7; i++) tap();
    expect(onTriggered).toHaveBeenCalledTimes(1);
  });

  it('does not fire if a pause longer than the window breaks the streak', () => {
    const { onTriggered, tap } = setup();
    for (let i = 0; i < 4; i++) tap();
    advance(3_500); // exceeds the 3s window → next tap resets the streak
    for (let i = 0; i < 3; i++) tap();
    expect(onTriggered).not.toHaveBeenCalled();
  });

  it('plays a Light haptic on the 6th tap without firing yet', () => {
    const { onTriggered, tap } = setup();
    for (let i = 0; i < 6; i++) tap();
    expect(mockedImpact).toHaveBeenLastCalledWith('light');
    expect(onTriggered).not.toHaveBeenCalled();
  });

  it('plays a Heavy haptic and fires on the 7th tap', () => {
    const { onTriggered, tap } = setup();
    for (let i = 0; i < 7; i++) tap();
    expect(mockedImpact).toHaveBeenLastCalledWith('heavy');
    expect(onTriggered).toHaveBeenCalledTimes(1);
  });

  it('re-arms after firing so a second 7-tap run fires again', () => {
    const { onTriggered, tap } = setup();
    for (let i = 0; i < 14; i++) tap();
    expect(onTriggered).toHaveBeenCalledTimes(2);
  });
});
