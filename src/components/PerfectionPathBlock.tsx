// src/components/PerfectionPathBlock.tsx
import { useTranslation } from 'react-i18next';
import { View, Text } from '@/tw';

interface PerfectionPathBlockProps {
  perfectionPath: {
    enablesPerfection: boolean;
    preventsPerfection: boolean;
    hasDirectAspect: boolean;
    summary: string;
  };
}

export function PerfectionPathBlock({ perfectionPath }: PerfectionPathBlockProps) {
  const { t } = useTranslation();
  const { enablesPerfection, preventsPerfection } = perfectionPath;

  const showEnables = enablesPerfection && !preventsPerfection;
  const showBlocks = preventsPerfection;

  return (
    <View className="bg-bg-card rounded-xl px-4 py-3 gap-2">
      <View className="flex-row items-center">
        <Text className="font-inter-semibold text-sm text-text-primary">
          {t('verdict.perfectionTitle')}
        </Text>
        <View className="flex-1" />
        {showEnables && (
          <View className="bg-yes/20 rounded-full px-2 py-0.5">
            <Text className="font-inter-semibold text-[10px] text-yes">
              {t('verdict.perfectionEnables')}
            </Text>
          </View>
        )}
        {showBlocks && (
          <View className="bg-no/20 rounded-full px-2 py-0.5">
            <Text className="font-inter-semibold text-[10px] text-no">
              {t('verdict.perfectionBlocks')}
            </Text>
          </View>
        )}
      </View>

      <Text className="font-inter text-sm text-text-secondary leading-relaxed">
        {perfectionPath.summary}
      </Text>
    </View>
  );
}
