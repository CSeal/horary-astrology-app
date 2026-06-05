// src/components/StreakBadge.tsx
// Inline streak indicator — fire emoji + day count. Renders nothing at 0.
// No container background; meant to be embedded next to a title.

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimatedView, Text, View } from '@/tw';
import { colors } from '@/constants/theme';

interface StreakBadgeProps {
  streak: number;
}

const isMilestoneStreak = (s: number) =>
  s === 7 || s === 30 || s === 100 || (s > 0 && s % 7 === 0);

export function StreakBadge({ streak }: StreakBadgeProps) {
  const { t } = useTranslation();
  const isMilestone = isMilestoneStreak(streak);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    if (isMilestone) {
      scale.value = withSpring(1, { damping: 6, stiffness: 200 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    opacity.value = withTiming(1, { duration: 250 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  useEffect(() => {
    if (!isMilestone) return;
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      2,
      false,
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 250 }),
        withTiming(0, { duration: 250 }),
        withTiming(0.8, { duration: 250 }),
        withTiming(0, { duration: 250 }),
      ),
      2,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  if (streak === 0) return null;

  const label = t('streak.badge', { count: streak });
  return (
    <View className="relative items-center justify-center">
      {isMilestone && (
        <AnimatedView
          style={[
            glowStyle,
            {
              position: 'absolute',
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.accentGold,
            },
          ]}
        />
      )}
      <AnimatedView style={animStyle} className="flex-row items-center gap-1">
        <Text className="font-inter-medium text-sm text-accent-gold">{label}</Text>
      </AnimatedView>
    </View>
  );
}
