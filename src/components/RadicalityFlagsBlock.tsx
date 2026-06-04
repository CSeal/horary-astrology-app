// src/components/RadicalityFlagsBlock.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity } from '@/tw';

interface RadicalityFlag {
  name: string;
  severity: 'severe' | 'moderate' | 'mild';
  message: string;
}

interface RadicalityFlagsBlockProps {
  flags: RadicalityFlag[];
}

const PREVIEW_COUNT = 2;

const SEVERITY_BADGE_CLASS: Record<RadicalityFlag['severity'], string> = {
  severe: 'bg-no/20',
  moderate: 'bg-maybe/20',
  mild: 'bg-bg-surface',
};

const SEVERITY_TEXT_CLASS: Record<RadicalityFlag['severity'], string> = {
  severe: 'text-no',
  moderate: 'text-maybe',
  mild: 'text-text-secondary',
};

export function RadicalityFlagsBlock({ flags }: RadicalityFlagsBlockProps) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  if (flags.length === 0) {
    return null;
  }

  const visibleFlags = showAll ? flags : flags.slice(0, PREVIEW_COUNT);
  const hasMore = flags.length > PREVIEW_COUNT;

  return (
    <View className="bg-bg-card rounded-xl px-4 py-3 gap-2">
      {visibleFlags.map((flag, idx) => (
        <View key={`${idx}-${flag.name}`} className="flex-row items-center gap-2">
          <Text className="flex-1 font-inter text-sm text-text-primary">
            {`⚠ ${flag.message}`}
          </Text>
          <View className={`rounded-full px-2 py-0.5 ${SEVERITY_BADGE_CLASS[flag.severity]}`}>
            <Text
              className={`font-inter-semibold text-[10px] uppercase ${SEVERITY_TEXT_CLASS[flag.severity]}`}
            >
              {t(`verdict.radicalitySeverity.${flag.severity}`)}
            </Text>
          </View>
        </View>
      ))}

      {hasMore && (
        <TouchableOpacity
          onPress={() => setShowAll((v) => !v)}
          activeOpacity={0.85}
          accessibilityRole="button"
          className="items-center py-2"
        >
          <Text className="font-inter-medium text-[12px] text-accent-gold">
            {showAll
              ? t('verdict.radicalityShowFewer')
              : t('verdict.radicalityShowAll', { count: flags.length })}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
