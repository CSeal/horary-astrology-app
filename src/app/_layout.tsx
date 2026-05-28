// src/app/_layout.tsx
// Root layout: QueryClientProvider, i18n init, font loading, store hydration.
// Native splash is dismissed immediately on mount; AnimatedSplash overlays the
// app tree until fonts + stores + onboarding flag are all ready.

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import i18n from '../i18n/index';
import { useSettingsStore } from '../stores/settingsStore';
import { useQuestionsStore } from '../stores/questionsStore';
import { useDebugStore } from '../stores/debugStore';
import { ASYNC_STORAGE_KEYS } from '../constants/config';
import { AnimatedSplash } from '../components/AnimatedSplash';
import { ForceUpdateScreen } from '../components/ForceUpdateScreen';
import { checkForUpdate, UpdateCheckResult } from '../services/updateCheckService';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* splash auto-hide may have already happened */
});

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
  const forceUpdateOverride = useDebugStore((s) => s.forceUpdateOverride);
  const router = useRouter();
  const segments = useSegments();

  const [storesHydrated, setStoresHydrated] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [updateCheckDone, setUpdateCheckDone] = useState(false);
  const [updateCheck, setUpdateCheck] = useState<UpdateCheckResult | null>(null);

  const [fontsLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_700Bold,
  });

  // Dismiss native splash immediately — AnimatedSplash takes over visually.
  // Both share the same dark background (#070714) so the handoff is seamless.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function prepare() {
      try {
        await Promise.all([hydrateSettings(), hydrateQuestions()]);
      } finally {
        if (!cancelled) setStoresHydrated(true);
      }
    }
    prepare();
    return () => {
      cancelled = true;
    };
  }, [hydrateSettings, hydrateQuestions]);

  // Read onboarding flag once at boot.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const flag = await AsyncStorage.getItem(
          ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETE
        );
        if (!cancelled) setOnboardingComplete(flag === '1');
      } catch {
        // Default to false — onboarding will show again next boot.
      } finally {
        if (!cancelled) setOnboardingChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Run update check in parallel with store hydration and onboarding flag.
  // Fail-open: updateCheckDone is set to true regardless of fetch outcome.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await checkForUpdate();
        if (!cancelled) setUpdateCheck(result);
      } finally {
        if (!cancelled) setUpdateCheckDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  // Gate route: redirect to /onboarding when flag is false; redirect home when
  // user accidentally lands on /onboarding after completion.
  useEffect(() => {
    if (!onboardingChecked || !storesHydrated) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!onboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboardingComplete && inOnboarding) {
      router.replace('/');
    }
  }, [onboardingChecked, onboardingComplete, storesHydrated, segments, router]);

  const isAppReady = Boolean(
    fontsLoaded && storesHydrated && onboardingChecked && updateCheckDone,
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>

      {/* AnimatedSplash sits above everything — removed from tree once done */}
      {!splashDone && (
        <AnimatedSplash
          appReady={isAppReady}
          onComplete={() => setSplashDone(true)}
        />
      )}

      {/* Force-update gate — mounts after splash, cannot be dismissed.
          Debug mode can force it on for testing (in-memory; restart to clear). */}
      {splashDone && (updateCheck?.required || forceUpdateOverride) && (
        <ForceUpdateScreen
          storeUrl={updateCheck?.storeUrl ?? 'https://apps.apple.com'}
        />
      )}
    </GestureHandlerRootView>
  );
}
