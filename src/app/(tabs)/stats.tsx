// src/app/(tabs)/stats.tsx
// Statistics screen — shows verdict distribution, outcome accuracy,
// activity by month, streak, and top topics.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView, ScrollView, View, Text, AnimatedView } from '@/tw';
import { CosmosBackground } from '@/components/CosmosBackground';
import { useStats } from '@/hooks/useStats';
import type { VerdictType } from '@/types/horary';

// Verdicts shown in the distribution section (MAYBE skipped when count 0).
const DIST_VERDICTS: VerdictType[] = ['YES', 'NO', 'UNCLEAR', 'MAYBE'];

const VERDICT_BAR_CLASS: Record<VerdictType, string> = {
  YES: 'bg-yes',
  NO: 'bg-no',
  UNCLEAR: 'bg-maybe',
  MAYBE: 'bg-maybe',
};

// Inner colored bar that animates its width from 0% to targetPct on mount.
function AnimatedBar({
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

// Pure-JS count-up: animates from 0 to `target` with an ease-out curve.
function useCountUp(target: number, duration = 700): number {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2); // ease-out quad
      setDisplay(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(target);
    };
    requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return display;
}

// Summary stat block with a spring scale + fade entrance on mount.
// The number counts up from 0; `prefix`/`suffix` wrap it (e.g. "🔥 " / "%").
function StatBlock({
  delay,
  value,
  prefix = '',
  suffix = '',
  label,
}: {
  delay: number;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 100 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const count = useCountUp(value);
  return (
    <AnimatedView style={animStyle} className="flex-1 items-center">
      <Text className="font-cormorant-bold text-2xl text-accent-gold">
        {`${prefix}${count}${suffix}`}
      </Text>
      <Text className="font-inter text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">
        {label}
      </Text>
    </AnimatedView>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="font-inter-semibold text-[11px] text-accent-gold uppercase tracking-[2px]">
      {label}
    </Text>
  );
}

export default function StatsScreen() {
  const { t } = useTranslation();
  const stats = useStats();

  const screenOp = useSharedValue(0);
  const screenY = useSharedValue(20);
  const emptyEnterOp = useSharedValue(0);
  const emptyEnterY = useSharedValue(20);
  const emptyFloatY = useSharedValue(0);
  useEffect(() => {
    screenOp.value = withTiming(1, { duration: 350 });
    screenY.value = withSpring(0, { damping: 14, stiffness: 100 });
    emptyEnterOp.value = withTiming(1, { duration: 400 });
    emptyEnterY.value = withSpring(0, { damping: 12, stiffness: 90 });
    emptyFloatY.value = withDelay(400, withRepeat(withTiming(-8, { duration: 2000 }), -1, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOp.value,
    transform: [{ translateY: screenY.value }],
  }));
  const emptyEnterStyle = useAnimatedStyle(() => ({
    opacity: emptyEnterOp.value,
    transform: [{ translateY: emptyEnterY.value }],
  }));
  const emptyFloatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: emptyFloatY.value }] }));

  if (stats === null) {
    return (
      <CosmosBackground>
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="px-5 pt-2 pb-4">
            <Text className="font-cormorant-medium text-xl text-text-primary">
              {t('stats.title')}
            </Text>
          </View>
          <AnimatedView style={emptyEnterStyle} className="flex-1 items-center justify-center px-5 gap-3">
            <AnimatedView style={emptyFloatStyle}>
              <Text className="text-accent-gold text-2xl">✦</Text>
            </AnimatedView>
            <Text className="font-inter text-sm text-text-secondary text-center">
              {t('stats.noData')}
            </Text>
          </AnimatedView>
        </SafeAreaView>
      </CosmosBackground>
    );
  }

  const {
    total,
    verdictCounts,
    verdictPercents,
    outcomesSet,
    accuracyPercent,
    topCategories,
    questionsByMonth,
    currentStreak,
    maxStreak,
  } = stats;

  const maxMonth = Math.max(1, ...questionsByMonth.map((m) => m.count));

  return (
    <CosmosBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="px-5 pt-2 pb-4">
          <Text className="font-cormorant-medium text-xl text-text-primary">
            {t('stats.title')}
          </Text>
        </View>

        <AnimatedView style={screenStyle} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-10 gap-6"
          removeClippedSubviews
        >
          {/* Summary card */}
          <View className="flex-row bg-bg-card border border-border rounded-xl px-4 py-4">
            <StatBlock
              delay={0}
              value={total}
              label={t('stats.totalQuestions', { count: total })}
            />

            {currentStreak > 0 && (
              <StatBlock
                delay={80}
                value={currentStreak}
                prefix="🔥 "
                label={t('stats.streakLabel')}
              />
            )}

            {maxStreak > currentStreak && maxStreak > 1 && (
              <StatBlock
                delay={160}
                value={maxStreak}
                prefix="✦ "
                label={t('stats.maxStreakLabel')}
              />
            )}

            {accuracyPercent !== null && (
              <StatBlock
                delay={240}
                value={accuracyPercent}
                suffix="%"
                label={t('stats.accuracyLabel')}
              />
            )}
          </View>

          {/* Verdicts */}
          <View className="gap-2">
            <SectionHeader label={t('stats.verdicts')} />
            {DIST_VERDICTS.filter(
              (v) => v !== 'MAYBE' || verdictCounts[v] > 0
            ).map((verdict, index) => (
              <View
                key={verdict}
                className="flex-row items-center gap-2 py-1"
              >
                <Text
                  className="font-mono text-xs text-text-secondary w-16"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {t(`verdictTypes.${verdict}` as const)}
                </Text>
                <View className="flex-1 h-1.5 rounded-full bg-bg-surface overflow-hidden">
                  <AnimatedBar
                    targetPct={verdictPercents[verdict]}
                    delay={index * 80}
                    duration={600}
                    className={`h-full rounded-full ${VERDICT_BAR_CLASS[verdict]}`}
                  />
                </View>
                <Text className="font-mono text-xs text-text-secondary w-10 text-right">
                  {Math.round(verdictPercents[verdict])}%
                </Text>
                <Text className="font-mono text-xs text-text-disabled w-6 text-right">
                  {verdictCounts[verdict]}
                </Text>
              </View>
            ))}
          </View>

          {/* Outcomes */}
          {outcomesSet >= 2 && accuracyPercent !== null && (
            <View className="gap-2">
              <SectionHeader label={t('stats.outcomes')} />
              <View className="flex-row items-center gap-2 py-1">
                <Text className="font-mono text-xs text-text-secondary w-16">
                  {accuracyPercent}%
                </Text>
                <View className="flex-1 h-1.5 rounded-full bg-bg-surface overflow-hidden">
                  <AnimatedBar
                    targetPct={accuracyPercent}
                    delay={0}
                    duration={600}
                    className="h-full rounded-full bg-yes"
                  />
                </View>
              </View>
              <Text className="font-inter text-xs text-text-secondary">
                {t('stats.outcomesSet', { set: outcomesSet, total })}
              </Text>
            </View>
          )}

          {/* Activity */}
          <View className="gap-2">
            <SectionHeader label={t('stats.activity')} />
            {questionsByMonth.map((month, index) => (
              <View
                key={month.label}
                className="flex-row items-center gap-2 py-1"
              >
                <Text className="font-mono text-xs text-text-secondary w-16">
                  {month.label}
                </Text>
                <View className="flex-1 h-1.5 rounded-full bg-bg-surface overflow-hidden">
                  <AnimatedBar
                    targetPct={(month.count / maxMonth) * 100}
                    delay={index * 60}
                    duration={500}
                    className="h-full rounded-full bg-accent-violet"
                  />
                </View>
                <Text className="font-mono text-xs text-text-disabled w-6 text-right">
                  {month.count}
                </Text>
              </View>
            ))}
          </View>

          {/* Top topics */}
          {topCategories.length > 0 && (
            <View className="gap-2">
              <SectionHeader label={t('stats.topCategories')} />
              <View className="flex-row flex-wrap gap-2">
                {topCategories.map((cat) => (
                  <View
                    key={cat.category}
                    className="bg-bg-surface border border-border rounded-full px-3 py-1"
                  >
                    <Text className="font-inter text-xs text-text-secondary">
                      {t(`categories.${cat.category}` as const)} · {cat.count}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
        </AnimatedView>
      </SafeAreaView>
    </CosmosBackground>
  );
}
