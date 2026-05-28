// src/components/JournalItem.tsx
// Journal entry card with left-border verdict color and swipe-to-delete.
// Rises in from below with a stagger driven by the `index` prop.

import { useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { RectButton } from 'react-native-gesture-handler';
import { Trash2 } from 'lucide-react-native';
import { AnimatedView, TouchableOpacity, View, Text } from '@/tw';
import { useTranslation } from 'react-i18next';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { VerdictBadge } from '@/components/ui/Badge';
import { colors } from '@/constants/theme';
import type { JournalEntry } from '@/types/journal';

interface JournalItemProps {
  entry: JournalEntry;
  onPress: () => void;
  onDelete: () => void;
  index?: number;
}

const VERDICT_BORDER_CLASS: Record<JournalEntry['verdict'], string> = {
  YES: 'border-l-yes',
  NO: 'border-l-no',
  MAYBE: 'border-l-maybe',
  UNCLEAR: 'border-l-unclear',
};

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function JournalItem({
  entry,
  onPress,
  onDelete,
  index = 0,
}: JournalItemProps) {
  const { t, i18n } = useTranslation();
  const date = formatDate(entry.timestamp, i18n.language);
  const swipeableRef = useRef<SwipeableMethods>(null);

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

  const confirmDelete = () => {
    Alert.alert(
      t('journal.deleteConfirmTitle'),
      t('journal.deleteConfirmMessage'),
      [
        {
          text: t('journal.deleteCancel'),
          style: 'cancel',
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: t('journal.deleteConfirm'),
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  const renderRightActions = () => (
    <RectButton
      onPress={confirmDelete}
      style={{
        backgroundColor: colors.no,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
      }}
    >
      <Trash2 color={colors.textPrimary} size={22} />
    </RectButton>
  );

  return (
    <AnimatedView style={entranceStyle}>
      <ReanimatedSwipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        <TouchableOpacity
          onPress={onPress}
          className={`bg-bg-surface rounded-xl p-4 border-l-4 ${VERDICT_BORDER_CLASS[entry.verdict]}`}
          accessibilityLabel={t('a11y.journalEntry', {
            verdict: entry.verdict,
            question: entry.question,
            date,
          })}
          accessibilityRole="button"
        >
          <View className="flex-row items-center justify-between mb-2">
            <VerdictBadge verdict={entry.verdict} size="sm" />
            <Text className="font-inter text-xs text-text-secondary">{date}</Text>
          </View>

          <Text
            className="font-inter text-base text-text-primary"
            numberOfLines={1}
          >
            {entry.question}
          </Text>

          <Text className="font-inter text-xs text-text-secondary mt-1">
            {t(`confidence.${entry.confidence_band}` as const)}
          </Text>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    </AnimatedView>
  );
}
