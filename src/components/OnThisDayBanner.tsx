// src/components/OnThisDayBanner.tsx
// "On this day, a year ago" recall banner shown on the Home screen.
// Surfaces a past journal entry, lets the user reopen it, mark its outcome,
// or dismiss it for the day.

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { View, Text, TouchableOpacity, AnimatedView } from '@/tw';
import type { JournalEntry } from '@/types/journal';

interface OnThisDayBannerProps {
  entry: JournalEntry;
  onOpen: () => void;
  onDismiss: () => void;
}

const VERDICT_PILL_CLASS: Record<JournalEntry['verdict'], string> = {
  YES: 'bg-yes/20 text-yes',
  NO: 'bg-no/20 text-no',
  MAYBE: 'bg-maybe/20 text-maybe',
  UNCLEAR: 'bg-maybe/20 text-maybe',
};

export function OnThisDayBanner({
  entry,
  onOpen,
  onDismiss,
}: OnThisDayBannerProps) {
  const { t } = useTranslation();
  const pillClass = VERDICT_PILL_CLASS[entry.verdict];
  const yearsAgo = new Date().getFullYear() - new Date(entry.timestamp).getFullYear();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);
  const floatY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, { damping: 14, stiffness: 120 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    floatY.value = withDelay(500, withRepeat(withTiming(-6, { duration: 3000 }), -1, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value + floatY.value }],
  }));

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    translateY.value = withTiming(-12, { duration: 250 });
    opacity.value = withTiming(0, { duration: 250 }, (finished) => {
      'worklet';
      if (finished) runOnJS(onDismiss)();
    });
  };

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpen();
  };

  return (
    <AnimatedView
      style={animStyle}
      className="bg-bg-card border border-border rounded-xl px-4 py-3 gap-2"
    >
      {/* Header: title + dismiss */}
      <View className="flex-row items-center justify-between">
        <Text className="font-inter-semibold text-xs text-text-secondary uppercase tracking-widest">
          📅 {t('onThisDay.title', { count: yearsAgo })}
        </Text>
        <TouchableOpacity
          onPress={handleDismiss}
          className="min-w-8 min-h-8 items-end justify-center"
          accessibilityRole="button"
          accessibilityLabel={t('onThisDay.title')}
        >
          <Text className="text-text-secondary text-lg">×</Text>
        </TouchableOpacity>
      </View>

      {/* Question */}
      <Text
        className="font-cormorant text-base text-text-primary italic"
        numberOfLines={2}
      >
        {entry.question}
      </Text>

      {/* Bottom: verdict pill + outcome · open */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <Text
            className={`rounded-full px-2 py-0.5 font-inter-semibold text-[10px] ${pillClass}`}
          >
            {t(`verdictTypes.${entry.verdict}` as const)}
          </Text>
          {entry.outcome === 'came_true' ? (
            <Text className="text-yes text-xs"> · ✓ {t('journal.outcomeCameTrue')}</Text>
          ) : entry.outcome === 'did_not_happen' ? (
            <Text className="text-no text-xs"> · ✗ {t('journal.outcomeDidNot')}</Text>
          ) : (
            <TouchableOpacity onPress={handleOpen} accessibilityRole="button">
              <Text className="text-accent-gold text-xs"> · {t('onThisDay.markOutcome')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={handleOpen}
          accessibilityRole="button"
          accessibilityLabel={t('onThisDay.open')}
        >
          <Text className="font-inter-medium text-xs text-accent-gold">
            {t('onThisDay.open')}
          </Text>
        </TouchableOpacity>
      </View>
    </AnimatedView>
  );
}
