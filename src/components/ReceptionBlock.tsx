// src/components/ReceptionBlock.tsx
import { useTranslation } from 'react-i18next';
import { View, Text } from '@/tw';

interface ReceptionBlockProps {
  reception: {
    hasMutual: boolean;
    hasOneWay: boolean;
    type: string | null;
    description: string;
  };
}

export function ReceptionBlock({ reception }: ReceptionBlockProps) {
  const { t } = useTranslation();

  if (!reception.hasMutual && !reception.hasOneWay) {
    return null;
  }

  return (
    <View className="bg-bg-card rounded-xl px-4 py-3 gap-2">
      <View className="flex-row items-center">
        <Text className="font-inter-semibold text-sm text-text-primary">
          {'♄ ↔ ♃  '}
          {t('verdict.receptionTitle')}
        </Text>
        <View className="flex-1" />
        {reception.hasMutual ? (
          <View className="bg-accent-gold rounded-full px-2 py-0.5">
            <Text className="font-inter-semibold text-[10px] text-text-inverse">
              {t('verdict.receptionMutual')}
            </Text>
          </View>
        ) : (
          <View className="bg-accent-violet/20 rounded-full px-2 py-0.5">
            <Text className="font-inter-semibold text-[10px] text-accent-violet">
              {t('verdict.receptionOneWay')}
            </Text>
          </View>
        )}
      </View>

      <Text className="font-inter text-sm text-text-primary leading-relaxed">
        {reception.description}
      </Text>
    </View>
  );
}
