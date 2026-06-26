// src/components/RadicalityFlagsBlock.tsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { View, Text, AnimatedView, TouchableOpacity } from '@/tw';
import { colors, typography } from '@/constants/theme';

interface RadicalityFlag {
  name: string;
  severity: 'severe' | 'moderate' | 'mild';
  message: string;
}

interface RadicalityFlagsBlockProps {
  flags: RadicalityFlag[];
}

const PREVIEW_COUNT = 2;

const SEVERITY_BADGE_CLASS: Record<RadicalityFlag['severity'], string> = {
  severe: 'bg-no/20',
  moderate: 'bg-maybe/20',
  mild: 'bg-bg-surface',
};

const SEVERITY_TEXT_CLASS: Record<RadicalityFlag['severity'], string> = {
  severe: 'text-no',
  moderate: 'text-maybe',
  mild: 'text-text-secondary',
};

// Single flag row that rises + fades in, staggered by index. Extra rows mount
// fresh when "show all" flips, so they animate in on reveal automatically.
function FlagRow({
  index,
  flag,
  severityLabel,
}: {
  index: number;
  flag: RadicalityFlag;
  severityLabel: string;
}) {
  const enterY = useSharedValue(10);
  const enterOpacity = useSharedValue(0);

  useEffect(() => {
    enterY.value = withDelay(
      index * 70,
      withSpring(0, { damping: 14, stiffness: 120 })
    );
    enterOpacity.value = withDelay(index * 70, withTiming(1, { duration: 260 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
    transform: [{ translateY: enterY.value }],
  }));

  return (
    <AnimatedView style={style} className="flex-row items-center gap-2">
      <Text className="flex-1 font-inter text-sm text-text-primary">
        {`⚠ ${flag.message}`}
      </Text>
      <View className={`rounded-full px-2 py-0.5 ${SEVERITY_BADGE_CLASS[flag.severity]}`}>
        <Text
          className={`font-inter-semibold text-[10px] uppercase ${SEVERITY_TEXT_CLASS[flag.severity]}`}
        >
          {severityLabel}
        </Text>
      </View>
    </AnimatedView>
  );
}

export function RadicalityFlagsBlock({ flags }: RadicalityFlagsBlockProps) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  // Subtle card entrance: rise + fade on mount.
  const cardY = useSharedValue(8);
  const cardOpacity = useSharedValue(0);
  useEffect(() => {
    cardY.value = withSpring(0, { damping: 14, stiffness: 120 });
    cardOpacity.value = withTiming(1, { duration: 320 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  // Chevron flips when the full list is revealed.
  const chevronRot = useSharedValue(0);
  useEffect(() => {
    chevronRot.value = withTiming(showAll ? 180 : 0, { duration: 220 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAll]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRot.value}deg` }],
  }));

  if (flags.length === 0) {
    return null;
  }

  const visibleFlags = showAll ? flags : flags.slice(0, PREVIEW_COUNT);
  const hasMore = flags.length > PREVIEW_COUNT;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setShowAll((v) => !v);
  };

  return (
    <AnimatedView style={cardStyle} className="bg-bg-card rounded-xl px-4 py-3 gap-2">
      {visibleFlags.map((flag, idx) => (
        <FlagRow
          key={`${idx}-${flag.name}`}
          index={idx}
          flag={flag}
          severityLabel={t(`verdict.radicalitySeverity.${flag.severity}`)}
        />
      ))}

      {hasMore && (
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.85}
          accessibilityRole="button"
          className="flex-row items-center justify-center gap-1 py-2"
        >
          <Text className="font-inter-medium text-[12px] text-accent-gold">
            {showAll
              ? t('verdict.radicalityShowFewer')
              : t('verdict.radicalityShowAll', { count: flags.length })}
          </Text>
          <AnimatedView style={chevronStyle}>
            <ChevronDown color={colors.textSecondary} size={typography.sm} />
          </AnimatedView>
        </TouchableOpacity>
      )}
    </AnimatedView>
  );
}
