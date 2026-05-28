// src/components/AnimatedSplash.tsx
// Cosmos-themed animated splash overlay.
//
// Transition design — seamless native → JS handoff:
//   Native splash shows the gold glyph at ~168pt (splash-icon.png / resizeMode contain).
//   AnimatedSplash mounts with glyphScale=0.82 (≈168pt) and glyphOpacity=1 so the
//   glyph appears to be THE SAME object that was already on screen.
//
// Animation phases (driven by `phase` state — ONE effect owns all SharedValue writes):
//   'intro' (0-900ms): Glyph scale 0.82→1.0 via spring. Stars fade in staggered.
//   'idle':            Glyph pulses ×1.06 while waiting for appReady.
//   'exit':            exitProgress 0→1 over 380ms, then onComplete() is called.
//                      In Reanimated 4 the withTiming callback runs on JS thread — no runOnJS needed.

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Svg, Polygon, Circle } from 'react-native-svg';
import { colors } from '../constants/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

// Native splash glyph ≈ 168pt (1024px canvas, star 460px, resizeMode contain on 375pt).
// AnimatedSplash at scale 1.0 ≈ 208pt (220px SVG). 168/208 ≈ 0.81.
// Start here so the glyph appears to continue from the native frame.
const GLYPH_INITIAL_SCALE = 0.82;

const INTRO_DURATION = 900; // ms — after this, intro is considered done
const EXIT_DURATION  = 380; // ms — master fade-out duration

const STAR_SEEDS = [
  { xf: 0.07, yf: 0.08, r: 2.5, delay:   0 },
  { xf: 0.83, yf: 0.06, r: 1.5, delay:  60 },
  { xf: 0.92, yf: 0.20, r: 3.0, delay: 120 },
  { xf: 0.15, yf: 0.18, r: 2.0, delay:  80 },
  { xf: 0.73, yf: 0.26, r: 1.5, delay: 200 },
  { xf: 0.05, yf: 0.44, r: 2.0, delay: 140 },
  { xf: 0.95, yf: 0.56, r: 1.5, delay: 240 },
  { xf: 0.10, yf: 0.73, r: 3.0, delay: 160 },
  { xf: 0.88, yf: 0.78, r: 2.0, delay: 300 },
  { xf: 0.22, yf: 0.88, r: 1.5, delay: 220 },
  { xf: 0.75, yf: 0.92, r: 2.5, delay: 280 },
  { xf: 0.50, yf: 0.09, r: 2.0, delay: 100 },
] as const;

// 8-pointed star — center (110,110), outer R=82, inner r=33 in 220×220 viewBox.
const STAR_POINTS =
  '110,28 122.6,79.5 168,52 140.5,97.4 192,110 ' +
  '140.5,122.6 168,168 122.6,140.5 110,192 97.4,140.5 ' +
  '52,168 79.5,122.6 28,110 79.5,97.4 52,52 97.4,79.5';

// Shadow polygon: same star scaled 1.07× around center (110,110).
// Pre-calculated to avoid deprecated SVG scale/origin props.
// Formula: new_coord = 110 + (coord - 110) × 1.07
const STAR_POINTS_SHADOW =
  '110,22.3 123.5,77.4 172.1,47.9 142.6,96.5 197.7,110 ' +
  '142.6,123.5 172.1,172.1 123.5,142.6 110,197.7 96.5,142.6 ' +
  '47.9,172.1 77.4,123.5 22.3,110 77.4,96.5 47.9,47.9 96.5,77.4';

// ─── StarDot sub-component ────────────────────────────────────────────────────

interface StarDotProps {
  x: number;
  y: number;
  r: number;
  delay: number;
  exitProgress: SharedValue<number>;
}

function StarDot({ x, y, r, delay, exitProgress }: StarDotProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.85, { duration: 400 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — opacity is a stable Reanimated ref

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value * (1 - exitProgress.value),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          backgroundColor: colors.textPrimary,
          left: x - r,
          top: y - r,
        },
        style,
      ]}
    />
  );
}

// ─── AnimatedSplash ───────────────────────────────────────────────────────────

type Phase = 'intro' | 'idle' | 'exit';

interface AnimatedSplashProps {
  appReady: boolean;
  onComplete: () => void;
}

export function AnimatedSplash({ appReady, onComplete }: AnimatedSplashProps) {
  const { width, height } = useWindowDimensions();

  const glyphScale   = useSharedValue(GLYPH_INITIAL_SCALE);
  const exitProgress = useSharedValue(0);

  const [phase, setPhase] = useState<Phase>('intro');

  // Track appReady in a ref so the intro timeout can read the current value
  // without creating a closure over stale props.
  const appReadyRef = useRef(appReady);
  useEffect(() => { appReadyRef.current = appReady; }, [appReady]);

  // ── Single effect that owns ALL SharedValue writes ──────────────────────────
  // Reanimated 4 rule: each SharedValue may only be written in ONE effect.
  // appReady is included so idle→exit transition fires when it becomes true.
  // Reanimated 4: withTiming/withSpring callbacks run on JS thread — no runOnJS.
  useEffect(() => {
    cancelAnimation(glyphScale);
    cancelAnimation(exitProgress);

    switch (phase) {
      case 'intro': {
        glyphScale.value = withSpring(1, { damping: 14, stiffness: 80 });
        const t = setTimeout(() => {
          setPhase(appReadyRef.current ? 'exit' : 'idle');
        }, INTRO_DURATION);
        return () => {
          clearTimeout(t);
          cancelAnimation(glyphScale);
        };
      }

      case 'idle': {
        if (appReady) {
          // appReady arrived while in idle — defer setState to avoid cascading renders
          queueMicrotask(() => setPhase('exit'));
          return;
        }
        glyphScale.value = withRepeat(
          withTiming(1.06, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
          -1,
          true,
        );
        return () => cancelAnimation(glyphScale);
      }

      case 'exit': {
        glyphScale.value = withTiming(1, { duration: 150 });
        exitProgress.value = withDelay(
          150,
          withTiming(1, { duration: EXIT_DURATION }, (finished) => {
            if (finished) onComplete();
          }),
        );
        return;
      }
    }
    // glyphScale and exitProgress are stable Reanimated SharedValues (refs) —
    // intentionally excluded from deps to satisfy Reanimated 4's single-owner rule.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, appReady, onComplete]);

  // ── Animated styles ─────────────────────────────────────────────────────────

  const glyphStyle = useAnimatedStyle(() => ({
    opacity: 1 - exitProgress.value,
    transform: [{ scale: glyphScale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: 1 - exitProgress.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, bgStyle]}>
      {STAR_SEEDS.map((seed, i) => (
        <StarDot
          key={i}
          x={seed.xf * width}
          y={seed.yf * height}
          r={seed.r}
          delay={seed.delay}
          exitProgress={exitProgress}
        />
      ))}

      <Animated.View style={[styles.glyphWrapper, glyphStyle]}>
        <Svg width={220} height={220} viewBox="0 0 220 220">
          <Circle cx={110} cy={110} r={100} fill={colors.accentGold} opacity={0.05} />
          <Circle cx={110} cy={110} r={78}  fill={colors.accentGold} opacity={0.08} />
          <Circle
            cx={110} cy={110} r={104}
            fill="none"
            stroke={colors.accentGold}
            strokeWidth={0.8}
            strokeOpacity={0.22}
          />
          {/* Violet depth shadow — pre-scaled points (no deprecated SVG transform props) */}
          <Polygon
            points={STAR_POINTS_SHADOW}
            fill={colors.accentViolet}
            opacity={0.24}
          />
          <Polygon points={STAR_POINTS} fill={colors.accentGold} />
          <Polygon
            points={STAR_POINTS}
            fill="none"
            stroke={colors.textPrimary}
            strokeWidth={1.2}
            strokeOpacity={0.18}
            strokeLinejoin="round"
          />
          <Circle cx={110} cy={110} r={9} fill={colors.accentGold} />
          <Circle cx={110} cy={110} r={3} fill={colors.textPrimary} opacity={0.45} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  glyphWrapper: {},
});
