// src/components/svg/VerdictStar.tsx
// 8-point starburst with spring entrance.
// Scales 0→1 and rotates 0→180° on mount. Color always tracks the verdict
// type via theme.ts tokens — never inline.

import { useEffect, useMemo } from 'react';
import Svg, { Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../constants/theme';
import type { VerdictType } from '../../types/horary';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

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

  // Build the 8-point star polygon points around (0,0) — we let the SVG
  // transform on the polygon handle scale/rotate from the center.
  const points = useMemo(() => {
    const verts: string[] = [];
    for (let i = 0; i < POINTS * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / POINTS) * i - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      verts.push(`${x},${y}`);
    }
    return verts.join(' ');
  }, [outerRadius, innerRadius]);

  const animatedProps = useAnimatedProps(() => ({
    transform: `translate(${center} ${center}) rotate(${rotation.value}) scale(${scale.value})`,
  }));

  return (
    <Svg
      width={size}
      height={size}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <AnimatedPolygon
        points={points}
        fill={color}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
