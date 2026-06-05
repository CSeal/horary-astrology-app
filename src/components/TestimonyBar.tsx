// src/components/TestimonyBar.tsx
// Proportional ⊕/⊖ testimony bar for the verdict screen. Renders
// judgment.testimony_score { positive, negative, neutral } as a three-segment
// horizontal bar with count labels. Returns null when there is no testimony.

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { View, Text, AnimatedView } from '@/tw';

interface TestimonyBarProps {
  score: { positive: number; negative: number; neutral: number };
}

// One bar segment that animates its width from 0% to targetPct on mount.
function Segment({
  targetPct,
  delay,
  duration,
  className,
}: {
  targetPct: number;
  delay: number;
  duration: number;
  className: string;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(targetPct, { duration, easing: Easing.out(Easing.ease) })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));
  return <AnimatedView style={animStyle} className={className} />;
}

export function TestimonyBar({ score }: TestimonyBarProps) {
  const { t } = useTranslation();
  const { positive, negative, neutral } = score;
  const total = positive + negative + neutral;

  if (total === 0) return null;

  const pct = (count: number): number => (count / total) * 100;

  return (
    <View className="bg-bg-card rounded-xl px-4 py-3 gap-2">
      <Text className="font-inter-semibold text-[11px] text-accent-gold uppercase tracking-[2px]">
        {t('verdict.testimonyTitle')}
      </Text>

      <View className="bg-bg-surface rounded-full">
        <View className="h-2 rounded-full overflow-hidden flex-row">
          <Segment
            targetPct={pct(positive)}
            delay={0}
            duration={600}
            className="bg-yes h-full"
          />
          <Segment
            targetPct={pct(neutral)}
            delay={100}
            duration={500}
            className="bg-bg-surface h-full"
          />
          <Segment
            targetPct={pct(negative)}
            delay={200}
            duration={500}
            className="bg-no h-full"
          />
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-2">
        <Text className="font-mono text-[12px] text-yes font-semibold">
          {`⊕ ${positive}`}
        </Text>
        <Text className="font-mono text-[11px] text-text-secondary">
          {t('verdict.testimonyNeutral', { n: neutral })}
        </Text>
        <Text className="font-mono text-[12px] text-no font-semibold">
          {`⊖ ${negative}`}
        </Text>
      </View>
    </View>
  );
}
