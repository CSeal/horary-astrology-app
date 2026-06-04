// src/app/(tabs)/result/[id]/index.tsx
// Verdict screen (Phase 1.5, layout C+). Compact verdict badge + chart strength
// + void-of-course detail + AI summary, with a timing teaser and a CTA that
// pushes the full reading (significators · perfections · timing).
// Non-radical charts swap the CTA for "ask again when ready" and drop the teaser.
// Significators live on the pushed full-reading screen, not here.

import { useCallback, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import {
  AnimatedView,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
} from '@/tw';
import { CosmosBackground } from '@/components/CosmosBackground';
import { VerdictCard } from '@/components/VerdictCard';
import { ChartStrengthBar } from '@/components/ChartStrengthBar';
import { VocMoonBanner } from '@/components/VocMoonBanner';
import { TimingTeaser } from '@/components/TimingTeaser';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { useJournal } from '@/hooks/useJournal';
import { colors, typography } from '@/constants/theme';

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { getEntryById } = useJournal();

  const entry = getEntryById(id ?? '');

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const handleViewFull = useCallback(() => {
    router.push(`/result/${id}/full` as never);
  }, [router, id]);

  // ── Entrance animation (three groups, one owning effect) ──
  const navY = useSharedValue(20);
  const navOp = useSharedValue(0);
  const bodyY = useSharedValue(20);
  const bodyOp = useSharedValue(0);
  const ctaY = useSharedValue(20);
  const ctaOp = useSharedValue(0);

  useEffect(() => {
    if (!entry) return;
    const spring = { damping: 12, stiffness: 90 };
    const fade = { duration: 350 };

    navY.value = withSpring(0, spring);
    navOp.value = withTiming(1, fade);
    bodyY.value = withDelay(80, withSpring(0, spring));
    bodyOp.value = withDelay(80, withTiming(1, fade));
    ctaY.value = withDelay(200, withSpring(0, spring));
    ctaOp.value = withDelay(200, withTiming(1, fade));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id]);

  const navStyle = useAnimatedStyle(() => ({
    opacity: navOp.value,
    transform: [{ translateY: navY.value }],
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    opacity: bodyOp.value,
    transform: [{ translateY: bodyY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOp.value,
    transform: [{ translateY: ctaY.value }],
  }));

  if (!entry) {
    return (
      <CosmosBackground>
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="flex-1 items-center justify-center px-5 gap-4">
            <Text className="font-inter text-base text-text-primary text-center">
              {t('errors.apiError')}
            </Text>
            <Button label={t('verdict.backJournal')} onPress={handleBack} />
          </View>
        </SafeAreaView>
      </CosmosBackground>
    );
  }

  const notRadical = entry.is_radical === false;

  return (
    <CosmosBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Nav: ← Journal */}
        <AnimatedView style={navStyle} className="flex-row items-center px-5 py-3">
          <TouchableOpacity
            onPress={handleBack}
            className="min-w-11 min-h-11 flex-row items-center -ml-2 pr-2"
            accessibilityLabel={t('verdict.backJournal')}
            accessibilityRole="button"
          >
            <ArrowLeft color={colors.textSecondary} size={typography.xl} />
            <Text className="font-inter-medium text-base text-text-secondary ml-1">
              {t('verdict.backJournal')}
            </Text>
          </TouchableOpacity>
        </AnimatedView>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-4 gap-3.5"
        >
          <AnimatedView style={bodyStyle} className="gap-3.5">
            <Text className="font-cormorant text-base text-text-secondary italic">
              {`"${entry.question}"`}
            </Text>

            <VerdictCard
              verdict={entry.verdict}
              confidence={entry.confidence_band}
              summary={entry.summary}
              hideSummary
            />

            {entry.radicality_score !== undefined && (
              <ChartStrengthBar
                score={entry.radicality_score}
                isRadical={entry.is_radical}
              />
            )}

            {notRadical && (
              <Banner
                message={entry.radicality_summary ?? t('verdict.radicalityNote')}
                type="warning"
              />
            )}

            {entry.voc_moon && (
              <VocMoonBanner
                sign={entry.voc_moon_sign}
                degreesToChange={entry.voc_degrees_to_sign_change}
                nextSign={entry.voc_next_sign}
                exceptionSign={entry.voc_exception_sign}
              />
            )}

            {entry.confidence_band === 'low' && !notRadical && (
              <Banner message={t('verdict.lowConfidenceNote')} type="warning" />
            )}

            {!!entry.summary && (
              <Text className="font-cormorant text-lg text-text-primary italic leading-relaxed">
                {entry.summary}
              </Text>
            )}

            {entry.timing && !notRadical && (
              <TimingTeaser timing={entry.timing} onPress={handleViewFull} />
            )}
          </AnimatedView>
        </ScrollView>

        {/* Pinned CTA */}
        <AnimatedView style={ctaStyle} className="px-5 pt-3 pb-2">
          {notRadical ? (
            <Button
              label={t('verdict.askAgain')}
              variant="secondary"
              onPress={handleBack}
            />
          ) : (
            <>
              <TouchableOpacity
                onPress={handleViewFull}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('verdict.seeFullReading')}
                className="bg-accent-gold rounded-xl min-h-[52px] flex-row items-center justify-center gap-2"
              >
                <Text className="font-inter-semibold text-base text-text-inverse">
                  {t('verdict.seeFullReading')}
                </Text>
                <ChevronRight color={colors.textInverse} size={typography.lg} />
              </TouchableOpacity>
              <Text className="text-center font-mono text-[11px] text-text-secondary mt-2.5">
                {t('verdict.fullReadingHint')}
              </Text>
            </>
          )}
        </AnimatedView>
      </SafeAreaView>
    </CosmosBackground>
  );
}
