// src/components/ui/Banner.tsx
// Error / warning inline banner with a soft slide-in entrance.

import { useEffect } from 'react';
import { AnimatedView, Text, TouchableOpacity } from '@/tw';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface BannerProps {
  message: string;
  type?: 'error' | 'warning';
  onDismiss?: () => void;
  dismissLabel?: string;
}

export function Banner({
  message,
  type = 'error',
  onDismiss,
  dismissLabel,
}: BannerProps) {
  const containerClass =
    type === 'error'
      ? 'bg-no/10 border border-no/30'
      : 'bg-maybe/10 border border-maybe/30';

  const translateY = useSharedValue(-16);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <AnimatedView
      style={entranceStyle}
      className={`${containerClass} rounded-xl p-3 flex-row items-start`}
    >
      <Text className="flex-1 text-sm font-inter text-text-primary leading-relaxed">
        {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          className="ml-2 min-w-11 min-h-11 items-center justify-center"
          accessibilityLabel={dismissLabel ?? 'Dismiss'}
          accessibilityRole="button"
        >
          <Text className="text-text-secondary text-lg">×</Text>
        </TouchableOpacity>
      )}
    </AnimatedView>
  );
}
