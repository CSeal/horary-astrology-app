// src/components/VocMoonBanner.tsx
// Void-of-course Moon banner. Rich variant shows the Moon's sign, degrees to the
// next sign, and the sign it enters next, plus a Lilly-exception note when one
// applies. Old journal entries (no detail) fall back to the title row only.

import { useTranslation } from 'react-i18next';
import { View, Text } from '@/tw';

interface VocMoonBannerProps {
  sign?: string;
  degreesToChange?: number;
  nextSign?: string;
  exceptionSign?: string | null;
  vocTreatment?: string;
}

const VOC_TREATMENT_KEY: Record<string, string> = {
  full_negation: 'verdict.vocTreatmentNegation',
  mitigated: 'verdict.vocTreatmentMitigated',
  ignored_due_to_aspect: 'verdict.vocTreatmentIgnored',
};

function MiniTag({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-bg-surface border border-border rounded-md px-2 py-1 flex-row gap-1">
      <Text className="font-mono text-[11px] text-text-secondary">{label}</Text>
      <Text className="font-mono text-[11px] text-text-primary">{value}</Text>
    </View>
  );
}

export function VocMoonBanner({
  sign,
  degreesToChange,
  nextSign,
  exceptionSign,
  vocTreatment,
}: VocMoonBannerProps) {
  const { t } = useTranslation();
  const hasDetail = Boolean(sign);
  const treatmentKey = vocTreatment ? VOC_TREATMENT_KEY[vocTreatment] : undefined;

  return (
    <View className="bg-maybe/10 border border-maybe/30 rounded-xl px-4 py-3">
      <View className="flex-row items-center gap-3">
        <Text className="text-maybe text-2xl leading-none">☽</Text>
        <Text className="flex-1 font-inter-semibold text-sm text-text-primary">
          {t('verdict.vocMoonTitle')}
        </Text>
        <View className="bg-maybe/15 border border-maybe/30 rounded-full px-2 py-0.5">
          <Text className="font-mono text-[9.5px] tracking-wider text-maybe">
            {t('verdict.vocVoidPill')}
          </Text>
        </View>
      </View>

      {hasDetail && (
        <View className="flex-row flex-wrap gap-1.5 mt-3">
          <MiniTag label={t('verdict.vocSignLabel')} value={sign as string} />
          {degreesToChange != null && (
            <MiniTag
              label={t('verdict.vocToChangeLabel')}
              value={`${Math.round(degreesToChange)}°`}
            />
          )}
          {nextSign && (
            <MiniTag label={t('verdict.vocNextLabel')} value={nextSign} />
          )}
        </View>
      )}

      {exceptionSign && (
        <Text className="font-inter text-xs text-text-secondary mt-3 pt-2.5 border-t border-border leading-relaxed">
          {t('verdict.vocExceptionNote', { sign: exceptionSign })}
        </Text>
      )}

      {treatmentKey && (
        <Text className="font-inter text-xs text-text-secondary italic mt-2">
          {t(treatmentKey)}
        </Text>
      )}
    </View>
  );
}
