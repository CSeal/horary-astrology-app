// src/app/(tabs)/result/[id].tsx
// Verdict detail screen — reads entry from questionsStore by id.
// Stub implementation — full implementation in Sprint C.

import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-bg-base items-center justify-center">
      <Text className="text-text-primary font-inter text-lg">
        Verdict for {id} (Sprint C)
      </Text>
    </View>
  );
}
