// src/components/JournalItem.tsx
// Journal entry card with left-border verdict color and swipe-to-delete.
// Rises in from below with a stagger driven by the `index` prop.

import { useRef, useEffect } from 'react';
import { Alert, Dimensions } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { RectButton } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Trash2 } from 'lucide-react-native';
import { AnimatedView, TouchableOpacity, View, Text } from '@/tw';
import { useTranslation } from 'react-i18next';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { VerdictBadge } from '@/components/ui/Badge';
import { colors } from '@/constants/theme';
import { DATE_LOCALE_MAP, type SupportedLocale } from '@/constants/config';
import type { JournalEntry } from '@/types/journal';

interface JournalItemProps {
  entry: JournalEntry;
  onPress: () => void;
  onDelete: () => void;
  index?: number;
  outcome?: JournalEntry['outcome'];
  onOutcome?: (outcome: JournalEntry['outcome']) => void;
}

const VERDICT_BORDER_CLASS: Record<JournalEntry['verdict'], string> = {
  YES: 'border-l-yes',
  NO: 'border-l-no',
  MAYBE: 'border-l-maybe',
  UNCLEAR: 'border-l-unclear',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(
    DATE_LOCALE_MAP[locale as SupportedLocale] ?? 'en-US',
    { month: 'short', day: 'numeric' }
  );
}

type OutcomeValue = NonNullable<JournalEntry['outcome']>;

type OutcomeButtonConfig = { value: OutcomeValue; labelKey: string; activeClass: string };

const OUTCOME_BUTTONS: OutcomeButtonConfig[] = [
  {
    value: 'came_true',
    labelKey: 'journal.outcomeCameTrue',
    activeClass: 'text-yes-green',
  },
  {
    value: 'did_not_happen',
    labelKey: 'journal.outcomeDidNot',
    activeClass: 'text-no-red',
  },
  {
    value: 'pending',
    labelKey: 'journal.outcomePending',
    activeClass: 'text-accent-gold',
  },
];

// Haptic feedback per outcome — success buzz for came_true, medium for did_not,
// light for pending. Fires on selection (not on deselection of an active button).
function fireOutcomeHaptic(value: OutcomeValue) {
  if (value === 'came_true') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else if (value === 'did_not_happen') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

interface OutcomeButtonProps {
  label: string;
  active: boolean;
  activeClass: string;
  accessibilityLabel: string;
  onPress: () => void;
}

function OutcomeButton({
  label,
  active,
  activeClass,
  accessibilityLabel,
  onPress,
}: OutcomeButtonProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handlePressIn = () => {
    scale.value = withSpring(0.93, { damping: 14, stiffness: 200 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 90 });
  };
  return (
    <AnimatedView style={animStyle} className="flex-1">
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`py-1.5 rounded-lg items-center border ${
          active
            ? 'border-transparent bg-white/10'
            : 'border-white/10 bg-transparent'
        }`}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: active }}
      >
        <Text
          className={`font-inter text-xs ${active ? activeClass : 'text-text-disabled'}`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </AnimatedView>
  );
}

export function JournalItem({
  entry,
  onPress,
  onDelete,
  index = 0,
  outcome,
  onOutcome,
}: JournalItemProps) {
  const { t, i18n } = useTranslation();
  const date = formatDate(entry.timestamp, i18n.language);
  const swipeableRef = useRef<SwipeableMethods>(null);

  const delay = Math.min(index * 60, 400);
  // Items beyond the initial viewport don't need an entrance animation —
  // they're off-screen on mount so animating them wastes UI-thread work.
  const shouldAnimate = index <= 8;
  const enterY = useSharedValue(shouldAnimate ? 20 : 0);
  const enterOpacity = useSharedValue(shouldAnimate ? 0 : 1);
  const exitX = useSharedValue(0);
  const exitOp = useSharedValue(1);

  useEffect(() => {
    if (!shouldAnimate) return;
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

  const exitStyle = useAnimatedStyle(() => ({
    opacity: exitOp.value,
    transform: [{ translateX: exitX.value }],
  }));

  const handleDelete = () => {
    exitX.value = withTiming(-SCREEN_WIDTH, { duration: 250 });
    exitOp.value = withTiming(0, { duration: 200 }, (finished) => {
      'worklet';
      if (finished) runOnJS(onDelete)();
    });
  };

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
          onPress: handleDelete,
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
    <AnimatedView style={[entranceStyle, exitStyle]}>
      <ReanimatedSwipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
        onSwipeableWillOpen={() =>
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }
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

          <View className="flex-row gap-2 mt-3">
            {OUTCOME_BUTTONS.map((btn) => {
              const isActive = outcome === btn.value;
              const label = t(btn.labelKey as Parameters<typeof t>[0]);
              return (
                <OutcomeButton
                  key={btn.value}
                  label={label}
                  active={isActive}
                  activeClass={btn.activeClass}
                  accessibilityLabel={label}
                  onPress={() => {
                    // Selecting an outcome fires haptic; deselecting (tapping the
                    // already-active button) clears it without a buzz.
                    if (!isActive) fireOutcomeHaptic(btn.value);
                    onOutcome?.(isActive ? null : btn.value);
                  }}
                />
              );
            })}
          </View>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    </AnimatedView>
  );
}
