// src/components/svg/VerdictStar.tsx
// Animated ✦ star reveal on verdict screen entrance.
// Full implementation in Sprint D.
// Color: accentGold from theme.ts — never inline.

import { Text } from 'react-native';

interface VerdictStarProps {
  size?: number;
  colorClass?: string;
}

export function VerdictStar({ size = 24, colorClass = 'text-accent-gold' }: VerdictStarProps) {
  // Sprint D: Animated.spring scale 0→1 + opacity fade, 400ms
  return (
    <Text className={colorClass} style={{ fontSize: size }}>
      ✦
    </Text>
  );
}
