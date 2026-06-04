// src/app/(tabs)/journal.tsx
// Journal screen — entries grouped by month, newest first.
// Tap entry → /result/[id]. Long-press → delete confirmation (Alert).

import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react-native';
import { SafeAreaView, ScrollView, View, Text } from '@/tw';
import { CosmosBackground } from '@/components/CosmosBackground';
import { JournalItem } from '@/components/JournalItem';
import { Button } from '@/components/ui/Button';
import { useJournal } from '@/hooks/useJournal';
import { useQuestionsStore } from '@/stores/questionsStore';
import { colors, typography } from '@/constants/theme';
import type { JournalEntry } from '@/types/journal';
import type { SupportedLocale } from '@/constants/config';

const DATE_LOCALE_MAP: Record<SupportedLocale, string> = {
  en: 'en-US',
  ru: 'ru-RU',
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
  const updateOutcome = useQuestionsStore((s) => s.updateOutcome);

  const groups = useMemo(
    () => groupByMonth(entries, i18n.language),
    [entries, i18n.language]
  );

  if (entries.length === 0) {
    return (
      <CosmosBackground>
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="flex-1 items-center justify-center px-5 gap-6">
            <Sparkles color={colors.accentGold} size={typography['2xl']} />
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
                onPress={() => router.push('/')}
              />
            </View>
          </View>
        </SafeAreaView>
      </CosmosBackground>
    );
  }

  return (
    <CosmosBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="px-5 pt-2 pb-4">
          <Text className="font-cormorant-medium text-2xl text-text-primary">
            {t('journal.title')}
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 gap-6"
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
