// src/app/(tabs)/result/[id]/full.tsx
// Full-reading detail (Phase 1.5, layout C+ screen 2). Pushed from the verdict
// screen. Shows the timing detail, significators, and aspect perfections.
// Aspects beyond the first three collapse behind a "show all" toggle.

import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  AnimatedView,
} from '@/tw';
import { CosmosBackground } from '@/components/CosmosBackground';
import { SignificatorRow } from '@/components/SignificatorRow';
import { AspectRow } from '@/components/AspectRow';
import { TimingBlock } from '@/components/TimingBlock';
import { KeyFactorsBlock } from '@/components/KeyFactorsBlock';
import { ReceptionBlock } from '@/components/ReceptionBlock';
import { PerfectionPathBlock } from '@/components/PerfectionPathBlock';
import { RadicalityFlagsBlock } from '@/components/RadicalityFlagsBlock';
import { ChartWheel } from '@/components/svg/ChartWheel';
import { Button } from '@/components/ui/Button';
import { useJournal } from '@/hooks/useJournal';
import { colors, typography } from '@/constants/theme';

const ASPECT_PREVIEW_COUNT = 3;
const STAGGER_STEP_MS = 50;
const STAGGER_MAX_MS = 300;

interface StaggerInProps {
  delay: number;
  children: React.ReactNode;
  className?: string;
}

function StaggerIn({ delay, children, className }: StaggerInProps) {
  const enterY = useSharedValue(16);
  const enterOpacity = useSharedValue(0);

  useEffect(() => {
    enterY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 110 }));
    enterOpacity.value = withDelay(delay, withTiming(1, { duration: 320 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
    transform: [{ translateY: enterY.value }],
  }));

  return (
    <AnimatedView style={animatedStyle} className={className}>
      {children}
    </AnimatedView>
  );
}

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <View className="flex-row items-center gap-3 mt-2 mb-1">
      <Text className="font-inter-semibold text-[11px] text-accent-gold uppercase tracking-[2px]">
        {label}
      </Text>
      <View className="flex-1 h-px bg-border" />
      {count != null && (
        <Text className="font-mono text-[11px] text-text-secondary">{count}</Text>
      )}
    </View>
  );
}

export default function FullReadingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { getEntryById } = useJournal();
  const [showAllAspects, setShowAllAspects] = useState(false);

  const entry = getEntryById(id ?? '');

  // Chevron rotation for the show-all-aspects toggle (0 = collapsed, 180 = open).
  const chevronRotation = useSharedValue(0);
  useEffect(() => {
    chevronRotation.value = withTiming(showAllAspects ? 180 : 0, {
      duration: 200,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllAspects]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  // Screen header mount entrance.
  const screenOp = useSharedValue(0);
  const screenY = useSharedValue(16);
  useEffect(() => {
    screenOp.value = withTiming(1, { duration: 350 });
    screenY.value = withSpring(0, { damping: 14, stiffness: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: screenOp.value,
    transform: [{ translateY: screenY.value }],
  }));

  // Back button press feedback.
  const backScale = useSharedValue(1);
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const toggleAspects = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAllAspects((v) => !v);
  }, []);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/result/${id}` as never);
    }
  }, [router, id]);

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

  const aspects = entry.aspects ?? [];
  const visibleAspects = showAllAspects
    ? aspects
    : aspects.slice(0, ASPECT_PREVIEW_COUNT);

  return (
    <CosmosBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Nav: ← + Full Reading */}
        <AnimatedView
          style={headerStyle}
          className="flex-row items-center px-5 py-3 gap-1"
        >
          <TouchableOpacity
            onPress={handleBack}
            onPressIn={() => {
              backScale.value = withSpring(0.92, { damping: 14, stiffness: 200 });
            }}
            onPressOut={() => {
              backScale.value = withSpring(1, { damping: 12, stiffness: 90 });
            }}
            className="min-w-11 min-h-11 items-center justify-center -ml-2"
            accessibilityLabel={t('a11y.backButton')}
            accessibilityRole="button"
          >
            <AnimatedView style={backStyle}>
              <ArrowLeft color={colors.textPrimary} size={typography.xl} />
            </AnimatedView>
          </TouchableOpacity>
          <Text className="font-cormorant-medium text-xl text-text-primary">
            {t('verdict.fullReadingTitle')}
          </Text>
        </AnimatedView>

        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 gap-2">
          {entry.timing && (
            <>
              <SectionHeader label={t('verdict.timingWhen')} />
              <TimingBlock timing={entry.timing} />
            </>
          )}

          <SectionHeader
            label={t('verdict.significatorsHeader')}
            count={entry.significators.length}
          />
          <View className="gap-2">
            {entry.significators.map((sig, idx) => (
              <SignificatorRow key={`${sig.planet}-${idx}`} data={sig} index={idx} />
            ))}
          </View>

          {entry.keyFactors && entry.keyFactors.length > 0 && (
            <>
              <SectionHeader
                label={t('verdict.keyFactorsTitle')}
                count={entry.keyFactors.length}
              />
              <KeyFactorsBlock factors={entry.keyFactors} />
            </>
          )}

          {aspects.length > 0 && (
            <>
              <SectionHeader
                label={t('verdict.perfectionLabel')}
                count={aspects.length}
              />
              <View className="gap-2">
                {visibleAspects.map((aspect, idx) => (
                  <StaggerIn
                    key={`${aspect.planet1}-${aspect.planet2}-${idx}`}
                    delay={Math.min(idx * STAGGER_STEP_MS, STAGGER_MAX_MS)}
                  >
                    <AspectRow data={aspect} />
                  </StaggerIn>
                ))}
              </View>
              {aspects.length > ASPECT_PREVIEW_COUNT && (
                <TouchableOpacity
                  onPress={toggleAspects}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  className="flex-row items-center justify-center gap-2 mt-1 py-3 rounded-xl border border-dashed border-border"
                >
                  <Text className="font-inter-medium text-[13px] text-text-secondary">
                    {showAllAspects
                      ? t('verdict.showFewerAspects')
                      : t('verdict.showAllAspects', { count: aspects.length })}
                  </Text>
                  <AnimatedView style={chevronStyle}>
                    <ChevronDown
                      color={colors.textSecondary}
                      size={typography.sm}
                    />
                  </AnimatedView>
                </TouchableOpacity>
              )}
            </>
          )}

          {entry.reception &&
            (entry.reception.hasMutual || entry.reception.hasOneWay) && (
              <>
                <SectionHeader label={t('verdict.receptionTitle')} />
                <ReceptionBlock reception={entry.reception} />
              </>
            )}

          {entry.perfectionPath?.summary && (
            <>
              <SectionHeader label={t('verdict.perfectionTitle')} />
              <PerfectionPathBlock perfectionPath={entry.perfectionPath} />
            </>
          )}

          {entry.radicalityFlags && entry.radicalityFlags.length > 0 && (
            <>
              <SectionHeader
                label={t('verdict.radicalityChecksTitle')}
                count={entry.radicalityFlags.length}
              />
              <RadicalityFlagsBlock flags={entry.radicalityFlags} />
            </>
          )}

          {entry.chart_wheel && (
            <>
              <SectionHeader label={t('verdict.chartTitle')} />
              <View className="items-center py-2">
                <ChartWheel data={entry.chart_wheel} size={300} />
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </CosmosBackground>
  );
}
