// src/components/ui/Banner.tsx
// Error / warning inline banner. No inline colors — NativeWind className only.

import { View, Text, TouchableOpacity } from 'react-native';

interface BannerProps {
  message: string;
  type?: 'error' | 'warning';
  onDismiss?: () => void;
}

export function Banner({ message, type = 'error', onDismiss }: BannerProps) {
  const containerClass =
    type === 'error'
      ? 'bg-no/10 border border-no/30'
      : 'bg-maybe/10 border border-maybe/30';

  return (
    <View className={`${containerClass} rounded-xl p-3 flex-row items-start`}>
      <Text className="flex-1 text-sm font-inter text-text-primary leading-relaxed">
        {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          className="ml-2 min-w-[44px] min-h-[44px] items-center justify-center"
          accessibilityLabel="Dismiss"
        >
          <Text className="text-text-secondary text-lg">×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
