// src/app/_layout.tsx
// Root layout: QueryClientProvider, i18n init, font loading, store hydration.
// Splash screen held until fonts and stores are ready.

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import '../i18n/index';
import { useSettingsStore } from '../stores/settingsStore';
import { useQuestionsStore } from '../stores/questionsStore';
import i18n from '../i18n/index';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export default function RootLayout() {
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateQuestions = useQuestionsStore((s) => s.hydrate);
  const locale = useSettingsStore((s) => s.locale);

  useEffect(() => {
    async function prepare() {
      await Promise.all([hydrateSettings(), hydrateQuestions()]);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
