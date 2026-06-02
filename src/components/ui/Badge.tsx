// src/components/ui/Badge.tsx
// Verdict badge (YES/NO/MAYBE/UNCLEAR) and confidence badge.
// Colors reference theme.ts via NativeWind — no inline hex.
// Import View/Text from '@/tw' (NOT react-native) for className support.

import { View, Text } from '@/tw';
import { useTranslation } from 'react-i18next';
import type { VerdictType, ConfidenceBand } from '@/types/horary';

interface VerdictBadgeProps {
  verdict: VerdictType;
  size?: 'sm' | 'lg';
}

const VERDICT_CLASSES: Record<VerdictType, string> = {
  YES: 'bg-yes',
  NO: 'bg-no',
  MAYBE: 'bg-maybe',
  UNCLEAR: 'bg-unclear',
};

export function VerdictBadge({ verdict, size = 'sm' }: VerdictBadgeProps) {
  const { t } = useTranslation();
  const sizeClass = size === 'lg' ? 'px-4 py-2' : 'px-2.5 py-1';
  const textClass =
    size === 'lg' ? 'text-xl font-inter-semibold' : 'text-xs font-inter-semibold';

  return (
    <View className={`${VERDICT_CLASSES[verdict]} ${sizeClass} rounded-full`}>
      <Text className={`${textClass} text-text-inverse`}>
        {t(`verdictTypes.${verdict}` as const)}
      </Text>
    </View>
  );
}

interface ConfidenceBadgeProps {
  confidence: ConfidenceBand;
}

const CONFIDENCE_DOTS: Record<ConfidenceBand, number> = {
  high: 5,
  medium: 3,
  low: 1,
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const filled = CONFIDENCE_DOTS[confidence];

  return (
    <View className="flex-row items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${
            i < filled ? 'bg-accent-gold' : 'bg-bg-card'
          }`}
        />
      ))}
      <Text className="text-xs font-inter-medium text-text-secondary ml-1">
        {confidence.toUpperCase()}
      </Text>
    </View>
  );
}
