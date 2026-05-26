// src/components/svg/PlanetGlyph.tsx
// Planet symbol SVG renderer.
// Full implementation in Sprint D.
// Color always from theme.ts via props — never inline.

import { Text } from 'react-native';
import { PLANET_GLYPHS } from '../../constants/planets';

interface PlanetGlyphProps {
  planet: string;
  size?: number;
  colorClass?: string;
}

export function PlanetGlyph({ planet, size = 24, colorClass = 'text-accent-violet' }: PlanetGlyphProps) {
  const glyph = PLANET_GLYPHS[planet] ?? planet[0];
  return (
    <Text
      className={colorClass}
      style={{ fontSize: size, lineHeight: size * 1.2 }}
    >
      {glyph}
    </Text>
  );
}
