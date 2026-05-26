// src/components/AskForm.tsx
// Question TextInput + submit button composite.
// Stub — full implementation in Sprint C.

import { View } from 'react-native';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface AskFormProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function AskForm({ value, onChangeText, onSubmit, isLoading }: AskFormProps) {
  const isValid = value.trim().length >= 5 && value.length <= 280;

  return (
    <View className="gap-4">
      <Input
        value={value}
        onChangeText={onChangeText}
        showCharCount
        placeholder="Ask a sincere, specific question..."
      />
      <Button
        label="Ask the Stars"
        onPress={onSubmit}
        disabled={!isValid || isLoading}
        accessibilityLabel="Ask the Stars. Submit your horary question."
      />
    </View>
  );
}
