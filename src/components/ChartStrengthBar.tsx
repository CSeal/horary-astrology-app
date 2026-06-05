// src/components/ChartStrengthBar.tsx
// Radicality / chart-strength meter: label + score, a coloured fill bar, and a
// one-line note. Band (yes/maybe/no) derives from the 0-100 score; a chart the
// engine flagged non-radical is always shown as weak.

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { View, Text, AnimatedView } from '@/tw';
import { colors } from '@/constants/theme';

interface ChartStrengthBarProps {
  score: number;
  isRadical?: boolean;
}

type Band = 'yes' | 'maybe' | 'no';

function bandForScore(score: number, isRadical?: boolean): Band {
  if (isRadical === false) return 'no';
  if (score >= 70) return 'yes';
  if (score >= 45) return 'maybe';
  return 'no';
}

const BAND_COLOR: Record<Band, string> = {
  yes: colors.yes,
  maybe: colors.maybe,
  no: colors.no,
};

const BAND_NOTE_KEY: Record<Band, string> = {
  yes: 'verdict.chartStrengthStrong',
  maybe: 'verdict.chartStrengthBorderline',
  no: 'verdict.chartStrengthWeak',
};

export function ChartStrengthBar({ score, isRadical }: ChartStrengthBarProps) {
  const { t } = useTranslation();
  const band = bandForScore(score, isRadical);
  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(clamped, {
      duration: 700,
      easing: Easing.out(Easing.ease),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  return (
    <View>
      <View className="flex-row items-baseline justify-between mb-2">
        <Text className="font-inter-semibold text-[11px] text-text-secondary uppercase tracking-widest">
          {t('verdict.chartStrengthLabel')}
        </Text>
        <Text className="font-mono text-sm">
          <Text
            className="font-inter-semibold text-sm"
            style={{ color: BAND_COLOR[band] }}
          >
            {clamped}
          </Text>
          <Text className="font-mono text-sm text-text-disabled"> / 100</Text>
        </Text>
      </View>

      <View className="h-2 rounded-full bg-bg-surface overflow-hidden">
        <AnimatedView
          className="h-full rounded-full"
          style={[fillStyle, { backgroundColor: BAND_COLOR[band] }]}
        />
      </View>

      <Text className="font-inter text-[11px] text-text-secondary mt-2 leading-relaxed">
        {t(BAND_NOTE_KEY[band])}
      </Text>
    </View>
  );
}
