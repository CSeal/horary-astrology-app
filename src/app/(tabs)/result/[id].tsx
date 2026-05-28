// src/app/(tabs)/result/[id].tsx
// Verdict detail screen — reads journal entry by id from questionsStore.
// Renders VerdictCard, SignificatorRow list, void-of-course note, location/timestamp.
// Content cascades in with a celestial rise: question → verdict → header → rows.

import { useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Info, MapPin } from 'lucide-react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { AnimatedView, ScrollView, TouchableOpacity, View, Text } from '@/tw';
import { CosmosBackground } from '@/components/CosmosBackground';
import { VerdictCard } from '@/components/VerdictCard';
import { SignificatorRow } from '@/components/SignificatorRow';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { useJournal } from '@/hooks/useJournal';
import { colors, typography } from '@/constants/theme';

function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { getEntryById } = useJournal();

  const entry = getEntryById(id ?? '');

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  // ── Entrance animation values (single useEffect owns them all) ──
  const navY = useSharedValue(20);
  const navOp = useSharedValue(0);
  const questionY = useSharedValue(20);
  const questionOp = useSharedValue(0);
  const verdictY = useSharedValue(20);
  const verdictOp = useSharedValue(0);
  const headerY = useSharedValue(20);
  const headerOp = useSharedValue(0);
  const footerY = useSharedValue(20);
  const footerOp = useSharedValue(0);

  useEffect(() => {
    if (!entry) return;
    const spring = { damping: 12, stiffness: 90 };
    const fade = { duration: 350 };

    navY.value = withSpring(0, spring);
    navOp.value = withTiming(1, fade);

    questionY.value = withDelay(60, withSpring(0, spring));
    questionOp.value = withDelay(60, withTiming(1, fade));

    verdictY.value = withDelay(140, withSpring(0, spring));
    verdictOp.value = withDelay(140, withTiming(1, fade));

    headerY.value = withDelay(220, withSpring(0, spring));
    headerOp.value = withDelay(220, withTiming(1, fade));

    const footerDelay =
      300 + Math.min((entry.significators?.length ?? 0) * 60, 400);
    footerY.value = withDelay(footerDelay, withSpring(0, spring));
    footerOp.value = withDelay(footerDelay, withTiming(1, fade));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id]);

  const navStyle = useAnimatedStyle(() => ({
    opacity: navOp.value,
    transform: [{ translateY: navY.value }],
  }));
  const questionStyle = useAnimatedStyle(() => ({
    opacity: questionOp.value,
    transform: [{ translateY: questionY.value }],
  }));
  const verdictStyle = useAnimatedStyle(() => ({
    opacity: verdictOp.value,
    transform: [{ translateY: verdictY.value }],
  }));
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value,
    transform: [{ translateY: headerY.value }],
  }));
  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOp.value,
    transform: [{ translateY: footerY.value }],
  }));

  if (!entry) {
    return (
      <CosmosBackground>
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="flex-1 items-center justify-center px-5 gap-4">
            <Text className="font-inter text-base text-text-primary text-center">
              {t('errors.apiError')}
            </Text>
            <Button label={t('verdict.backButton')} onPress={handleBack} />
          </View>
        </SafeAreaView>
      </CosmosBackground>
    );
  }

  const dateTime = formatDateTime(entry.timestamp, i18n.language);
  const rowBaseDelay = 240;

  return (
    <CosmosBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        <AnimatedView style={navStyle} className="flex-row items-center px-5 py-3">
          <TouchableOpacity
            onPress={handleBack}
            className="min-w-11 min-h-11 items-center justify-center -ml-2"
            accessibilityLabel={t('a11y.backButton')}
            accessibilityRole="button"
          >
            <ArrowLeft color={colors.textPrimary} size={typography.xl} />
          </TouchableOpacity>
          <Text className="font-inter-medium text-base text-text-primary ml-2">
            {t('verdict.backButton')}
          </Text>
        </AnimatedView>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 gap-5"
        >
          <AnimatedView style={questionStyle}>
            <Text className="font-cormorant text-base text-text-secondary italic">
              {`"${entry.question}"`}
            </Text>
          </AnimatedView>

          <AnimatedView style={verdictStyle}>
            <VerdictCard
              verdict={entry.verdict}
              confidence={entry.confidence_band}
              summary={entry.summary}
            />
          </AnimatedView>

          {entry.voc_moon && (
            <View className="flex-row items-start gap-2">
              <Info color={colors.maybe} size={typography.base} />
              <View className="flex-1">
                <Banner message={t('verdict.vocNote')} type="warning" />
              </View>
            </View>
          )}

          {entry.confidence_band === 'low' && (
            <Banner message={t('verdict.lowConfidenceNote')} type="warning" />
          )}

          <AnimatedView style={headerStyle}>
            <Text className="font-inter-semibold text-xs text-accent-gold uppercase tracking-wider mt-2">
              {t('verdict.significatorsHeader')}
            </Text>
          </AnimatedView>

          <View className="gap-2">
            {entry.significators.map((sig, idx) => (
              <SignificatorRow
                key={`${sig.planet}-${idx}`}
                data={sig}
                index={idx + Math.floor(rowBaseDelay / 60)}
              />
            ))}
          </View>

          <AnimatedView style={footerStyle} className="gap-1 mt-4">
            <View className="flex-row items-center gap-2">
              <MapPin color={colors.textSecondary} size={typography.sm} />
              <Text className="font-inter text-xs text-text-secondary">
                {entry.city ?? '—'}
              </Text>
            </View>
            <Text className="font-inter text-xs text-text-secondary">
              {dateTime}
            </Text>
          </AnimatedView>
        </ScrollView>
      </SafeAreaView>
    </CosmosBackground>
  );
}
