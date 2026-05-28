// src/components/ui/SkeletonItem.tsx
// Shimmer placeholder for loading lists (e.g. Journal hydration).
// Opacity pulse + horizontal gold shimmer strip — driven entirely on the UI thread.

import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { View } from '@/tw';

interface SkeletonItemProps {
  /** Height in px (Tailwind h-* not used — value is dynamic). */
  height?: number;
  /** Optional className for width / spacing overrides. */
  className?: string;
}

const SHIMMER_WIDTH = 90;

export function SkeletonItem({ height = 72, className = '' }: SkeletonItemProps) {
  const opacity = useSharedValue(0.5);
  const shimmerX = useSharedValue(-SHIMMER_WIDTH);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, {
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    shimmerX.value = withRepeat(
      withTiming(400, {
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baseStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  return (
    <View
      className={`bg-bg-card rounded-xl overflow-hidden ${className}`}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
    >
      <Animated.View
        style={[{ height, width: '100%', backgroundColor: 'transparent' }, baseStyle]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: SHIMMER_WIDTH,
            backgroundColor: 'rgba(245,200,66,0.08)',
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
}
