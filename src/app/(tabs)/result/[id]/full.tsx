// src/app/(tabs)/result/[id]/full.tsx
// Full-reading detail (Phase 1.5, layout C+ screen 2). Pushed from the verdict
// screen. Shows the timing detail, significators, and aspect perfections.
// Aspects beyond the first three collapse behind a "show all" toggle.

import { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import {
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
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

  const handleBack = useCallback(() => {
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
        <View className="flex-row items-center px-5 py-3 gap-1">
          <TouchableOpacity
            onPress={handleBack}
            className="min-w-11 min-h-11 items-center justify-center -ml-2"
            accessibilityLabel={t('a11y.backButton')}
            accessibilityRole="button"
          >
            <ArrowLeft color={colors.textPrimary} size={typography.xl} />
          </TouchableOpacity>
          <Text className="font-cormorant-medium text-xl text-text-primary">
            {t('verdict.fullReadingTitle')}
          </Text>
        </View>

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
                  <AspectRow
                    key={`${aspect.planet1}-${aspect.planet2}-${idx}`}
                    data={aspect}
                  />
                ))}
              </View>
              {aspects.length > ASPECT_PREVIEW_COUNT && (
                <TouchableOpacity
                  onPress={() => setShowAllAspects((v) => !v)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  className="flex-row items-center justify-center gap-2 mt-1 py-3 rounded-xl border border-dashed border-border"
                >
                  <Text className="font-inter-medium text-[13px] text-text-secondary">
                    {showAllAspects
                      ? t('verdict.showFewerAspects')
                      : t('verdict.showAllAspects', { count: aspects.length })}
                  </Text>
                  <ChevronDown
                    color={colors.textSecondary}
                    size={typography.sm}
                    style={{
                      transform: [{ rotate: showAllAspects ? '180deg' : '0deg' }],
                    }}
                  />
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
