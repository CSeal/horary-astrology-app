// src/components/ui/Card.tsx
// Base surface card. No inline colors — NativeWind className only.

import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
}

export function Card({ children, elevated = false, className = '', ...props }: CardProps) {
  const baseClass = elevated ? 'bg-bg-card rounded-xl p-6' : 'bg-bg-surface rounded-xl p-6';

  return (
    <View className={`${baseClass} ${className}`} {...props}>
      {children}
    </View>
  );
}
