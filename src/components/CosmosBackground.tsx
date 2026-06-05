// src/components/CosmosBackground.tsx
// Full-screen animated cosmos background layer.
// Renders a StarField filling the parent screen, with a subtle radial-style
// overlay (bg-base on top, bg-surface beneath) for depth.
// Used by Home, Onboarding, Loading and Verdict screens.

import type { StyleProp, ViewStyle } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { View, AnimatedView } from '@/tw';
import { StarField } from '@/components/svg/StarField';

interface CosmosBackgroundProps {
  children?: React.ReactNode;
  parallaxStyle?: StyleProp<ViewStyle>;
}

export function CosmosBackground({ children, parallaxStyle }: CosmosBackgroundProps) {
  const { width, height } = useWindowDimensions();

  return (
    <View className="flex-1 bg-bg-base">
      <AnimatedView
        className="absolute inset-0"
        style={parallaxStyle}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <StarField width={width} height={height} />
      </AnimatedView>
      {/* Subtle vignette overlay — bg-surface at low opacity for depth */}
      <View
        className="absolute inset-0 bg-bg-surface/20"
        pointerEvents="none"
      />
      {children}
    </View>
  );
}
