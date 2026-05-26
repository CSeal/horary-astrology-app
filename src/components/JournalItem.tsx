// src/components/JournalItem.tsx
// Journal entry card with left-border verdict color.
// Stub — full implementation in Sprint C.

import { View, Text, TouchableOpacity } from 'react-native';
import type { JournalEntry } from '../types/journal';

interface JournalItemProps {
  entry: JournalEntry;
  onPress: () => void;
}

const VERDICT_BORDER_CLASS = {
  YES: 'border-l-4 border-l-yes',
  NO: 'border-l-4 border-l-no',
  MAYBE: 'border-l-4 border-l-maybe',
  UNCLEAR: 'border-l-4 border-l-unclear',
};

export function JournalItem({ entry, onPress }: JournalItemProps) {
  const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-bg-surface rounded-xl p-4 ${VERDICT_BORDER_CLASS[entry.verdict]}`}
      accessibilityLabel={`${entry.verdict} verdict for question: ${entry.question}. Date: ${date}.`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="bg-yes/20 px-2.5 py-1 rounded-full">
          <Text className="text-xs font-inter-semibold text-text-primary">
            {entry.verdict}
          </Text>
        </View>
        <Text className="text-xs font-inter text-text-secondary">{date}</Text>
      </View>
      <Text className="font-inter text-base text-text-primary" numberOfLines={2}>
        {entry.question}
      </Text>
      <Text className="text-xs font-inter text-text-secondary mt-1">
        {entry.confidence_band.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}
