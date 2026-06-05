// src/components/StreakBadge.tsx
// Inline streak indicator — fire emoji + day count. Renders nothing at 0.
// No container background; meant to be embedded next to a title.

import { useTranslation } from 'react-i18next';
import { View, Text } from '@/tw';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const { t } = useTranslation();

  if (streak === 0) return null;

  const label = t('streak.badge', { count: streak });
  return (
    <View className="flex-row items-center gap-1">
      <Text className="font-inter-medium text-sm text-accent-gold">{label}</Text>
    </View>
  );
}
