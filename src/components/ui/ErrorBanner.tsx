// src/components/ui/ErrorBanner.tsx
// Inline error / warning banner with an optional action button.
// Soft slide-in entrance from above.

import { useEffect } from 'react';
import { AnimatedView, View, Text, TouchableOpacity } from '@/tw';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ErrorBannerAction {
  label: string;
  onPress: () => void;
}

interface ErrorBannerProps {
  message: string;
  type?: 'warning' | 'error';
  action?: ErrorBannerAction;
}

export function ErrorBanner({
  message,
  type = 'error',
  action,
}: ErrorBannerProps) {
  const containerClass =
    type === 'error'
      ? 'bg-no/10 border border-no/30'
      : 'bg-maybe/10 border border-maybe/30';

  const accentClass = type === 'error' ? 'text-no' : 'text-maybe';

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
      className={`${containerClass} rounded-xl p-3 flex-row items-start gap-2`}
      accessibilityRole="alert"
    >
      <View className="flex-1">
        <Text className="text-sm font-inter text-text-primary leading-relaxed">
          {message}
        </Text>
      </View>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          className="min-w-11 min-h-11 items-center justify-center px-3"
          accessibilityLabel={action.label}
          accessibilityRole="button"
        >
          <Text className={`text-sm font-inter-semibold ${accentClass}`}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </AnimatedView>
  );
}
