// src/components/SignificatorRow.tsx
// Planet row with dignity badge, retrograde symbol.
// Stub — full implementation in Sprint C.

import { View, Text } from 'react-native';
import type { SignificatorData } from '../types/horary';
import { PLANET_GLYPHS, PLANET_ROLES } from '../constants/planets';

interface SignificatorRowProps {
  data: SignificatorData;
}

export function SignificatorRow({ data }: SignificatorRowProps) {
  const glyph = PLANET_GLYPHS[data.planet] ?? data.planet[0];
  const roleLabel = PLANET_ROLES[data.role] ?? data.role;

  return (
    <View className="flex-row items-center bg-bg-card rounded-xl p-3 gap-3">
      <Text className="text-accent-violet text-2xl w-6">{glyph}</Text>
      <View className="flex-1">
        <Text className="font-inter-medium text-base text-text-primary">
          {data.planet}
          {data.retrograde && (
            <Text className="text-no text-sm"> ℞</Text>
          )}
        </Text>
        <Text className="font-inter text-xs text-text-secondary italic">{roleLabel}</Text>
      </View>
      <Text className="font-inter text-sm text-text-secondary">
        {data.sign} · House {data.house}
      </Text>
      {data.dignity && data.dignity !== 'peregrine' && (
        <View
          className={`px-2.5 py-1 rounded-full ${
            data.dignity === 'domicile' || data.dignity === 'exaltation'
              ? 'bg-accent-gold'
              : 'bg-no'
          }`}
        >
          <Text className="text-xs font-inter-semibold text-text-inverse capitalize">
            {data.dignity}
          </Text>
        </View>
      )}
    </View>
  );
}
