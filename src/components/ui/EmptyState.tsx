// src/components/ui/EmptyState.tsx
// Centered empty-state block: icon scales in (springy), text rises after a delay.

import { useEffect } from 'react';
import { AnimatedView, View, Text } from '@/tw';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  children,
}: EmptyStateProps) {
  const iconScale = useSharedValue(0.7);
  const iconOpacity = useSharedValue(0);
  const textY = useSharedValue(20);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 10, stiffness: 80 });
    iconOpacity.value = withTiming(1, { duration: 300 });
    textY.value = withDelay(120, withSpring(0, { damping: 12, stiffness: 90 }));
    textOpacity.value = withDelay(120, withTiming(1, { duration: 350 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center px-6 gap-3">
      {icon ? (
        <AnimatedView style={iconStyle} className="mb-2">
          {icon}
        </AnimatedView>
      ) : null}
      <AnimatedView style={textStyle} className="items-center gap-3 w-full">
        <Text className="font-cormorant-medium text-xl text-text-primary text-center">
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-inter text-sm text-text-secondary text-center leading-relaxed">
            {subtitle}
          </Text>
        ) : null}
        {children ? <View className="mt-4 w-full">{children}</View> : null}
      </AnimatedView>
    </View>
  );
}
