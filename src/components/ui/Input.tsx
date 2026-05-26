// src/components/ui/Input.tsx
// TextInput with character counter and focus ring.
// No StyleSheet.create() — NativeWind className only.

import { useState } from 'react';
import { TextInput, View, Text, type TextInputProps } from 'react-native';
import { MAX_QUESTION_CHARS } from '../../constants/config';

interface InputProps extends TextInputProps {
  showCharCount?: boolean;
  maxLength?: number;
}

export function Input({
  showCharCount = false,
  maxLength = MAX_QUESTION_CHARS,
  value = '',
  onChangeText,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const charCount = value.length;
  const atLimit = charCount >= maxLength;

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        multiline
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`bg-bg-card rounded-xl p-4 min-h-[120px] text-text-primary font-inter text-base leading-relaxed ${
          focused ? 'border border-border-focus' : 'border border-border'
        }`}
        placeholderTextColor="#4A4465"
        {...props}
      />
      {showCharCount && (
        <Text
          className={`text-xs mt-1 text-right font-inter ${
            atLimit ? 'text-no' : 'text-text-secondary'
          }`}
        >
          {charCount} / {maxLength}
        </Text>
      )}
    </View>
  );
}
