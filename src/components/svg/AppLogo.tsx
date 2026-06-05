// src/components/svg/AppLogo.tsx
// Hora app logo — zodiac clock face.
// A circle with 12 tick marks (4 cardinal + 8 minor) and a pointer hand
// ending in a 4-point star, referencing "hora" (Latin: hour) — the exact
// moment a question is asked in horary astrology.
// viewBox 0 0 100 100, center (50, 50).

import { Svg, Circle, Line, Polygon } from 'react-native-svg';
import { colors } from '@/constants/theme';

// 4-point star at the pointer tip (centered at ~10 o'clock, lon 300° from top).
// Points: center (24, 36), arms extending ±5.5 in each axis.
const TIP_STAR = '24,30.5 25.4,35.5 30,36 25.4,36.5 24,41.5 22.6,36.5 18,36 22.6,35.5';

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 32 }: AppLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Violet ambient fill — approximates a radial glow */}
      <Circle cx={50} cy={50} r={44} fill={colors.accentViolet} fillOpacity={0.12} />

      {/* Outer zodiac ring */}
      <Circle cx={50} cy={50} r={44} fill="none" stroke={colors.accentGold} strokeWidth={1.5} strokeOpacity={0.6} />

      {/* Inner reference ring */}
      <Circle cx={50} cy={50} r={34} fill="none" stroke={colors.accentGold} strokeWidth={0.6} strokeOpacity={0.18} />

      {/* ── Cardinal tick marks (longer, 4 angular houses) ── */}
      <Line x1={50} y1={6}  x2={50} y2={17} stroke={colors.accentGold} strokeWidth={1.8} strokeOpacity={0.9} strokeLinecap="round" />
      <Line x1={94} y1={50} x2={83} y2={50} stroke={colors.accentGold} strokeWidth={1.8} strokeOpacity={0.9} strokeLinecap="round" />
      <Line x1={50} y1={94} x2={50} y2={83} stroke={colors.accentGold} strokeWidth={1.8} strokeOpacity={0.9} strokeLinecap="round" />
      <Line x1={6}  y1={50} x2={17} y2={50} stroke={colors.accentGold} strokeWidth={1.8} strokeOpacity={0.9} strokeLinecap="round" />

      {/* ── Minor tick marks (shorter, 8 cadent positions) ── */}
      <Line x1={72}  y1={11.9} x2={69}  y2={17.1} stroke={colors.accentGold} strokeWidth={1} strokeOpacity={0.4} strokeLinecap="round" />
      <Line x1={88.1} y1={28}  x2={82.9} y2={31}   stroke={colors.accentGold} strokeWidth={1} strokeOpacity={0.4} strokeLinecap="round" />
      <Line x1={88.1} y1={72}  x2={82.9} y2={69}   stroke={colors.accentGold} strokeWidth={1} strokeOpacity={0.4} strokeLinecap="round" />
      <Line x1={72}  y1={88.1} x2={69}  y2={82.9}  stroke={colors.accentGold} strokeWidth={1} strokeOpacity={0.4} strokeLinecap="round" />
      <Line x1={28}  y1={88.1} x2={31}  y2={82.9}  stroke={colors.accentGold} strokeWidth={1} strokeOpacity={0.4} strokeLinecap="round" />
      <Line x1={11.9} y1={72}  x2={17.1} y2={69}   stroke={colors.accentGold} strokeWidth={1} strokeOpacity={0.4} strokeLinecap="round" />
      <Line x1={11.9} y1={28}  x2={17.1} y2={31}   stroke={colors.accentGold} strokeWidth={1} strokeOpacity={0.4} strokeLinecap="round" />
      <Line x1={28}  y1={11.9} x2={31}  y2={17.1}  stroke={colors.accentGold} strokeWidth={1} strokeOpacity={0.4} strokeLinecap="round" />

      {/* ── Pointer hand → ~10 o'clock (300° clockwise from 12) ── */}
      {/* tip: x = 50 + 30·sin(300°) ≈ 24, y = 50 − 30·cos(300°) ≈ 36 */}
      <Line x1={50} y1={50} x2={24} y2={36} stroke={colors.accentGold} strokeWidth={2.2} strokeLinecap="round" />
      {/* short counterbalance tail */}
      <Line x1={50} y1={50} x2={59} y2={55} stroke={colors.accentGold} strokeWidth={1.4} strokeOpacity={0.5} strokeLinecap="round" />

      {/* 4-point star at pointer tip */}
      <Polygon points={TIP_STAR} fill={colors.accentGold} />

      {/* Center pivot */}
      <Circle cx={50} cy={50} r={3.5} fill={colors.accentGold} />
      <Circle cx={50} cy={50} r={1.5} fill="white" fillOpacity={0.4} />
    </Svg>
  );
}
