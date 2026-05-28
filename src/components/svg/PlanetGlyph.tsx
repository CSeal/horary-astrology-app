// src/components/svg/PlanetGlyph.tsx
// Planet glyph as an SVG text element so it can compose with other SVG nodes.
// Glyph source: PLANET_GLYPHS in src/constants/planets.ts.
// Color always from theme.ts via `color` prop (default: textPrimary).

import Svg, { Text as SvgText } from 'react-native-svg';
import { colors } from '../../constants/theme';
import { PLANET_GLYPHS } from '../../constants/planets';

export type PlanetKey =
  | 'sun'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'venus'
  | 'mercury';

const PLANET_KEY_MAP: Record<PlanetKey, keyof typeof PLANET_GLYPHS> = {
  sun: 'Sun',
  moon: 'Moon',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  venus: 'Venus',
  mercury: 'Mercury',
};

interface PlanetGlyphProps {
  planet: PlanetKey;
  size?: number;
  color?: string;
}

export function PlanetGlyph({
  planet,
  size = 24,
  color = colors.textPrimary,
}: PlanetGlyphProps) {
  const glyph = PLANET_GLYPHS[PLANET_KEY_MAP[planet]];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <SvgText
        x={size / 2}
        y={size / 2}
        fill={color}
        fontSize={size * 0.85}
        textAnchor="middle"
        alignmentBaseline="central"
      >
        {glyph}
      </SvgText>
    </Svg>
  );
}
