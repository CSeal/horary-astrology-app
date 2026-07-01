// src/app/(tabs)/_layout.tsx
// Tab navigator: Home (Sparkles), Journal (BookOpen), Settings (Settings icon).
// Tab bar colors from theme.ts tokens — no inline hex values.

import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Sparkles, BookOpen, BarChart2, Settings as SettingsIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '@/constants/theme';
import { Pressable } from '@/tw';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

// Render `children` directly (React Navigation's own icon+label layout) so the
// label measures at full width and the icon centers over it identically on iOS
// and Android. Wrapping children in a sizing/animated View broke this: iOS mis-
// centered the icon (~19pt left) and Android truncated labels ("Chronicles" ->
// "Chronicl...") on tab re-render. We keep the press haptic; the press-scale
// bounce is dropped to preserve correct native tab-bar layout.
function TabBarButton({ children, onPress, onLongPress, style, accessibilityState, testID }: BottomTabBarButtonProps) {
  return (
    <Pressable
      style={style}
      onLongPress={onLongPress}
      accessibilityState={accessibilityState}
      testID={testID}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.(e);
      }}
    >
      {children}
    </Pressable>
  );
}

// Height of the visible tab content (icons + labels), independent of safe area.
const TAB_CONTENT_HEIGHT = 56;
// Extra padding between the last label and the system nav bar / home indicator.
const TAB_EXTRA_BOTTOM = 8;

export default function TabsLayout() {
  const { t } = useTranslation();
  const { bottom: bottomInset } = useSafeAreaInsets();

  // Total tab bar height = content area + system inset + breathing room.
  // We set paddingBottom explicitly so React Navigation doesn't double-add the inset.
  const tabBarHeight = TAB_CONTENT_HEIGHT + bottomInset + TAB_EXTRA_BOTTOM;
  const tabBarPaddingBottom = bottomInset + TAB_EXTRA_BOTTOM;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSurface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
        },
        tabBarActiveTintColor: colors.accentGold,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: typography.bodyMedium,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('a11y.homeTab'),
          tabBarAccessibilityLabel: t('a11y.homeTab'),
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: t('a11y.journalTab'),
          tabBarAccessibilityLabel: t('a11y.journalTab'),
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('a11y.statsTab'),
          tabBarAccessibilityLabel: t('a11y.statsTab'),
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('a11y.settingsTab'),
          tabBarAccessibilityLabel: t('a11y.settingsTab'),
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />
    </Tabs>
  );
}
