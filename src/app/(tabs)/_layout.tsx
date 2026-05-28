// src/app/(tabs)/_layout.tsx
// Tab navigator: Home (Sparkles), Journal (BookOpen), Settings (Settings icon).
// Tab bar colors from theme.ts tokens — no inline hex values.

import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Sparkles, BookOpen, Settings as SettingsIcon } from 'lucide-react-native';
import { colors, typography } from '../../constants/theme';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSurface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 83,
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
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: t('a11y.journalTab'),
          tabBarAccessibilityLabel: t('a11y.journalTab'),
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('a11y.settingsTab'),
          tabBarAccessibilityLabel: t('a11y.settingsTab'),
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="result/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
