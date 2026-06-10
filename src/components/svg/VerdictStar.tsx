// src/components/svg/VerdictStar.tsx
// 8-point starburst with spring entrance.
// Scales 0→1 and rotates 0→180° on mount. Color always tracks the verdict
// type via theme.ts tokens — never inline.

import { useEffect, useMemo } from 'react';
import Svg, { Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import type { VerdictType } from '@/types/horary';

const VERDICT_COLOR: Record<VerdictType, string> = {
  YES: colors.yes,
  NO: colors.no,
  MAYBE: colors.maybe,
  UNCLEAR: colors.unclear,
};

const POINTS = 8;

interface VerdictStarProps {
  verdict: VerdictType;
  size?: number;
}

export function VerdictStar({ verdict, size = 64 }: VerdictStarProps) {
  const center = size / 2;
  const outerRadius = size / 2;
  const innerRadius = size / 5;

  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const color = VERDICT_COLOR[verdict];

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    rotation.value = withTiming(180, { duration: 600 });
  }, [scale, rotation]);

  // Points centered at (center, center) so an Animated.View wrapper can handle
  // scale + rotation via RN transforms — no SVG transform string needed.
  const points = useMemo(() => {
    const verts: string[] = [];
    for (let i = 0; i < POINTS * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / POINTS) * i - Math.PI / 2;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      verts.push(`${x},${y}`);
    }
    return verts.join(' ');
  }, [outerRadius, innerRadius, center]);

  // RN transform on Animated.View — Reanimated 4 supports this; SVG transform
  // strings in useAnimatedProps are NOT supported (mappers.ts throws on Android).
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg
        width={size}
        height={size}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Polygon points={points} fill={color} />
      </Svg>
    </Animated.View>
  );
}
