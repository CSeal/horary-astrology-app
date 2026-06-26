// src/components/ReceptionBlock.tsx
// Mutual / one-way reception card. Mounts with a soft scale-in; the reception
// badge bounces in as a celebratory accent and the description rises in after.
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { View, Text, AnimatedView } from '@/tw';

interface ReceptionBlockProps {
  reception: {
    hasMutual: boolean;
    hasOneWay: boolean;
    type: string | null;
    description: string;
  };
}

export function ReceptionBlock({ reception }: ReceptionBlockProps) {
  const { t } = useTranslation();

  // Card entrance: gentle scale + fade.
  const enterScale = useSharedValue(0.96);
  const enterOpacity = useSharedValue(0);
  useEffect(() => {
    enterScale.value = withSpring(1, { damping: 13, stiffness: 120 });
    enterOpacity.value = withTiming(1, { duration: 320 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cardStyle = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
    transform: [{ scale: enterScale.value }],
  }));

  // Badge: bouncy pop-in — the celebratory accent.
  const badgeScale = useSharedValue(0.7);
  const badgeOpacity = useSharedValue(0);
  useEffect(() => {
    badgeScale.value = withDelay(
      160,
      withSpring(1, { damping: 9, stiffness: 220 })
    );
    badgeOpacity.value = withDelay(160, withTiming(1, { duration: 320 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  // Description: fade + rise, trailing the card.
  const descY = useSharedValue(8);
  const descOpacity = useSharedValue(0);
  useEffect(() => {
    descY.value = withDelay(120, withTiming(0, { duration: 300 }));
    descOpacity.value = withDelay(120, withTiming(1, { duration: 300 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
    transform: [{ translateY: descY.value }],
  }));

  if (!reception.hasMutual && !reception.hasOneWay) {
    return null;
  }

  return (
    <AnimatedView
      style={cardStyle}
      className="bg-bg-card rounded-xl px-4 py-3 gap-2"
    >
      <View className="flex-row items-center">
        <Text className="font-inter-semibold text-sm text-text-primary">
          {'♄ ↔ ♃  '}
          {t('verdict.receptionTitle')}
        </Text>
        <View className="flex-1" />
        {reception.hasMutual ? (
          <AnimatedView
            style={badgeStyle}
            className="bg-accent-gold rounded-full px-2 py-0.5"
          >
            <Text className="font-inter-semibold text-[10px] text-text-inverse">
              {t('verdict.receptionMutual')}
            </Text>
          </AnimatedView>
        ) : (
          <AnimatedView
            style={badgeStyle}
            className="bg-accent-violet/20 rounded-full px-2 py-0.5"
          >
            <Text className="font-inter-semibold text-[10px] text-accent-violet">
              {t('verdict.receptionOneWay')}
            </Text>
          </AnimatedView>
        )}
      </View>

      <AnimatedView style={descStyle}>
        <Text className="font-inter text-sm text-text-primary leading-relaxed">
          {reception.description}
        </Text>
      </AnimatedView>
    </AnimatedView>
  );
}
