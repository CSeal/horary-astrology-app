// src/app/result/[id]/chart.tsx
// Full-screen horary chart wheel. Pushed from the full-reading screen.
// ChartWheel mounts fresh on every open → entrance animation always plays.
// Chart fills the available width for maximum detail legibility.

import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
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
  View,
  Text,
  TouchableOpacity,
} from '@/tw';
import { CosmosBackground } from '@/components/CosmosBackground';
import { ChartWheel } from '@/components/svg/ChartWheel';
import { Button } from '@/components/ui/Button';
import { useJournal } from '@/hooks/useJournal';
import { colors, typography } from '@/constants/theme';

export default function ChartScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { getEntryById } = useJournal();

  const entry = getEntryById(id ?? '');
  // Pad 16px each side; cap at 420 so it looks good on large-screen devices too
  const chartSize = Math.min(width - 32, 420);

  // Back button press scale
  const backScale = useSharedValue(1);
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  // Header slide-in
  const headerOp = useSharedValue(0);
  const headerY = useSharedValue(16);

  // Chart scale-in — starts at 0.88, springs to 1 with a short delay
  const chartScale = useSharedValue(0.88);
  const chartOp = useSharedValue(0);

  useEffect(() => {
    headerOp.value = withTiming(1, { duration: 300 });
    headerY.value = withSpring(0, { damping: 14, stiffness: 100 });
    chartScale.value = withDelay(120, withSpring(1, { damping: 13, stiffness: 90 }));
    chartOp.value = withDelay(120, withTiming(1, { duration: 420 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value,
    transform: [{ translateY: headerY.value }],
  }));
  const chartStyle = useAnimatedStyle(() => ({
    opacity: chartOp.value,
    transform: [{ scale: chartScale.value }],
  }));

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/result/${id}/full` as never);
    }
  };

  if (!entry || !entry.chart_wheel) {
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
              className="min-w-11 min-h-11 items-center justify-center -ml-2"
              accessibilityRole="button"
              accessibilityLabel={t('a11y.backButton')}
            >
              <ArrowLeft color={colors.textPrimary} size={typography.xl} />
            </TouchableOpacity>
          </AnimatedView>
          <Text className="font-cormorant-medium text-xl text-text-primary">
            {t('verdict.chartTitle')}
          </Text>
        </AnimatedView>

        {/* Chart centred in remaining space — animation restarts on every mount */}
        <View className="flex-1 items-center justify-center px-4">
          <AnimatedView style={chartStyle}>
            <ChartWheel data={entry.chart_wheel} size={chartSize} />
          </AnimatedView>
        </View>
      </SafeAreaView>
    </CosmosBackground>
  );
}
