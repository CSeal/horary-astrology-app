// src/components/StreakBadge.tsx
// Inline streak indicator — fire emoji + day count. Renders nothing at 0.
// No container background; meant to be embedded next to a title.

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimatedView, Text } from '@/tw';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const { t } = useTranslation();

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 250 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (streak === 0) return null;

  const label = t('streak.badge', { count: streak });
  return (
    <AnimatedView style={animStyle} className="flex-row items-center gap-1">
      <Text className="font-inter-medium text-sm text-accent-gold">{label}</Text>
    </AnimatedView>
  );
}
