// src/components/KeyFactorsBlock.tsx
import { useTranslation } from 'react-i18next';
import { View, Text } from '@/tw';

interface KeyFactorsBlockProps {
  factors: string[];
}

export function KeyFactorsBlock({ factors }: KeyFactorsBlockProps) {
  const { t } = useTranslation();

  if (factors.length === 0) {
    return null;
  }

  return (
    <View className="bg-bg-card rounded-xl px-4 py-3 gap-1.5">
      <Text className="font-inter-semibold text-[11px] text-accent-gold uppercase tracking-[2px]">
        {t('verdict.keyFactorsTitle')}
      </Text>
      {factors.map((factor, idx) => (
        <Text
          key={`${idx}-${factor}`}
          className="font-inter text-sm text-text-primary"
        >
          {`· ${factor}`}
        </Text>
      ))}
    </View>
  );
}
