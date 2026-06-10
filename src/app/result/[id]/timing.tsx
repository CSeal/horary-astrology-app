// src/app/result/[id]/timing.tsx
// Focused timing screen — "когда это может произойти?"
// Pushed from the verdict screen when user taps the TimingTeaser.
// Shows only the timing detail in full. "Полный разбор" CTA replaces this
// screen with full.tsx (router.replace, not push, to keep the stack clean).

import { useCallback, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
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
import { TimingBlock } from '@/components/TimingBlock';
import { VerdictBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useJournal } from '@/hooks/useJournal';
import { colors, typography } from '@/constants/theme';

export default function TimingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { getEntryById } = useJournal();

  const entry = getEntryById(id ?? '');

  // Back button press scale
  const backScale = useSharedValue(1);
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  // Entrance animation — header then body staggered
  const headerOp = useSharedValue(0);
  const headerY = useSharedValue(16);
  const bodyOp = useSharedValue(0);
  const bodyY = useSharedValue(16);

  useEffect(() => {
    headerOp.value = withTiming(1, { duration: 320 });
    headerY.value = withSpring(0, { damping: 14, stiffness: 100 });
    bodyOp.value = withDelay(80, withTiming(1, { duration: 320 }));
    bodyY.value = withDelay(80, withSpring(0, { damping: 14, stiffness: 100 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value,
    transform: [{ translateY: headerY.value }],
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    opacity: bodyOp.value,
    transform: [{ translateY: bodyY.value }],
  }));

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/result/${id}` as never);
    }
  }, [router, id]);

  // Replace timing in the stack with full reading so back from full → verdict
  const handleViewFull = useCallback(() => {
    router.replace(`/result/${id}/full` as never);
  }, [router, id]);

  if (!entry || !entry.timing) {
    return (
      <CosmosBackground>
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
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

  return (
    <CosmosBackground>
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        {/* Header */}
        <AnimatedView
          style={headerStyle}
          className="flex-row items-center px-5 py-3 gap-2"
        >
          <AnimatedView style={backStyle}>
            <TouchableOpacity
              onPress={handleBack}
              onPressIn={() => {
                backScale.value = withSpring(0.92, { damping: 14, stiffness: 200 });
              }}
              onPressOut={() => {
                backScale.value = withSpring(1, { damping: 12, stiffness: 90 });
              }}
              className="min-w-11 min-h-11 flex-row items-center -ml-2 pr-2"
              accessibilityRole="button"
            >
              <ArrowLeft color={colors.textSecondary} size={typography.xl} />
            </TouchableOpacity>
          </AnimatedView>
          <Text className="font-cormorant-medium text-xl text-text-primary">
            {t('verdict.timingWhen')}
          </Text>
        </AnimatedView>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 gap-4"
        >
          <AnimatedView style={bodyStyle} className="gap-4">
            {/* Question + verdict badge for context */}
            <View className="flex-row items-start gap-3 flex-wrap">
              <VerdictBadge verdict={entry.verdict} size="sm" />
              <Text
                className="font-cormorant text-base text-text-secondary italic flex-1"
                numberOfLines={3}
              >
                {`"${entry.question}"`}
              </Text>
            </View>

            <TimingBlock timing={entry.timing} />
          </AnimatedView>
        </ScrollView>

        {/* CTA: go to full reading (replaces this screen in stack) */}
        <View className="px-5 pt-3 pb-2">
          <TouchableOpacity
            onPress={handleViewFull}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('verdict.seeFullReading')}
            className="bg-bg-surface border border-border rounded-xl min-h-13 flex-row items-center justify-center gap-2"
          >
            <Text className="font-inter-semibold text-base text-text-primary">
              {t('verdict.seeFullReading')}
            </Text>
            <ChevronRight color={colors.textPrimary} size={typography.lg} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </CosmosBackground>
  );
}
