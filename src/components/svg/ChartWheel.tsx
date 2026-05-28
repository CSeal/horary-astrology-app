// src/components/svg/ChartWheel.tsx
// Phase 2 placeholder for the horary chart wheel.
// MVP renders an empty ring with 12 house divisions and a centered
// "Chart wheel — Phase 2" label. Colors from theme.ts.

import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface ChartWheelProps {
  size?: number;
  label?: string;
}

export function ChartWheel({
  size = 200,
  label = 'Chart wheel — Phase 2',
}: ChartWheelProps) {
  const center = size / 2;
  const outerR = size * 0.48;
  const innerR = size * 0.32;

  // 12 house divisions — radial lines from inner ring to outer ring.
  const lines = Array.from({ length: 12 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    return {
      x1: center + Math.cos(angle) * innerR,
      y1: center + Math.sin(angle) * innerR,
      x2: center + Math.cos(angle) * outerR,
      y2: center + Math.sin(angle) * outerR,
    };
  });

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={center}
        cy={center}
        r={outerR}
        stroke={colors.border}
        strokeWidth={1}
        fill="none"
      />
      <Circle
        cx={center}
        cy={center}
        r={innerR}
        stroke={colors.border}
        strokeWidth={1}
        fill="none"
      />
      {lines.map((l, i) => (
        <Line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={colors.border}
          strokeWidth={1}
        />
      ))}
      <SvgText
        x={center}
        y={center}
        fill={colors.textSecondary}
        fontSize={size * 0.06}
        textAnchor="middle"
        alignmentBaseline="central"
      >
        {label}
      </SvgText>
    </Svg>
  );
}
