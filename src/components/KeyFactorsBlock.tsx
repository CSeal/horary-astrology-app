// src/components/KeyFactorsBlock.tsx
// Card: title + bullet list of key factors. Title fades in first, then each
// factor row slides in from the left with an index-driven stagger.

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, AnimatedView } from '@/tw';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface KeyFactorsBlockProps {
  factors: string[];
}

// One bullet line that slides in from the left, staggered by index.
function FactorRow({ index, factor }: { index: number; factor: string }) {
  const translateX = useSharedValue(-12);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(
      index * 60 + 80,
      withSpring(0, { damping: 14, stiffness: 120 })
    );
    opacity.value = withTiming(1, { duration: 260 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <AnimatedView style={style}>
      <Text className="font-inter text-sm text-text-primary">
        {`· ${factor}`}
      </Text>
    </AnimatedView>
  );
}

export function KeyFactorsBlock({ factors }: KeyFactorsBlockProps) {
  const { t } = useTranslation();

  const titleOpacity = useSharedValue(0);
  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));

  if (factors.length === 0) {
    return null;
  }

  return (
    <View className="bg-bg-card rounded-xl px-4 py-3 gap-1.5">
      <AnimatedView style={titleStyle}>
        <Text className="font-inter-semibold text-[11px] text-accent-gold uppercase tracking-[2px]">
          {t('verdict.keyFactorsTitle')}
        </Text>
      </AnimatedView>
      {factors.map((factor, idx) => (
        <FactorRow key={`${idx}-${factor}`} index={idx} factor={factor} />
      ))}
    </View>
  );
}
