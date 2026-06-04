// src/components/AspectRow.tsx
// One perfection row: planet1 [aspect glyph] planet2 · name · orb detail · state
// pill. State derives from the aspect: separating → Past, applying-hard → Caution,
// applying-soft → Applying. Glyph tint follows the aspect's harmony.

import { useTranslation } from 'react-i18next';
import { View, Text } from '@/tw';
import type { AspectPerfectionData } from '@/types/horary';
import { PLANET_GLYPHS } from '@/constants/planets';
import {
  aspectSymbol,
  aspectTone,
  formatDegrees,
  type AspectTone,
} from '@/constants/zodiac';
import { colors } from '@/constants/theme';

interface AspectRowProps {
  data: AspectPerfectionData;
}

const TONE_COLOR: Record<AspectTone, string> = {
  good: colors.yes,
  bad: colors.no,
  cool: colors.aspectCool,
};

type AspectState = 'applying' | 'caution' | 'past';

const STATE_BG: Record<AspectState, string> = {
  applying: 'bg-yes/15',
  caution: 'bg-no/15',
  past: 'bg-unclear/10',
};

const STATE_COLOR: Record<AspectState, string> = {
  applying: colors.yes,
  caution: colors.no,
  past: colors.unclear,
};

const STATE_LABEL_KEY: Record<AspectState, string> = {
  applying: 'verdict.aspectApplying',
  caution: 'verdict.aspectCaution',
  past: 'verdict.aspectPast',
};

export function AspectRow({ data }: AspectRowProps) {
  const { t } = useTranslation();

  const g1 = PLANET_GLYPHS[data.planet1] ?? data.planet1.slice(0, 2);
  const g2 = PLANET_GLYPHS[data.planet2] ?? data.planet2.slice(0, 2);
  const sym = aspectSymbol(data.aspect_type);
  const tone = aspectTone(data.aspect_type);

  const p1 = t(`planets.${data.planet1}`, { defaultValue: data.planet1 });
  const p2 = t(`planets.${data.planet2}`, { defaultValue: data.planet2 });
  const aspectName = t(`aspectTypes.${data.aspect_type}`, {
    defaultValue: data.aspect_type,
  });
  const name = `${p1} ${aspectName} ${p2}`;

  const state: AspectState = !data.is_applying
    ? 'past'
    : tone === 'bad'
      ? 'caution'
      : 'applying';

  const sub = data.is_applying
    ? t('verdict.aspectApplyingSub', {
        deg: formatDegrees(data.degrees_to_perfection ?? data.orb),
      })
    : t('verdict.aspectPastSub', { deg: formatDegrees(data.orb) });

  return (
    <View className="flex-row items-center bg-bg-card rounded-xl px-4 py-3 gap-3">
      <View className="flex-row items-center">
        <Text className="text-accent-violet text-[17px]">{g1}</Text>
        <Text className="text-[15px] mx-1.5" style={{ color: TONE_COLOR[tone] }}>
          {sym}
        </Text>
        <Text className="text-accent-violet text-[17px]">{g2}</Text>
      </View>

      <View className="flex-1">
        <Text className="font-inter-medium text-sm text-text-primary">{name}</Text>
        <Text className="font-mono text-[11px] text-text-secondary mt-0.5">
          {sub}
        </Text>
      </View>

      <View className={`rounded-full px-2.5 py-1 ${STATE_BG[state]}`}>
        <Text
          className="font-inter-semibold text-[10px]"
          style={{ color: STATE_COLOR[state] }}
        >
          {t(STATE_LABEL_KEY[state])}
        </Text>
      </View>
    </View>
  );
}
