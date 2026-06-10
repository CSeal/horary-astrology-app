// src/app/(tabs)/journal.tsx
// Journal screen — entries grouped by month, newest first.
// Tap entry → /result/[id]. Long-press → delete confirmation (Alert).

import { useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Sparkles } from 'lucide-react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';
import { SafeAreaView, ScrollView, View, Text, AnimatedView } from '@/tw';
import { CosmosBackground } from '@/components/CosmosBackground';
import { JournalItem } from '@/components/JournalItem';
import { StreakBadge } from '@/components/StreakBadge';
import { Button } from '@/components/ui/Button';
import { useJournal } from '@/hooks/useJournal';
import { useStreak } from '@/hooks/useStreak';
import { useQuestionsStore } from '@/stores/questionsStore';
import { colors, typography } from '@/constants/theme';
import type { JournalEntry } from '@/types/journal';
import type { SupportedLocale } from '@/constants/config';

const DATE_LOCALE_MAP: Record<SupportedLocale, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  uk: 'uk-UA',
  de: 'de-DE',
  fr: 'fr-FR',
  pt: 'pt-BR',
  es: 'es-ES',
};

interface MonthGroup {
  label: string;
  entries: JournalEntry[];
}

function groupByMonth(entries: JournalEntry[], locale: string): MonthGroup[] {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const groups: Record<string, JournalEntry[]> = {};
  const order: string[] = [];

  for (const entry of sorted) {
    const date = new Date(entry.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!groups[key]) {
      groups[key] = [];
      order.push(key);
    }
    groups[key].push(entry);
  }

  return order.map((key) => {
    const [yearStr, monthStr] = key.split('-');
    const reference = new Date(Number(yearStr), Number(monthStr), 1);
    const label = reference
      .toLocaleDateString(DATE_LOCALE_MAP[locale as SupportedLocale] ?? 'en-US', {
        month: 'long',
        year: 'numeric',
      })
      .toUpperCase();
    return { label, entries: groups[key] };
  });
}

export default function JournalScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { entries, deleteEntry } = useJournal();
  const { current: currentStreak } = useStreak();
  const updateOutcome = useQuestionsStore((s) => s.updateOutcome);

  const groups = useMemo(
    () => groupByMonth(entries, i18n.language),
    [entries, i18n.language]
  );

  const enterOp = useSharedValue(0);
  const enterY = useSharedValue(20);
  const floatY = useSharedValue(0);

  useEffect(() => {
    if (entries.length !== 0) return;
    enterOp.value = withTiming(1, { duration: 400 });
    enterY.value = withSpring(0, { damping: 12, stiffness: 90 });
    floatY.value = withDelay(400, withRepeat(withTiming(-8, { duration: 2000 }), -1, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enterStyle = useAnimatedStyle(() => ({
    opacity: enterOp.value,
    transform: [{ translateY: enterY.value }],
  }));
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: floatY.value }] }));

  if (entries.length === 0) {
    return (
      <CosmosBackground>
        <SafeAreaView className="flex-1" edges={['top']}>
          <AnimatedView style={enterStyle} className="flex-1 items-center justify-center px-5 gap-6">
            <AnimatedView style={floatStyle}>
              <Sparkles color={colors.accentGold} size={typography['2xl']} />
            </AnimatedView>
            <View className="items-center gap-2">
              <Text className="font-cormorant-medium text-2xl text-text-primary text-center">
                {t('journal.emptyTitle')}
              </Text>
              <Text className="font-inter text-sm text-text-secondary text-center">
                {t('journal.emptySubtitle')}
              </Text>
            </View>
            <View className="w-full max-w-xs">
              <Button
                label={t('journal.emptyButton')}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/');
                }}
              />
            </View>
          </AnimatedView>
        </SafeAreaView>
      </CosmosBackground>
    );
  }

  return (
    <CosmosBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
          <Text className="font-cormorant-medium text-2xl text-text-primary">
            {t('journal.title')}
          </Text>
          <StreakBadge streak={currentStreak} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 gap-6"
          removeClippedSubviews
        >
          {(() => {
            let runningIndex = 0;
            return groups.map((group) => (
              <View key={group.label} className="gap-3">
                <Text className="font-inter-semibold text-xs text-accent-gold tracking-widest">
                  {group.label}
                </Text>
                <View className="gap-3">
                  {group.entries.map((entry) => {
                    const itemIndex = runningIndex++;
                    return (
                      <JournalItem
                        key={entry.id}
                        entry={entry}
                        index={itemIndex}
                        onPress={() => router.push(`/result/${entry.id}`)}
                        onDelete={() => {
                          void deleteEntry(entry.id);
                        }}
                        outcome={entry.outcome}
                        onOutcome={(oc) => {
                          void updateOutcome(entry.id, oc);
                        }}
                      />
                    );
                  })}
                </View>
              </View>
            ));
          })()}
        </ScrollView>
      </SafeAreaView>
    </CosmosBackground>
  );
}
