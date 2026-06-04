// src/components/svg/HoraryChartWheel.tsx
// Phase 2b — Western horary chart wheel rendered as SVG.
//
// Layout (outer → inner):
//   • zodiac ring — 12 sign sectors, each with its glyph at the sector center
//   • house ring  — 12 house numbers (Arabic 1-12) at house-cusp midpoints
//   • inner area  — planet glyphs placed at their absolute longitude
//   • AC marker   — "AC" label at the Ascendant (left / 9 o'clock)
//
// Coordinate math:
//   The Ascendant sits at the LEFT (9 o'clock = svgAngle π). Longitudes increase
//   counter-clockwise in the sky, which is clockwise on screen (y-axis flipped).
//   offset(lon)   = (lon - AC_longitude + 360) % 360
//   svgAngle(lon) = π - offset(lon) * π / 180
//   point(r,lon)  = (cx + r·cos(svgAngle), cy + r·sin(svgAngle))

import React from 'react';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { colors } from '@/constants/theme';
import { PLANET_GLYPHS } from '@/constants/planets';
import {
  ZODIAC_SIGNS,
  ZODIAC_GLYPHS,
  expandSign,
  type ZodiacSign,
} from '@/constants/zodiac';
import type { ChartWheelData } from '@/types/journal';

interface HoraryChartWheelProps {
  data: ChartWheelData;
  size?: number;
}

// Resolve a (possibly 3-letter) sign name to its 0-based zodiac index.
function signIndex(sign: string | undefined): number {
  const full = expandSign(sign) as ZodiacSign | undefined;
  const idx = full ? ZODIAC_SIGNS.indexOf(full) : -1;
  return idx === -1 ? 0 : idx;
}

export function HoraryChartWheel({ data, size = 300 }: HoraryChartWheelProps) {
  const R = size / 2;
  const cx = R;
  const cy = R;

  // Ring radii as fractions of R.
  const outerBorder = R * 0.95;
  const zodiacOuter = R * 0.95;
  const zodiacInner = R * 0.76;
  const houseOuter = R * 0.76;
  const houseInner = R * 0.6;
  const planetRadius = R * 0.48;
  const centerDot = R * 0.06;

  // Glyph sizes.
  const zodiacGlyphSize = R * 0.09;
  const houseNumberSize = R * 0.08;
  const planetGlyphSize = R * 0.1;
  const retroSize = R * 0.06;
  const acSize = R * 0.09;

  // Ascendant longitude — sector start of the ascendant sign.
  const acLongitude = signIndex(data.ascendantSign) * 30;

  // Absolute longitude → SVG angle (radians) from the positive-x axis.
  const svgAngle = (lon: number): number => {
    const offset = ((lon - acLongitude + 360) % 360) * (Math.PI / 180);
    return Math.PI - offset;
  };

  // Point at radius r and absolute longitude lon.
  const point = (r: number, lon: number): { x: number; y: number } => {
    const a = svgAngle(lon);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // ── Zodiac ring ──────────────────────────────────────────────────────────
  // Divider line at the start of every sign; glyph at sector center (i*30+15).
  const zodiacSectors = ZODIAC_SIGNS.map((sign, i) => {
    const startLon = i * 30;
    const start = point(zodiacInner, startLon);
    const end = point(zodiacOuter, startLon);
    const glyphPos = point((zodiacInner + zodiacOuter) / 2, startLon + 15);
    return { sign, start, end, glyphPos };
  });

  // ── House ring ───────────────────────────────────────────────────────────
  // House h (1-12) starts at the longitude of its cusp sign; the number sits at
  // the midpoint between this cusp and the next house's cusp.
  const houseStartLon = (h: number): number =>
    signIndex(data.houseSigns[h - 1]) * 30;

  // Midpoint of an arc that may wrap past 360°.
  const arcMidpoint = (fromLon: number, toLon: number): number => {
    const span = (toLon - fromLon + 360) % 360;
    return (fromLon + span / 2) % 360;
  };

  const houseSectors = Array.from({ length: 12 }, (_, idx) => {
    const h = idx + 1;
    const startLon = houseStartLon(h);
    const nextLon = houseStartLon((h % 12) + 1);
    const start = point(houseInner, startLon);
    const end = point(houseOuter, startLon);
    const numberPos = point(
      (houseInner + houseOuter) / 2,
      arcMidpoint(startLon, nextLon)
    );
    return { h, start, end, numberPos };
  });

  // ── Planets ──────────────────────────────────────────────────────────────
  const planetMarkers = data.planets.map((p, idx) => {
    const pos = point(planetRadius, p.absoluteLongitude);
    return {
      key: `${p.name}-${idx}`,
      glyph: PLANET_GLYPHS[p.name] ?? p.name.slice(0, 2),
      retro: p.isRetrograde,
      pos,
    };
  });

  return (
    <Svg width={size} height={size}>
      {/* Outer zodiac ring fill */}
      <Circle cx={cx} cy={cy} r={zodiacOuter} fill={colors.bgOverlay} />
      {/* House ring fill */}
      <Circle cx={cx} cy={cy} r={houseOuter} fill={colors.bgSurface} />
      {/* Inner planet area fill */}
      <Circle cx={cx} cy={cy} r={houseInner} fill={colors.bgCard} />

      {/* Ring borders */}
      <G>
        <Circle
          cx={cx}
          cy={cy}
          r={outerBorder}
          stroke={colors.border}
          strokeWidth={1}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={zodiacInner}
          stroke={colors.border}
          strokeWidth={1}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={houseInner}
          stroke={colors.border}
          strokeWidth={1}
          fill="none"
        />
      </G>

      {/* Zodiac sectors — dividers + glyphs */}
      <G>
        {zodiacSectors.map((s) => (
          <Line
            key={`zline-${s.sign}`}
            x1={s.start.x}
            y1={s.start.y}
            x2={s.end.x}
            y2={s.end.y}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}
        {zodiacSectors.map((s) => (
          <SvgText
            key={`zglyph-${s.sign}`}
            x={s.glyphPos.x}
            y={s.glyphPos.y}
            fill={colors.textSecondary}
            fontSize={zodiacGlyphSize}
            textAnchor="middle"
            alignmentBaseline="central"
          >
            {ZODIAC_GLYPHS[s.sign]}
          </SvgText>
        ))}
      </G>

      {/* House sectors — dividers + numbers */}
      <G>
        {houseSectors.map((s) => (
          <Line
            key={`hline-${s.h}`}
            x1={s.start.x}
            y1={s.start.y}
            x2={s.end.x}
            y2={s.end.y}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}
        {houseSectors.map((s) => (
          <SvgText
            key={`hnum-${s.h}`}
            x={s.numberPos.x}
            y={s.numberPos.y}
            fill={colors.textDisabled}
            fontSize={houseNumberSize}
            textAnchor="middle"
            alignmentBaseline="central"
          >
            {s.h}
          </SvgText>
        ))}
      </G>

      {/* Planets — glyph + retrograde marker */}
      <G>
        {planetMarkers.map((m) => (
          <G key={m.key}>
            <SvgText
              x={m.pos.x}
              y={m.pos.y}
              fill={colors.accentGold}
              fontSize={planetGlyphSize}
              textAnchor="middle"
              alignmentBaseline="central"
            >
              {m.glyph}
            </SvgText>
            {m.retro && (
              <SvgText
                x={m.pos.x + planetGlyphSize * 0.7}
                y={m.pos.y + planetGlyphSize * 0.5}
                fill={colors.no}
                fontSize={retroSize}
                textAnchor="middle"
                alignmentBaseline="central"
              >
                ℞
              </SvgText>
            )}
          </G>
        ))}
      </G>

      {/* AC marker at the Ascendant (left / 9 o'clock) */}
      <SvgText
        x={cx - houseOuter - 8}
        y={cy}
        fill={colors.accentGold}
        fontSize={acSize}
        textAnchor="middle"
        alignmentBaseline="central"
      >
        AC
      </SvgText>

      {/* Center dot */}
      <Circle cx={cx} cy={cy} r={centerDot} fill={colors.accentGold} />
    </Svg>
  );
}
