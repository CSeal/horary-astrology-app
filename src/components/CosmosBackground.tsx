// src/components/CosmosBackground.tsx
// Animated star field background — 60 particles, pulse + drift.
// Stub — full implementation in Sprint D.

import { View } from 'react-native';

interface CosmosBackgroundProps {
  children: React.ReactNode;
}

export function CosmosBackground({ children }: CosmosBackgroundProps) {
  return (
    <View className="flex-1 bg-bg-base">
      {/* StarField SVG layer — Sprint D */}
      {children}
    </View>
  );
}
