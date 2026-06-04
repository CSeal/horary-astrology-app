// src/components/TimingBlock.tsx
// Full timing detail: large estimate, the engine's explanation, and a
// days→weeks→months scale bar with a marker at the estimated unit.

import type { DimensionValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import { View, Text } from '@/tw';
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
  const markerLeft = `${timingScalePosition(timing.time_unit) * 100}%` as DimensionValue;

  return (
    <View className="bg-bg-card rounded-xl px-4 pt-4 pb-5">
      <Text className="font-cormorant-bold text-3xl text-accent-gold">
        {estimate}
      </Text>

      {!!timing.explanation && (
        <Text className="font-inter text-xs text-text-secondary mt-2 leading-relaxed">
          {timing.explanation}
        </Text>
      )}

      {timing.confidence && (
        <View className="flex-row mt-2">
          <Text
            className={`font-inter-semibold text-[10px] px-2 py-0.5 rounded-full ${CONFIDENCE_PILL_CLASS[timing.confidence]}`}
          >
            {t(`verdict.timingConfidence.${timing.confidence}`)}
          </Text>
        </View>
      )}

      {!!timing.basedOn && (
        <Text className="font-mono text-[10px] text-text-secondary mt-1">
          {t('verdict.timingBasedOn', { text: timing.basedOn })}
        </Text>
      )}

      <View className="mt-4">
        <View className="h-1.5 rounded-full bg-bg-surface my-2">
          <View
            className="absolute w-3 h-3 rounded-full bg-accent-gold"
            style={{ left: markerLeft, top: 3, marginLeft: -6 }}
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
