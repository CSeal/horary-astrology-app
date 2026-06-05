// src/app/(tabs)/stats.tsx
// Statistics screen — shows verdict distribution, outcome accuracy,
// activity by month, streak, and top topics.

import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, View, Text } from '@/tw';
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

  if (stats === null) {
    return (
      <CosmosBackground>
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="px-5 pt-2 pb-4">
            <Text className="font-cormorant-medium text-xl text-text-primary">
              {t('stats.title')}
            </Text>
          </View>
          <View className="flex-1 items-center justify-center px-5 gap-3">
            <Text className="text-accent-gold text-2xl">✦</Text>
            <Text className="font-inter text-sm text-text-secondary text-center">
              {t('stats.noData')}
            </Text>
          </View>
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

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-10 gap-6"
        >
          {/* Summary card */}
          <View className="flex-row bg-bg-card border border-border rounded-xl px-4 py-4">
            <View className="flex-1 items-center">
              <Text className="font-cormorant-bold text-2xl text-accent-gold">
                {total}
              </Text>
              <Text className="font-inter text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">
                {t('stats.totalQuestions', { count: total })}
              </Text>
            </View>

            {currentStreak > 0 && (
              <View className="flex-1 items-center">
                <Text className="font-cormorant-bold text-2xl text-accent-gold">
                  🔥 {currentStreak}
                </Text>
                <Text className="font-inter text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">
                  {t('stats.streakLabel')}
                </Text>
              </View>
            )}

            {accuracyPercent !== null && (
              <View className="flex-1 items-center">
                <Text className="font-cormorant-bold text-2xl text-accent-gold">
                  {accuracyPercent}%
                </Text>
                <Text className="font-inter text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">
                  {t('stats.accuracyLabel')}
                </Text>
              </View>
            )}
          </View>

          {/* Verdicts */}
          <View className="gap-2">
            <SectionHeader label={t('stats.verdicts')} />
            {DIST_VERDICTS.filter(
              (v) => v !== 'MAYBE' || verdictCounts[v] > 0
            ).map((verdict) => (
              <View
                key={verdict}
                className="flex-row items-center gap-2 py-1"
              >
                <Text className="font-mono text-xs text-text-secondary w-16">
                  {t(`verdictTypes.${verdict}` as const)}
                </Text>
                <View className="flex-1 h-1.5 rounded-full bg-bg-surface overflow-hidden">
                  <View
                    className={`h-full rounded-full ${VERDICT_BAR_CLASS[verdict]}`}
                    style={{ width: `${verdictPercents[verdict]}%` }}
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
                  <View
                    className="h-full rounded-full bg-yes"
                    style={{ width: `${accuracyPercent}%` }}
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
            {questionsByMonth.map((month) => (
              <View
                key={month.label}
                className="flex-row items-center gap-2 py-1"
              >
                <Text className="font-mono text-xs text-text-secondary w-16">
                  {month.label}
                </Text>
                <View className="flex-1 h-1.5 rounded-full bg-bg-surface overflow-hidden">
                  <View
                    className="h-full rounded-full bg-accent-violet"
                    style={{ width: `${(month.count / maxMonth) * 100}%` }}
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
      </SafeAreaView>
    </CosmosBackground>
  );
}
