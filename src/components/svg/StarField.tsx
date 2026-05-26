// src/components/svg/StarField.tsx
// SVG star particle layer — 60 particles, pulse + drift animations.
// Full implementation in Sprint D.
// Colors from theme.ts — never inline.

import { View } from 'react-native';

export function StarField() {
  // Sprint D: render 60 SVG circle elements with staggered
  // Animated.loop(Animated.sequence([opacity, translateXY])) per particle.
  return <View className="absolute inset-0" />;
}
