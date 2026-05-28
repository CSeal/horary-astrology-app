// src/components/ui/Input.tsx
// TextInput with character counter and animated gold focus border glow.
// Border color is interpolated via Reanimated on focus/blur — no instant snap.

import { useCallback } from 'react';
import { AnimatedView, TextInput, View, Text } from '@/tw';
import type { TextInputProps } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { MAX_QUESTION_CHARS } from '../../constants/config';
import { colors } from '../../constants/theme';

interface InputProps extends TextInputProps {
  showCharCount?: boolean;
  maxLength?: number;
}

export function Input({
  showCharCount = false,
  maxLength = MAX_QUESTION_CHARS,
  value = '',
  onChangeText,
  multiline,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const charCount = typeof value === 'string' ? value.length : 0;
  const nearLimit = charCount >= maxLength - 20;
  const atLimit = charCount >= maxLength;

  const focusProgress = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [colors.border, colors.borderFocus]
    ),
    borderWidth: 1,
    borderRadius: 12,
  }));

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      focusProgress.value = withTiming(1, { duration: 200 });
      onFocus?.(e);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      focusProgress.value = withTiming(0, { duration: 200 });
      onBlur?.(e);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onBlur]
  );

  return (
    <View>
      <AnimatedView style={borderStyle}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          multiline={multiline}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`bg-bg-card rounded-xl p-4 ${
            multiline ? 'min-h-30' : 'min-h-12'
          } text-text-primary font-inter text-base leading-relaxed`}
          placeholderTextColor={colors.textDisabled}
          {...props}
        />
      </AnimatedView>
      {showCharCount && (
        <Text
          className={`text-xs mt-1 text-right font-inter ${
            atLimit ? 'text-no' : nearLimit ? 'text-maybe' : 'text-text-secondary'
          }`}
        >
          {charCount} / {maxLength}
        </Text>
      )}
    </View>
  );
}
