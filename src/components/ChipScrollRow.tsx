// src/components/ChipScrollRow.tsx
// Horizontal scrollable chip row that auto-centers the selected chip when tapped.
// Each chip can optionally render an icon via a render-function (receives the
// correct color for selected/unselected state so the parent never has to handle it).

import { useRef, useCallback } from 'react';
// eslint-disable-next-line no-restricted-imports
import { ScrollView, type LayoutChangeEvent } from 'react-native'; // needs ref → can't use @/tw wrapper
import * as Haptics from 'expo-haptics';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AnimatedView, View, Text, TouchableOpacity } from '@/tw';
import { colors, typography } from '@/constants/theme';

export interface ChipItem {
  key: string;
  label: string;
  // Render function so the chip can pass the right color automatically.
  icon?: (color: string, size: number) => React.ReactElement;
}

interface ChipScrollRowProps {
  items: ChipItem[];
  selected: string;
  onSelect: (key: string) => void;
  sectionLabel?: string;
}

interface ChipProps {
  item: ChipItem;
  isSelected: boolean;
  onSelect: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}

function Chip({ item, isSelected, onSelect, onLayout }: ChipProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handlePressIn = () => {
    scale.value = withSpring(0.93, { damping: 14, stiffness: 200 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 90 });
  };
  const iconColor = isSelected ? colors.textInverse : colors.textSecondary;

  return (
    <AnimatedView style={animStyle} onLayout={onLayout}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelect();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`flex-row items-center gap-1.5 px-4 min-h-10 rounded-full border ${
          isSelected
            ? 'bg-accent-gold border-accent-gold'
            : 'bg-bg-card border-border'
        }`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        {item.icon ? item.icon(iconColor, typography.sm) : null}
        <Text
          className={`font-inter-medium text-sm ${
            isSelected ? 'text-text-inverse' : 'text-text-primary'
          }`}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    </AnimatedView>
  );
}

export function ChipScrollRow({
  items,
  selected,
  onSelect,
  sectionLabel,
}: ChipScrollRowProps) {
  const scrollRef = useRef<ScrollView>(null);
  const itemLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const containerWidth = useRef(0);

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    containerWidth.current = e.nativeEvent.layout.width;
  }, []);

  const handleItemLayout = useCallback(
    (key: string) => (e: LayoutChangeEvent) => {
      itemLayouts.current[key] = {
        x: e.nativeEvent.layout.x,
        width: e.nativeEvent.layout.width,
      };
    },
    []
  );

  const scrollToChip = useCallback((key: string) => {
    const layout = itemLayouts.current[key];
    if (!layout || !scrollRef.current) return;
    const targetX = layout.x + layout.width / 2 - containerWidth.current / 2;
    scrollRef.current.scrollTo({ x: Math.max(0, targetX), animated: true });
  }, []);

  const handleSelect = useCallback(
    (key: string) => {
      onSelect(key);
      scrollToChip(key);
    },
    [onSelect, scrollToChip]
  );

  return (
    <View className="gap-2">
      {sectionLabel ? (
        <Text className="font-inter-medium text-sm text-text-secondary">
          {sectionLabel}
        </Text>
      ) : null}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onLayout={handleContainerLayout}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {items.map((item) => (
          <Chip
            key={item.key}
            item={item}
            isSelected={item.key === selected}
            onSelect={() => handleSelect(item.key)}
            onLayout={handleItemLayout(item.key)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
