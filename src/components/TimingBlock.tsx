// src/components/TimingBlock.tsx
// Full timing detail: large estimate, the engine's explanation, and a
// days→weeks→months scale bar with a marker at the estimated unit.

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { View, Text, AnimatedView } from '@/tw';
import type { JournalTiming } from '@/types/journal';
import { timingScalePosition } from '@/constants/zodiac';

interface TimingBlockProps {
  timing: JournalTiming;
}

const SCALE_COLUMNS = ['days', 'weeks', 'months'] as const;

const CONFIDENCE_PILL_CLASS: Record<
  NonNullable<JournalTiming['confidence']>,
  string
> = {
  very_high: 'bg-yes/15 text-yes',
  high: 'bg-yes/15 text-yes',
  medium: 'bg-maybe/15 text-maybe',
  low: 'bg-no/15 text-no',
  very_low: 'bg-no/15 text-no',
};

export function TimingBlock({ timing }: TimingBlockProps) {
  const { t } = useTranslation();

  const estimate = t('verdict.timingEstimate', {
    value: timing.value,
    unit: t(`verdict.timingUnit.${timing.time_unit}`),
  });
  const activeColumn =
    timing.time_unit === 'years' ? 'months' : timing.time_unit;

  // Scale-pop the headline estimate on mount.
  const estimateScale = useSharedValue(0.9);
  const estimateOpacity = useSharedValue(0);
  useEffect(() => {
    estimateScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    estimateOpacity.value = withTiming(1, { duration: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const estimateStyle = useAnimatedStyle(() => ({
    opacity: estimateOpacity.value,
    transform: [{ scale: estimateScale.value }],
  }));

  // Explanation fades in just behind the estimate.
  const explanationOpacity = useSharedValue(0);
  useEffect(() => {
    explanationOpacity.value = withDelay(150, withTiming(1, { duration: 300 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const explanationStyle = useAnimatedStyle(() => ({
    opacity: explanationOpacity.value,
  }));

  // Confidence pill scales in after the estimate settles.
  const pillScale = useSharedValue(0.6);
  const pillOpacity = useSharedValue(0);
  useEffect(() => {
    pillScale.value = withDelay(300, withSpring(1, { damping: 11, stiffness: 200 }));
    pillOpacity.value = withDelay(300, withTiming(1, { duration: 250 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ scale: pillScale.value }],
  }));

  // Slide the scale marker from the left edge to its estimated position.
  const markerPos = useSharedValue(0);
  useEffect(() => {
    markerPos.value = withDelay(
      200,
      withTiming(timingScalePosition(timing.time_unit) * 100, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animatedMarkerStyle = useAnimatedStyle(() => ({
    left: `${markerPos.value}%`,
  }));

  return (
    <View className="bg-bg-card rounded-xl px-4 pt-4 pb-5">
      <AnimatedView style={estimateStyle} className="self-start">
        <Text className="font-cormorant-bold text-3xl text-accent-gold">
          {estimate}
        </Text>
      </AnimatedView>

      {!!timing.explanation && (
        <AnimatedView style={explanationStyle}>
          <Text className="font-inter text-xs text-text-secondary mt-2 leading-relaxed">
            {timing.explanation}
          </Text>
        </AnimatedView>
      )}

      {timing.confidence && (
        <View className="flex-row mt-2">
          <AnimatedView style={pillStyle}>
            <Text
              className={`font-inter-semibold text-[10px] px-2 py-0.5 rounded-full ${CONFIDENCE_PILL_CLASS[timing.confidence]}`}
            >
              {t(`verdict.timingConfidence.${timing.confidence}`)}
            </Text>
          </AnimatedView>
        </View>
      )}

      {!!timing.basedOn && (
        <Text className="font-mono text-[10px] text-text-secondary mt-1">
          {t('verdict.timingBasedOn', { text: timing.basedOn })}
        </Text>
      )}

      <View className="mt-4">
        <View className="h-1.5 rounded-full bg-bg-surface my-2">
          <AnimatedView
            className="absolute w-3 h-3 rounded-full bg-accent-gold"
            style={[{ top: 3, marginLeft: -6 }, animatedMarkerStyle]}
          />
        </View>
        <View className="flex-row justify-between mt-1">
          {SCALE_COLUMNS.map((unit) => (
            <Text
              key={unit}
              className={`font-mono text-[10px] tracking-wider ${
                unit === activeColumn ? 'text-accent-gold' : 'text-text-secondary'
              }`}
            >
              {t(`verdict.timingScale.${unit}`)}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
