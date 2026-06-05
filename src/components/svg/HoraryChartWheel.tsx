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

import React, { useEffect } from 'react';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
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

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedG = Animated.createAnimatedComponent(G);

// Total animation timeline. Each element maps a sub-window of `reveal` (0→1)
// to its own draw/fade so a single SharedValue drives the whole stagger.
const REVEAL_DURATION = 1400;

interface RevealLineProps {
  reveal: SharedValue<number>;
  start: number;
  end: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
}

// Radial divider that "draws" itself via strokeDashoffset within [start, end].
function RevealLine({
  reveal,
  start,
  end,
  x1,
  y1,
  x2,
  y2,
  length,
}: RevealLineProps) {
  const animatedProps = useAnimatedProps(() => {
    const t = interpolate(
      reveal.value,
      [start, end],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      strokeDashoffset: length * (1 - t),
      opacity: t,
    };
  });
  return (
    <AnimatedLine
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={colors.border}
      strokeWidth={1}
      strokeDasharray={length}
      animatedProps={animatedProps}
    />
  );
}

interface RevealGlyphProps {
  reveal: SharedValue<number>;
  start: number;
  end: number;
  cx: number;
  cy: number;
  children: React.ReactNode;
}

// Glyph group that springs in (scale + fade) within [start, end] of the reveal.
function RevealGlyph({
  reveal,
  start,
  end,
  cx,
  cy,
  children,
}: RevealGlyphProps) {
  const animatedProps = useAnimatedProps(() => {
    const t = interpolate(
      reveal.value,
      [start, end],
      [0, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(t, [0, 0.6, 1], [0.4, 1.08, 1]);
    return {
      opacity: t,
      transform: `translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`,
    };
  });
  return <AnimatedG animatedProps={animatedProps}>{children}</AnimatedG>;
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

  const reveal = useSharedValue(0);
  useEffect(() => {
    reveal.value = withTiming(1, {
      duration: REVEAL_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

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

  // ── Planet radial-lane collision avoidance ───────────────────────────────
  // Three concentric lanes for the planet ring. If two planets are within
  // COLLISION_DEG of each other they share a radius and their glyphs overlap.
  // We assign each planet the first lane (default → inner → outer) that has
  // no collision with already-placed planets at that lane.
  //
  // Threshold derivation: glyph ≈ R*0.1 px; arc at R*0.48 per degree ≈ 0.84px
  // → glyphs touch when Δ < (R*0.1) / (R*0.48) * (180/π) ≈ 12°.
  const COLLISION_DEG = 12;
  const LANES = [planetRadius, R * 0.36, R * 0.56] as const;

  const angularDiff = (a: number, b: number): number => {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  };

  // Process planets in longitude order so adjacent ones are evaluated together.
  const laneMap = new Map<number, number>(); // original index → assigned radius
  const byLon = data.planets
    .map((p, i) => ({ lon: p.absoluteLongitude, i }))
    .sort((a, b) => a.lon - b.lon);

  for (const { lon, i } of byLon) {
    let chosen = LANES[0];
    for (const lane of LANES) {
      const blocked = [...laneMap.entries()].some(
        ([j, r]) =>
          r === lane &&
          angularDiff(lon, data.planets[j].absoluteLongitude) < COLLISION_DEG
      );
      if (!blocked) { chosen = lane; break; }
    }
    laneMap.set(i, chosen);
  }

  // ── Planets ──────────────────────────────────────────────────────────────
  const planetMarkers = data.planets.map((p, idx) => {
    const pos = point(laneMap.get(idx) ?? planetRadius, p.absoluteLongitude);
    return {
      key: `${p.name}-${idx}`,
      glyph: PLANET_GLYPHS[p.name] ?? p.name.slice(0, 2),
      retro: p.isRetrograde,
      house: p.house,
      pos,
    };
  });

  // ── Stagger timeline ──────────────────────────────────────────────────────
  // The 0→1 reveal is partitioned into ordered phases. Each element gets a
  // [start, end] sub-window so a single SharedValue drives the whole sequence:
  //   lines (zodiac → house) draw first, then glyphs spring in.
  const totalLines = zodiacSectors.length + houseSectors.length;
  const lineSpan = 0.6;
  const lineWindow = (i: number): [number, number] => {
    const slot = (lineSpan / totalLines) * i;
    return [slot, Math.min(slot + 0.25, 1)];
  };
  const totalGlyphs =
    zodiacSectors.length + houseSectors.length + planetMarkers.length;
  const glyphWindow = (i: number): [number, number] => {
    const base = 0.4;
    const slot = base + ((1 - base) / totalGlyphs) * i;
    return [slot, Math.min(slot + 0.3, 1)];
  };

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
        {zodiacSectors.map((s, i) => {
          const [start, end] = lineWindow(i);
          return (
            <RevealLine
              key={`zline-${s.sign}`}
              reveal={reveal}
              start={start}
              end={end}
              x1={s.start.x}
              y1={s.start.y}
              x2={s.end.x}
              y2={s.end.y}
              length={dist(s.start, s.end)}
            />
          );
        })}
        {zodiacSectors.map((s, i) => {
          const [start, end] = glyphWindow(i);
          return (
            <RevealGlyph
              key={`zglyph-${s.sign}`}
              reveal={reveal}
              start={start}
              end={end}
              cx={s.glyphPos.x}
              cy={s.glyphPos.y}
            >
              <SvgText
                x={s.glyphPos.x}
                y={s.glyphPos.y}
                fill={colors.textSecondary}
                fontSize={zodiacGlyphSize}
                textAnchor="middle"
                alignmentBaseline="central"
              >
                {ZODIAC_GLYPHS[s.sign]}
              </SvgText>
            </RevealGlyph>
          );
        })}
      </G>

      {/* House sectors — dividers + numbers */}
      <G>
        {houseSectors.map((s, i) => {
          const [start, end] = lineWindow(zodiacSectors.length + i);
          return (
            <RevealLine
              key={`hline-${s.h}`}
              reveal={reveal}
              start={start}
              end={end}
              x1={s.start.x}
              y1={s.start.y}
              x2={s.end.x}
              y2={s.end.y}
              length={dist(s.start, s.end)}
            />
          );
        })}
        {houseSectors.map((s, i) => {
          const [start, end] = glyphWindow(zodiacSectors.length + i);
          return (
            <RevealGlyph
              key={`hnum-${s.h}`}
              reveal={reveal}
              start={start}
              end={end}
              cx={s.numberPos.x}
              cy={s.numberPos.y}
            >
              <SvgText
                x={s.numberPos.x}
                y={s.numberPos.y}
                fill={colors.textDisabled}
                fontSize={houseNumberSize}
                textAnchor="middle"
                alignmentBaseline="central"
              >
                {s.h}
              </SvgText>
            </RevealGlyph>
          );
        })}
      </G>

      {/* Planets — glyph + retrograde marker */}
      <G>
        {planetMarkers.map((m, i) => {
          const [start, end] = glyphWindow(
            zodiacSectors.length + houseSectors.length + i
          );
          return (
            <RevealGlyph
              key={m.key}
              reveal={reveal}
              start={start}
              end={end}
              cx={m.pos.x}
              cy={m.pos.y}
            >
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
              {/* House number subscript — below planet glyph, dimmed */}
              <SvgText
                x={m.pos.x}
                y={m.pos.y + planetGlyphSize * 0.95}
                fill={colors.textDisabled}
                fontSize={retroSize}
                textAnchor="middle"
                alignmentBaseline="central"
              >
                {m.house}
              </SvgText>
            </RevealGlyph>
          );
        })}
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
