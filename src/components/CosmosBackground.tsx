// src/components/CosmosBackground.tsx
// Full-screen animated cosmos background layer.
// Renders a StarField filling the parent screen, with a subtle radial-style
// overlay (bg-base on top, bg-surface beneath) for depth.
// Used by Home, Onboarding, Loading and Verdict screens.

import { useWindowDimensions } from 'react-native';
import { View } from '@/tw';
import { StarField } from '@/components/svg/StarField';

interface CosmosBackgroundProps {
  children?: React.ReactNode;
}

export function CosmosBackground({ children }: CosmosBackgroundProps) {
  const { width, height } = useWindowDimensions();

  return (
    <View className="flex-1 bg-bg-base">
      <View
        className="absolute inset-0"
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <StarField width={width} height={height} />
      </View>
      {/* Subtle vignette overlay — bg-surface at low opacity for depth */}
      <View
        className="absolute inset-0 bg-bg-surface/20"
        pointerEvents="none"
      />
      {children}
    </View>
  );
}
