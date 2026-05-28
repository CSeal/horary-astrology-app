// src/components/svg/PlanetOrbit.tsx
// Loading-screen orbit animation: a planet glyph rotating around a central
// Ascendant circle, with a pulsing core.
// Reanimated drives a single shared rotation value on the UI thread — no
// per-frame re-renders. Colors and sizes always from props/theme.

import { useEffect } from 'react';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../constants/theme';
import { PLANET_GLYPHS } from '../../constants/planets';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PlanetOrbitProps {
  size?: number;
  color?: string;
  centerColor?: string;
}

export function PlanetOrbit({
  size = 120,
  color = colors.accentViolet,
  centerColor = colors.accentGold,
}: PlanetOrbitProps) {
  const center = size / 2;
  const orbitRadius = size * 0.4;
  const planetRadius = size * 0.07;
  const coreRadius = size * 0.08;

  const rotation = useSharedValue(0);
  const corePulse = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
    corePulse.value = withRepeat(
      withTiming(1.15, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [rotation, corePulse]);

  const rotationProps = useAnimatedProps(() => ({
    // SVG rotate(angle cx cy) pins the pivot — no originX/originY needed.
    transform: `rotate(${rotation.value} ${center} ${center})`,
  }));

  const coreProps = useAnimatedProps(() => ({
    r: coreRadius * corePulse.value,
  }));

  // Planet glyph position — on the orbit ring at angle 0 (rotation handles spin).
  const planetX = center + orbitRadius;
  const planetY = center;

  return (
    <Svg width={size} height={size}>
      {/* Orbit ring */}
      <Circle
        cx={center}
        cy={center}
        r={orbitRadius}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.25}
        fill="none"
      />
      {/* Pulsing center (Ascendant) */}
      <AnimatedCircle
        cx={center}
        cy={center}
        fill={centerColor}
        fillOpacity={0.8}
        animatedProps={coreProps}
      />
      {/* Rotating planet */}
      <AnimatedG animatedProps={rotationProps}>
        <Circle
          cx={planetX}
          cy={planetY}
          r={planetRadius}
          fill={color}
          fillOpacity={0.9}
        />
        <SvgText
          x={planetX}
          y={planetY + planetRadius * 0.4}
          fill={colors.textPrimary}
          fontSize={planetRadius * 1.4}
          textAnchor="middle"
        >
          {PLANET_GLYPHS.Jupiter}
        </SvgText>
      </AnimatedG>
    </Svg>
  );
}
