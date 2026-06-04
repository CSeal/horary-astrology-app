// src/components/TestimonyBar.tsx
// Proportional ⊕/⊖ testimony bar for the verdict screen. Renders
// judgment.testimony_score { positive, negative, neutral } as a three-segment
// horizontal bar with count labels. Returns null when there is no testimony.

import { useTranslation } from 'react-i18next';
import { View, Text } from '@/tw';

interface TestimonyBarProps {
  score: { positive: number; negative: number; neutral: number };
}

export function TestimonyBar({ score }: TestimonyBarProps) {
  const { t } = useTranslation();
  const { positive, negative, neutral } = score;
  const total = positive + negative + neutral;

  if (total === 0) return null;

  const pct = (count: number): `${number}%` => `${(count / total) * 100}%`;

  return (
    <View className="bg-bg-card rounded-xl px-4 py-3 gap-2">
      <Text className="font-inter-semibold text-[11px] text-accent-gold uppercase tracking-[2px]">
        {t('verdict.testimonyTitle')}
      </Text>

      <View className="bg-bg-surface rounded-full">
        <View className="h-2 rounded-full overflow-hidden flex-row">
          <View className="bg-yes h-full" style={{ width: pct(positive) }} />
          <View className="bg-bg-surface h-full" style={{ width: pct(neutral) }} />
          <View className="bg-no h-full" style={{ width: pct(negative) }} />
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
