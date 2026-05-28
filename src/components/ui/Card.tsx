// src/components/ui/Card.tsx
// Base surface card. No inline colors — NativeWind className only.
// Import View from '@/tw' (NOT react-native) for NativeWind v5 className support.

import { View } from '@/tw';
import type { ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
}

export function Card({
  children,
  elevated = false,
  className = '',
  ...props
}: CardProps) {
  const baseClass = elevated
    ? 'bg-bg-card rounded-2xl p-6'
    : 'bg-bg-surface rounded-2xl p-6';

  return (
    <View className={`${baseClass} ${className}`} {...props}>
      {children}
    </View>
  );
}
