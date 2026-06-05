// src/app/_layout.tsx
// Root layout: QueryClientProvider, i18n init, font loading, store hydration.
// Native splash is dismissed immediately on mount; AnimatedSplash overlays the
// app tree until fonts + stores + onboarding flag are all ready.

// NativeWind v5: must be imported at the app entry so react-native-css
// registers all design tokens (@theme) and utility classes before first render.
// global.css lives at the project root (outside src/), so the @/ alias can't
// reach it — a relative import is the only option here.
// eslint-disable-next-line no-restricted-imports
import '../../global.css';

// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/react-native';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
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
import i18n from '@/i18n/index';
import { useSettingsStore } from '@/stores/settingsStore';
import { useQuestionsStore } from '@/stores/questionsStore';
import { useDebugStore } from '@/stores/debugStore';
import { AnimatedSplash } from '@/components/AnimatedSplash';
import { ForceUpdateScreen } from '@/components/ForceUpdateScreen';
import { checkForUpdate, UpdateCheckResult } from '@/services/updateCheckService';
import { reviewPromptService } from '@/services/reviewPromptService';
import { notificationService } from '@/services/notificationService';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* splash auto-hide may have already happened */
});

// Foreground presentation for scheduled outcome reminders. Without this, a
// notification firing while the app is open is silently suppressed on iOS.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Initialise Sentry as early as possible. No-op when DSN is absent (dev / CI builds).
if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    // Disable in development so errors still surface in the Metro console.
    enabled: !__DEV__,
  });
}

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
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const forceUpdateOverride = useDebugStore((s) => s.forceUpdateOverride);
  const router = useRouter();
  const segments = useSegments();

  const [storesHydrated, setStoresHydrated] = useState(false);
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
        // initInstallDate is idempotent and best-effort — stamp it alongside
        // store hydration so the review-prompt eligibility clock starts on day 1.
        await Promise.all([
          hydrateSettings(),
          hydrateQuestions(),
          reviewPromptService.initInstallDate().catch(() => {}),
        ]);
      } finally {
        if (!cancelled) setStoresHydrated(true);
      }
    }
    prepare();
    return () => {
      cancelled = true;
    };
  }, [hydrateSettings, hydrateQuestions]);

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

  // Stage 6c — outcome reminders. Drop already-fired entries from the queue on
  // open, and deep-link to the relevant result screen when a reminder is tapped.
  useEffect(() => {
    notificationService.pruneExpired().catch(() => {});

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const entryId = response.notification.request.content.data?.entryId as
        | string
        | undefined;
      if (entryId) {
        router.push(`/result/${entryId}` as never);
      }
    });
    return () => sub.remove();
    // router is a stable expo-router ref — listed once, effect runs on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gate route: redirect to /onboarding when flag is false; redirect home when
  // user accidentally lands on /onboarding after completion.
  useEffect(() => {
    if (!storesHydrated) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!onboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboardingComplete && inOnboarding) {
      router.replace('/');
    }
  }, [onboardingComplete, storesHydrated, segments, router]);

  const isAppReady = Boolean(
    fontsLoaded && storesHydrated && updateCheckDone,
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
