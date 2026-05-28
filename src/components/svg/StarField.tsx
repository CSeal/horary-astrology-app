// src/components/svg/StarField.tsx
// Animated SVG star particle layer.
// 60 dots, randomized position/size/opacity, pulse via Reanimated withRepeat.
// Colors sourced from theme.ts — never inline.
// Implementation notes:
//   - Particle layout is deterministic via a seeded LCG so positions are stable
//     across re-renders without leaking into prop diffs.
//   - Pulse animation uses Reanimated `withRepeat(withTiming(...), -1, true)` so
//     the work runs on the UI thread (no per-frame re-renders).

import { useEffect, useMemo } from 'react';
import Svg, { Circle } from 'react-native-svg';
// Note: both hooks are used — useEffect for the per-particle pulse, useMemo
// for the deterministic particle layout in `StarField`.
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PARTICLE_COUNT = 60;

interface Particle {
  cx: number;
  cy: number;
  r: number;
  baseOpacity: number;
  pulseDuration: number;
  pulseDelay: number;
}

// Seeded LCG for deterministic particle layout — same seed across re-renders.
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function buildParticles(width: number, height: number, seed: number): Particle[] {
  const rand = makeRng(seed);
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      cx: rand() * width,
      cy: rand() * height,
      r: 1 + rand() * 2, // 1–3 px
      baseOpacity: 0.2 + rand() * 0.4, // 0.2–0.6
      pulseDuration: 2000 + Math.floor(rand() * 3000), // 2–5s
      pulseDelay: Math.floor(rand() * 2000),
    });
  }
  return particles;
}

interface StarParticleProps {
  particle: Particle;
}

function StarParticle({ particle }: StarParticleProps) {
  const opacity = useSharedValue(particle.baseOpacity);

  // Kick off the pulse once. setTimeout avoids the worklet running synchronously
  // during render; the animation lives entirely on the UI thread thereafter.
  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withRepeat(
        withTiming(particle.baseOpacity * 0.3, {
          duration: particle.pulseDuration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }, particle.pulseDelay);
    return () => clearTimeout(timer);
    // Intentionally only re-bind when the particle identity changes.
  }, [opacity, particle.baseOpacity, particle.pulseDuration, particle.pulseDelay]);

  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedCircle
      cx={particle.cx}
      cy={particle.cy}
      r={particle.r}
      fill={colors.textPrimary}
      animatedProps={animatedProps}
    />
  );
}

interface StarFieldProps {
  width: number;
  height: number;
  seed?: number;
}

export function StarField({ width, height, seed = 1337 }: StarFieldProps) {
  const particles = useMemo(
    () => buildParticles(width, height, seed),
    [width, height, seed]
  );

  return (
    <Svg
      width={width}
      height={height}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {particles.map((p, i) => (
        <StarParticle key={i} particle={p} />
      ))}
    </Svg>
  );
}
