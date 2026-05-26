// src/constants/planets.ts
// Planet glyph and name mapping for SignificatorRow and SVG components.

export const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  NorthNode: '☊',
  SouthNode: '☋',
  Chiron: '⚷',
  Ascendant: 'AC',
  Midheaven: 'MC',
} as const;

export const PLANET_ROLES: Record<string, string> = {
  querent: 'You',
  quesited: 'Your goal',
  moon: 'The Moon',
} as const;

export type PlanetName = keyof typeof PLANET_GLYPHS;
