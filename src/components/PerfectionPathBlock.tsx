// src/components/PerfectionPathBlock.tsx
// Static card: header, enables/blocks badge, summary. Card rises + fades in on
// mount; the verdict badge pops in (scale) whenever it mounts; summary trails.
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { View, Text, AnimatedView } from '@/tw';

interface PerfectionPathBlockProps {
  perfectionPath: {
    enablesPerfection: boolean;
    preventsPerfection: boolean;
    hasDirectAspect: boolean;
    summary: string;
  };
}

// Enables/blocks badge that scales in whenever it mounts.
function PathBadge({
  label,
  bgClassName,
  textClassName,
}: {
  label: string;
  bgClassName: string;
  textClassName: string;
}) {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(140, withSpring(1, { damping: 10, stiffness: 200 }));
    opacity.value = withDelay(140, withTiming(1, { duration: 220 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedView style={style} className={`rounded-full px-2 py-0.5 ${bgClassName}`}>
      <Text className={`font-inter-semibold text-[10px] ${textClassName}`}>{label}</Text>
    </AnimatedView>
  );
}

export function PerfectionPathBlock({ perfectionPath }: PerfectionPathBlockProps) {
  const { t } = useTranslation();
  const { enablesPerfection, preventsPerfection } = perfectionPath;

  const showEnables = enablesPerfection && !preventsPerfection;
  const showBlocks = preventsPerfection;

  // Card entrance: rise + fade.
  const enterY = useSharedValue(12);
  const enterOpacity = useSharedValue(0);
  useEffect(() => {
    enterY.value = withSpring(0, { damping: 14, stiffness: 110 });
    enterOpacity.value = withTiming(1, { duration: 320 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cardStyle = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
    transform: [{ translateY: enterY.value }],
  }));

  // Summary trails in just after the card.
  const summaryY = useSharedValue(8);
  const summaryOpacity = useSharedValue(0);
  useEffect(() => {
    summaryY.value = withDelay(200, withSpring(0, { damping: 14, stiffness: 110 }));
    summaryOpacity.value = withDelay(200, withTiming(1, { duration: 320 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const summaryStyle = useAnimatedStyle(() => ({
    opacity: summaryOpacity.value,
    transform: [{ translateY: summaryY.value }],
  }));

  return (
    <AnimatedView style={cardStyle} className="bg-bg-card rounded-xl px-4 py-3 gap-2">
      <View className="flex-row items-center">
        <Text className="font-inter-semibold text-sm text-text-primary">
          {t('verdict.perfectionTitle')}
        </Text>
        <View className="flex-1" />
        {showEnables && (
          <PathBadge
            label={t('verdict.perfectionEnables')}
            bgClassName="bg-yes/20"
            textClassName="text-yes"
          />
        )}
        {showBlocks && (
          <PathBadge
            label={t('verdict.perfectionBlocks')}
            bgClassName="bg-no/20"
            textClassName="text-no"
          />
        )}
      </View>

      <AnimatedView style={summaryStyle}>
        <Text className="font-inter text-sm text-text-secondary leading-relaxed">
          {perfectionPath.summary}
        </Text>
      </AnimatedView>
    </AnimatedView>
  );
}
