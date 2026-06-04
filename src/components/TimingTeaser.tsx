// src/components/TimingTeaser.tsx
// Screen-1 hook for the timing detail: gold clock + "When might this happen?" +
// the estimate + chevron. Tapping it pushes the full-reading screen.

import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity } from '@/tw';
import { Clock, ChevronRight } from 'lucide-react-native';
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

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${t('verdict.timingWhen')} ${estimate}`}
      className="flex-row items-center gap-3 bg-accent-gold/10 border border-border-focus rounded-xl px-4 py-3"
    >
      <View className="w-10 h-10 rounded-full bg-accent-gold/10 items-center justify-center">
        <Clock color={colors.accentGold} size={typography.lg} />
      </View>
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
  );
}
