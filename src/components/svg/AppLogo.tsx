// src/components/svg/AppLogo.tsx
// App logo — 8-pointed gold star, same geometry as the splash screen glyph.
// Use wherever the brand mark is needed at small-to-medium sizes.

import { Svg, Polygon, Circle } from 'react-native-svg';
import { colors } from '@/constants/theme';

const STAR_POINTS =
  '110,28 122.6,79.5 168,52 140.5,97.4 192,110 ' +
  '140.5,122.6 168,168 122.6,140.5 110,192 97.4,140.5 ' +
  '52,168 79.5,122.6 28,110 79.5,97.4 52,52 97.4,79.5';

const STAR_SHADOW =
  '110,22.3 123.5,77.4 172.1,47.9 142.6,96.5 197.7,110 ' +
  '142.6,123.5 172.1,172.1 123.5,142.6 110,197.7 96.5,142.6 ' +
  '47.9,172.1 77.4,123.5 22.3,110 77.4,96.5 47.9,47.9 96.5,77.4';

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 32 }: AppLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 220 220">
      <Polygon points={STAR_SHADOW} fill={colors.accentViolet} opacity={0.35} />
      <Polygon points={STAR_POINTS} fill={colors.accentGold} />
      <Circle cx={110} cy={110} r={13} fill={colors.accentGold} />
      <Circle cx={110} cy={110} r={5} fill="white" fillOpacity={0.4} />
    </Svg>
  );
}
