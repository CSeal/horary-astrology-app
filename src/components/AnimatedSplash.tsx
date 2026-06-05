// src/components/AnimatedSplash.tsx
// Cosmos-themed animated splash overlay.
//
// Transition design — seamless native → JS handoff:
//   Native splash shows the zodiac clock face glyph at ~168pt (splash-icon.png / resizeMode contain).
//   AnimatedSplash mounts with glyphScale=0.82 (≈168pt) and glyphOpacity=1 so the
//   glyph appears to be THE SAME object that was already on screen.
//
// Animation phases (driven by `phase` state — ONE effect owns all SharedValue writes):
//   'intro' (0-900ms): Glyph scale 0.82→1.0 via spring. Stars fade in staggered.
//   'idle':            Glyph pulses ×1.06 while waiting for appReady.
//   'exit':            exitProgress 0→1 over 380ms, then onComplete() via runOnJS.

import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Svg, Polygon, Circle, Line } from 'react-native-svg';
import { colors } from '@/constants/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

// Native splash glyph ≈ 168pt (1024px canvas, star 460px, resizeMode contain on 375pt).
// AnimatedSplash at scale 1.0 ≈ 208pt (220px SVG). 168/208 ≈ 0.81.
// Start here so the glyph appears to continue from the native frame.
const GLYPH_INITIAL_SCALE = 0.82;

const INTRO_DURATION = 900; // ms — after this, intro is considered done
const EXIT_DURATION  = 380; // ms — master fade-out duration

// Full-screen centered overlay. Plain style object (not StyleSheet.create) so it
// composes with the Reanimated animated style array. Color comes from theme.ts.
const CONTAINER_STYLE = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: colors.bgBase,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  zIndex: 9999,
};

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
            'worklet';
            if (finished) runOnJS(onComplete)();
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
    <Animated.View style={[CONTAINER_STYLE, bgStyle]}>
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

      <Animated.View style={glyphStyle}>
        <Svg width={220} height={220} viewBox="0 0 220 220">
          {/* Ambient violet glow */}
          <Circle cx={110} cy={110} r={97} fill={colors.accentViolet} fillOpacity={0.12} />
          {/* Outer ring */}
          <Circle cx={110} cy={110} r={97} fill="none" stroke={colors.accentGold} strokeWidth={3.3} strokeOpacity={0.6} />
          {/* Inner reference ring */}
          <Circle cx={110} cy={110} r={75} fill="none" stroke={colors.accentGold} strokeWidth={1.3} strokeOpacity={0.18} />
          {/* Cardinal ticks — 12/3/6/9 o'clock (longer) */}
          <Line x1={110} y1={13}  x2={110} y2={37}  stroke={colors.accentGold} strokeWidth={4}   strokeOpacity={0.9} strokeLinecap="round" />
          <Line x1={207} y1={110} x2={183} y2={110} stroke={colors.accentGold} strokeWidth={4}   strokeOpacity={0.9} strokeLinecap="round" />
          <Line x1={110} y1={207} x2={110} y2={183} stroke={colors.accentGold} strokeWidth={4}   strokeOpacity={0.9} strokeLinecap="round" />
          <Line x1={13}  y1={110} x2={37}  y2={110} stroke={colors.accentGold} strokeWidth={4}   strokeOpacity={0.9} strokeLinecap="round" />
          {/* Minor ticks — 1/2/4/5/7/8/10/11 o'clock (shorter) */}
          <Line x1={158} y1={26}  x2={152} y2={38}  stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={194} y1={62}  x2={182} y2={68}  stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={194} y1={158} x2={182} y2={152} stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={158} y1={194} x2={152} y2={182} stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={62}  y1={194} x2={68}  y2={182} stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={26}  y1={158} x2={38}  y2={152} stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={26}  y1={62}  x2={38}  y2={68}  stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={62}  y1={26}  x2={68}  y2={38}  stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          {/* Pointer hand → 10 o'clock (300° from 12) */}
          <Line x1={110} y1={110} x2={53}  y2={79}  stroke={colors.accentGold} strokeWidth={4.8} strokeLinecap="round" />
          {/* Counterbalance tail */}
          <Line x1={110} y1={110} x2={130} y2={121} stroke={colors.accentGold} strokeWidth={3.1} strokeOpacity={0.5} strokeLinecap="round" />
          {/* 4-point star at pointer tip */}
          <Polygon points="53,67 56,78 66,79 56,80 53,91 50,80 40,79 50,78" fill={colors.accentGold} />
          {/* Center pivot */}
          <Circle cx={110} cy={110} r={7.7} fill={colors.accentGold} />
          <Circle cx={110} cy={110} r={3.3} fill="white" fillOpacity={0.4} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}
