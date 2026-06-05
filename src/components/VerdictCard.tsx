// src/components/VerdictCard.tsx
// Large verdict display: badge + confidence dots + summary.
// Entry animation: scale 0.8→1.0 + opacity 0→1 spring (Reanimated).
// Haptic feedback on mount (notificationAsync: SUCCESS/WARNING/NONE).
// No StyleSheet, no inline hex (only animated transforms via useAnimatedStyle).

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { AnimatedView, View, Text } from '@/tw';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import type { VerdictType, ConfidenceBand } from '@/types/horary';
import { colors } from '@/constants/theme';

interface VerdictCardProps {
  verdict: VerdictType;
  confidence: ConfidenceBand;
  summary: string;
  // When true, render the compact badge (verdict + confidence dots) only and
  // omit the summary text — the summary is shown separately on the screen.
  hideSummary?: boolean;
}

const VERDICT_COLOR: Record<VerdictType, string> = {
  YES: colors.yes,
  NO: colors.no,
  MAYBE: colors.maybe,
  UNCLEAR: colors.unclear,
};

const VERDICT_GLOW_BG: Record<VerdictType, string> = {
  YES: 'bg-yes/10',
  NO: 'bg-no/10',
  MAYBE: 'bg-maybe/10',
  UNCLEAR: 'bg-unclear/10',
};

const VERDICT_BORDER: Record<VerdictType, string> = {
  YES: 'border-yes/30',
  NO: 'border-no/30',
  MAYBE: 'border-maybe/30',
  UNCLEAR: 'border-unclear/30',
};

const VERDICT_TEXT: Record<VerdictType, string> = {
  YES: 'text-yes',
  NO: 'text-no',
  MAYBE: 'text-maybe',
  UNCLEAR: 'text-unclear',
};

const CONFIDENCE_FILLED: Record<ConfidenceBand, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

// Confidence dot that pops in (scale 0 → 1.1 → 1, opacity 0 → 1), staggered by
// index. Base delay lets the card's mount scale settle before the dots appear.
function StaggerDot({ index, color }: { index: number; color: string }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = 400 + index * 80;
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.1, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 140 })
      )
    );
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedView
      style={[
        style,
        { width: 10, height: 10, borderRadius: 5, backgroundColor: color },
      ]}
    />
  );
}

export function VerdictCard({
  verdict,
  confidence,
  summary,
  hideSummary = false,
}: VerdictCardProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 400 });

    if (verdict === 'YES' || verdict === 'MAYBE') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {
          /* haptics may be unavailable */
        }
      );
    } else if (verdict === 'NO') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {
          /* haptics may be unavailable */
        }
      );
    }
  }, [verdict, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const filled = CONFIDENCE_FILLED[confidence];
  const verdictLabel = t(`verdictTypes.${verdict}` as const);

  return (
    <AnimatedView
      style={animatedStyle}
      className={`rounded-3xl border items-center ${hideSummary ? 'px-6 pt-6 pb-5' : 'p-8'} ${VERDICT_GLOW_BG[verdict]} ${VERDICT_BORDER[verdict]}`}
      accessibilityLabel={t('a11y.verdictCard', {
        verdict: verdictLabel,
        confidence: t(`confidence.${confidence}` as const),
      })}
    >
      <Text
        className={`font-cormorant-bold text-5xl ${VERDICT_TEXT[verdict]}`}
        style={{ color: VERDICT_COLOR[verdict] }}
      >
        {verdictLabel}
      </Text>

      <View className="flex-row items-center gap-1.5 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StaggerDot
            key={i}
            index={i}
            color={i < filled ? VERDICT_COLOR[verdict] : colors.bgCard}
          />
        ))}
        <Text
          className="font-inter-medium text-xs ml-2"
          style={{ color: VERDICT_COLOR[verdict] }}
        >
          {t(`confidence.${confidence}` as const)}
        </Text>
      </View>

      {!hideSummary && (
        <Text className="font-cormorant text-base text-text-primary leading-relaxed mt-6 text-center">
          {summary}
        </Text>
      )}
    </AnimatedView>
  );
}
