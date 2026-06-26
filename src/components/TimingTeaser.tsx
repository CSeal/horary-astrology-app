// src/components/TimingTeaser.tsx
// Screen-1 hook for the timing detail: gold clock + "When might this happen?" +
// the estimate + chevron. Tapping it pushes the full-reading screen.
// Rises in on mount (matching the verdict CTA), springs on press, and the clock
// circle breathes gently to draw the eye.

import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, AnimatedView } from '@/tw';
import { Clock, ChevronRight } from 'lucide-react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { JournalTiming } from '@/types/journal';
import { colors, typography } from '@/constants/theme';

interface TimingTeaserProps {
  timing: JournalTiming;
  onPress: () => void;
}

export function TimingTeaser({ timing, onPress }: TimingTeaserProps) {
  const { t } = useTranslation();

  const estimate = t('verdict.timingEstimate', {
    value: timing.value,
    unit: t(`verdict.timingUnit.${timing.time_unit}`),
  });

  // Mount entrance: rise + fade, delayed to match the verdict screen's CTA.
  const enterY = useSharedValue(12);
  const enterOp = useSharedValue(0);
  useEffect(() => {
    enterY.value = withDelay(160, withSpring(0, { damping: 12, stiffness: 90 }));
    enterOp.value = withDelay(160, withTiming(1, { duration: 320 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const entranceStyle = useAnimatedStyle(() => ({
    opacity: enterOp.value,
    transform: [{ translateY: enterY.value }],
  }));

  // Press scale: tactile squeeze that springs back on release.
  const pressScale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));
  const onPressIn = useCallback(() => {
    pressScale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onPressOut = useCallback(() => {
    pressScale.value = withSpring(1, { damping: 14, stiffness: 240 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clock circle breathes gently to keep the card feeling alive.
  const breathe = useSharedValue(1);
  useEffect(() => {
    breathe.value = withRepeat(withTiming(1.06, { duration: 1600 }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  // This card navigates — fire a medium impact before handing off.
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress();
  }, [onPress]);

  return (
    <AnimatedView style={entranceStyle}>
      <AnimatedView style={pressStyle}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`${t('verdict.timingWhen')} ${estimate}`}
          className="flex-row items-center gap-3 bg-accent-gold/10 border border-border-focus rounded-xl px-4 py-3"
        >
          <AnimatedView
            style={breatheStyle}
            className="w-10 h-10 rounded-full bg-accent-gold/10 items-center justify-center"
          >
            <Clock color={colors.accentGold} size={typography.lg} />
          </AnimatedView>
          <View className="flex-1">
            <Text className="font-inter-semibold text-[10px] text-text-secondary uppercase tracking-widest">
              {t('verdict.timingWhen')}
            </Text>
            <Text className="font-cormorant-bold text-xl text-accent-gold mt-0.5">
              {estimate}
            </Text>
          </View>
          <ChevronRight color={colors.textSecondary} size={typography.lg} />
        </TouchableOpacity>
      </AnimatedView>
    </AnimatedView>
  );
}
