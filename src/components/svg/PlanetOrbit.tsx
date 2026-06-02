// src/components/svg/PlanetOrbit.tsx
// Loading-screen orbit animation: a planet glyph rotating around a central
// Ascendant circle, with a pulsing core.
// Reanimated drives a single shared rotation value on the UI thread — no
// per-frame re-renders. Colors and sizes always from props/theme.

import { useEffect } from 'react';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import { PLANET_GLYPHS } from '@/constants/planets';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

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

  // Reanimated 4 validates `transform` through its RN/CSS parser which does not
  // understand SVG's 3-arg rotate(angle cx cy). Compute planet position directly
  // from the angle so no transform prop is needed at all.
  const planetCircleProps = useAnimatedProps(() => {
    const rad = (rotation.value * Math.PI) / 180;
    return {
      cx: center + orbitRadius * Math.cos(rad),
      cy: center + orbitRadius * Math.sin(rad),
    };
  });

  const planetGlyphProps = useAnimatedProps(() => {
    const rad = (rotation.value * Math.PI) / 180;
    return {
      x: center + orbitRadius * Math.cos(rad),
      y: center + orbitRadius * Math.sin(rad) + planetRadius * 0.4,
    };
  });

  const coreProps = useAnimatedProps(() => ({
    r: coreRadius * corePulse.value,
  }));

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
      {/* Orbiting planet — position computed from angle, no SVG transform needed */}
      <AnimatedCircle
        r={planetRadius}
        fill={color}
        fillOpacity={0.9}
        animatedProps={planetCircleProps}
      />
      <AnimatedSvgText
        fill={colors.textPrimary}
        fontSize={planetRadius * 1.4}
        textAnchor="middle"
        animatedProps={planetGlyphProps}
      >
        {PLANET_GLYPHS.Jupiter}
      </AnimatedSvgText>
    </Svg>
  );
}
