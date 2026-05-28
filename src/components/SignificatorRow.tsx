// src/components/SignificatorRow.tsx
// Compact row: planet glyph + name + role + sign/house + dignity + retrograde.
// Mount rises in from below with stagger driven by the `index` prop.

import { useEffect } from 'react';
import { AnimatedView, View, Text } from '@/tw';
import { useTranslation } from 'react-i18next';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import type { SignificatorData } from '../types/horary';
import { PLANET_GLYPHS, PLANET_ROLES } from '../constants/planets';

interface SignificatorRowProps {
  data: SignificatorData;
  index?: number;
}

const DIGNITY_BADGE_CLASS: Record<string, string> = {
  domicile: 'bg-accent-gold',
  exaltation: 'bg-accent-gold',
  detriment: 'bg-no',
  fall: 'bg-no',
};

export function SignificatorRow({ data, index = 0 }: SignificatorRowProps) {
  const { t } = useTranslation();
  const glyph = PLANET_GLYPHS[data.planet] ?? data.planet.slice(0, 2);
  const roleLabel = PLANET_ROLES[data.role] ?? data.role;
  const showDignityBadge = data.dignity !== null && data.dignity !== 'peregrine';

  const delay = Math.min(index * 60, 400);
  const enterY = useSharedValue(20);
  const enterOpacity = useSharedValue(0);

  useEffect(() => {
    enterY.value = withDelay(
      delay,
      withSpring(0, { damping: 12, stiffness: 90 })
    );
    enterOpacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
    transform: [{ translateY: enterY.value }],
  }));

  return (
    <AnimatedView
      style={entranceStyle}
      className="flex-row items-center bg-bg-card rounded-xl px-4 py-3 gap-3"
      accessibilityRole="text"
    >
      <Text className="text-accent-violet text-2xl w-7">{glyph}</Text>

      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="font-inter-medium text-base text-text-primary">
            {data.planet}
          </Text>
          {data.retrograde && (
            <Text className="font-inter text-sm text-no ml-1">{' ℞'}</Text>
          )}
        </View>
        <Text className="font-inter text-xs text-text-secondary italic">
          {roleLabel}
        </Text>
      </View>

      <View className="items-end">
        <Text className="font-inter text-sm text-text-secondary">
          {data.sign}
        </Text>
        <Text className="font-inter text-xs text-text-secondary">
          {`H${data.house}`}
        </Text>
      </View>

      {showDignityBadge && data.dignity && (
        <View
          className={`px-2 py-1 rounded-full ${DIGNITY_BADGE_CLASS[data.dignity] ?? 'bg-bg-surface'}`}
        >
          <Text className="font-inter-semibold text-[10px] text-text-inverse">
            {t(`dignity.${data.dignity}` as const, {
              defaultValue: data.dignity,
            })}
          </Text>
        </View>
      )}
    </AnimatedView>
  );
}
