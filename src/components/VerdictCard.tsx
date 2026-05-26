// src/components/VerdictCard.tsx
// Verdict type + glow card + confidence dots.
// Stub — full implementation in Sprint C.

import { View, Text } from 'react-native';
import type { VerdictType, ConfidenceBand } from '../types/horary';

interface VerdictCardProps {
  verdict: VerdictType;
  confidence: ConfidenceBand;
}

export function VerdictCard({ verdict, confidence }: VerdictCardProps) {
  return (
    <View className="bg-bg-card rounded-3xl p-8 items-center">
      <Text className="font-cormorant-bold text-5xl text-text-primary">{verdict}</Text>
      <Text className="font-inter text-sm text-text-secondary mt-2">
        Confidence: {confidence.toUpperCase()}
      </Text>
    </View>
  );
}
