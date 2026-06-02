// src/components/ui/Button.tsx
// Primary / Secondary / Destructive button variants.
// Spring press scale + haptic feedback via Reanimated 4 + expo-haptics.

import { useCallback } from 'react';
import { AnimatedView, TouchableOpacity, Text } from '@/tw';
import type { TouchableOpacityProps } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md';
  loading?: boolean;
  accessibilityLabel?: string;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  accessibilityLabel,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const sizeClass = size === 'sm' ? 'min-h-[44px] px-4' : 'min-h-[56px] px-6';
  const baseClass = `rounded-xl items-center justify-center ${sizeClass}`;
  const isDisabled = disabled || loading;

  const variantClass = {
    primary: isDisabled ? 'bg-accent-gold-dim' : 'bg-accent-gold',
    secondary: 'bg-transparent border border-accent-gold',
    destructive: 'bg-transparent',
  }[variant];

  const textClass = {
    primary: 'font-inter-semibold text-lg text-text-inverse text-center',
    secondary: 'font-inter-medium text-base text-accent-gold text-center',
    destructive: 'font-inter text-sm text-no underline text-center',
  }[variant];

  const pressScale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<TouchableOpacityProps['onPressIn']>>[0]) => {
      if (!isDisabled) {
        const targetScale = variant === 'destructive' ? 0.98 : 0.96;
        pressScale.value = withSpring(targetScale, {
          damping: 14,
          stiffness: 120,
        });
        if (variant === 'primary') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        } else if (variant === 'secondary') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      }
      onPressIn?.(e);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDisabled, variant, onPressIn]
  );

  const handlePressOut = useCallback(
    (e: Parameters<NonNullable<TouchableOpacityProps['onPressOut']>>[0]) => {
      pressScale.value = withSpring(1, { damping: 12, stiffness: 90 });
      onPressOut?.(e);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPressOut]
  );

  return (
    <AnimatedView style={pressStyle}>
      <TouchableOpacity
        className={`${baseClass} ${variantClass}`}
        disabled={isDisabled}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        {...props}
      >
        <Text className={textClass}>{label}</Text>
      </TouchableOpacity>
    </AnimatedView>
  );
}
