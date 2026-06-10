// src/app/(tabs)/index.tsx
// Home screen — AskForm, location row, monthly question counter.
// Wires AskForm → useHoraryQuery mutation. Navigation handled in mutation onSuccess.
// Header + form rise in gently on mount.

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';
import { AnimatedView, SafeAreaView, ScrollView, View, Text, Pressable } from '@/tw';
import { CosmosBackground } from '@/components/CosmosBackground';
import { AskForm } from '@/components/AskForm';
import { Banner } from '@/components/ui/Banner';
import { PlanetOrbit } from '@/components/svg/PlanetOrbit';
import {
  LocationPickerSheet,
  type LocationPickerSheetRef,
} from '@/components/LocationPickerSheet';
import { dismissKeyboard } from '@/utils/keyboard';
import { useHoraryQuery } from '@/hooks/useHoraryQuery';
import { useLocation } from '@/hooks/useLocation';
import { useJournal } from '@/hooks/useJournal';
import { useStreak } from '@/hooks/useStreak';
import { StreakBadge } from '@/components/StreakBadge';
import { OnThisDayBanner } from '@/components/OnThisDayBanner';
import {
  findOnThisDayEntries,
  isDismissedToday,
  dismissToday,
} from '@/services/onThisDayService';
import { useSettingsStore } from '@/stores/settingsStore';
import { useDebugStore } from '@/stores/debugStore';
import { DEMO_QUESTIONS } from '@/fixtures/demoQuestions';
import {
  DEFAULT_HORARY_CATEGORY,
  DEFAULT_SUBJECT_ROLE,
  type HoraryCategory,
  type SubjectRole,
} from '@/constants/config';
import { colors, typography } from '@/constants/theme';
import type { HoraryAPIError } from '@/types/horary';
import type { JournalEntry } from '@/types/journal';
import type { LocationOverride } from '@/types/location';

// Tappable banner with a subtle press-scale (used for the API-key and
// location-missing prompts). Each instance owns its own scale SharedValue.
function BannerPressable({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedView style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 14, stiffness: 200 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 90 });
        }}
        className="flex-row items-center justify-between bg-bg-surface rounded-xl px-4 py-3 border border-border"
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </Pressable>
    </AnimatedView>
  );
}

// Loading state shown while the chart is being cast — animates its own
// entrance (fade + spring scale) on mount so the spinner doesn't snap in.
function LoadingView({ label }: { label: string }) {
  const op = useSharedValue(0);
  const scale = useSharedValue(0.88);
  useEffect(() => {
    op.value = withTiming(1, { duration: 350 });
    scale.value = withSpring(1, { damping: 14, stiffness: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedView style={style} className="items-center justify-center py-12 gap-6">
      <PlanetOrbit size={140} />
      <Text className="font-cormorant-medium text-lg text-text-primary">{label}</Text>
    </AnimatedView>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isDemoActive = useDebugStore((s) => s.isDemoActive);
  const { entries } = useJournal();
  const { current: currentStreak } = useStreak();
  const [onThisDayEntry, setOnThisDayEntry] = useState<JournalEntry | null>(null);
  const [question, setQuestion] = useState('');
  const [dismissedLimit, setDismissedLimit] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);
  const [override, setOverride] = useState<LocationOverride | null>(null);
  const [category, setCategory] = useState<HoraryCategory>(DEFAULT_HORARY_CATEGORY);
  const [subcategory, setSubcategory] = useState<string | undefined>(undefined);
  const [subjectRole, setSubjectRole] = useState<SubjectRole>(DEFAULT_SUBJECT_ROLE);

  const handleSelectCategory = useCallback((cat: HoraryCategory) => {
    setCategory(cat);
    setSubcategory(undefined); // reset subcategory when category changes
  }, []);

  const { location, permissionStatus } = useLocation();
  const locationSource = useSettingsStore((s) => s.locationSource);
  const homeLocation = useSettingsStore((s) => s.homeLocation);

  // Resolve the default location (used when there's no per-question override):
  //   1. source = 'manual' + home city  → home city (GPS ignored by choice)
  //   2. GPS location available          → GPS
  //   3. GPS unavailable + home city     → home city (auto-fallback)
  const manualActive = locationSource === 'manual' && homeLocation !== null;
  let resolvedDefault: LocationOverride | typeof location = null;
  let defaultSource: 'gps' | 'home' | null = null;
  if (manualActive) {
    resolvedDefault = homeLocation;
    defaultSource = 'home';
  } else if (location) {
    resolvedDefault = location;
    defaultSource = 'gps';
  } else if (homeLocation) {
    resolvedDefault = homeLocation;
    defaultSource = 'home';
  }

  // The mutation's `city` is what's persisted to the journal entry. Override
  // wins (explicit per-question pick); otherwise the resolved default's city.
  const journalCity = override?.city ?? resolvedDefault?.city;
  const mutation = useHoraryQuery(journalCity);

  const pickerRef = useRef<LocationPickerSheetRef>(null);

  const hasApiKey = useSettingsStore((s) => s.hasApiKey);
  // In dev builds an env var key may substitute — suppress the UI guard then.
  const keyMissing = !hasApiKey && !process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY;

  const lastError = mutation.error as HoraryAPIError | null | undefined;
  const isLimitExceeded = lastError?.code === 'LIMIT_EXCEEDED';
  const errorMessage = lastError && !isLimitExceeded
    ? lastError.code === 'NETWORK_ERROR'
      ? t('errors.noInternet')
      : lastError.code === 'TIMEOUT'
        ? t('errors.timeout')
        : lastError.code === 'INVALID_API_KEY'
          ? t('errors.invalidApiKey')
          : t('errors.apiError')
    : null;
  // Pending only while GPS is still resolving AND nothing else is available yet.
  const locationPending =
    permissionStatus === 'loading' && !override && !resolvedDefault;
  // Nothing usable resolved and GPS is done trying → user must set a city.
  const locationMissing =
    !override && !resolvedDefault && permissionStatus !== 'loading';
  const locationSourceLabel =
    defaultSource === 'gps'
      ? t('home.locationGps')
      : defaultSource === 'home'
        ? t('home.locationDefault')
        : undefined;

  const handleSubmit = useCallback(() => {
    // Coords come from the override or the resolved default (GPS / home city).
    // Timezone always comes from the device (Intl) — never overridden.
    const coords = override ?? resolvedDefault;
    if (!coords) return;
    const timezone = location?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDismissedError(false);
    setDismissedLimit(false);
    dismissKeyboard();
    mutation.mutate({
      question: question.trim(),
      category,
      subcategory,
      subject_role: subjectRole,
      latitude: coords.latitude,
      longitude: coords.longitude,
      timezone,
      timestamp: new Date().toISOString(),
    });
  }, [location, override, resolvedDefault, mutation, question, category, subcategory, subjectRole]);

  // Per-question scope — clear override after successful submission so the
  // next question defaults back to GPS.
  useEffect(() => {
    if (mutation.isSuccess && override !== null) {
      setOverride(null);
    }
  }, [mutation.isSuccess, override]);

  // Load the "on this day, a year ago" recall entry (unless dismissed today).
  useEffect(() => {
    isDismissedToday().then((dismissed) => {
      if (dismissed) return;
      const matches = findOnThisDayEntries(entries);
      if (matches.length > 0) setOnThisDayEntry(matches[0]);
    });
  }, [entries]);

  const handleOpenPicker = useCallback(() => {
    pickerRef.current?.present();
  }, []);

  const handlePickLocation = useCallback((picked: LocationOverride) => {
    setOverride(picked);
  }, []);

  const handleClearOverride = useCallback(() => {
    setOverride(null);
  }, []);

  // ── Mount entrance for header + form ──
  const headerY = useSharedValue(20);
  const headerOp = useSharedValue(0);
  const formY = useSharedValue(20);
  const formOp = useSharedValue(0);
  const sparkleScale = useSharedValue(1);

  useEffect(() => {
    const spring = { damping: 12, stiffness: 90 };
    headerY.value = withSpring(0, spring);
    headerOp.value = withTiming(1, { duration: 350 });
    formY.value = withDelay(100, withSpring(0, spring));
    formOp.value = withDelay(100, withTiming(1, { duration: 350 }));
    // Continuous subtle pulse on the sparkles icon (starts after entrance).
    sparkleScale.value = withDelay(
      600,
      withRepeat(withSpring(1.18, { damping: 8, stiffness: 80 }), -1, true)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value }],
  }));

  // ── Demo hint animation — fades in/out when isDemoActive toggles ──
  const demoHintOp = useSharedValue(0);
  const demoHintY = useSharedValue(6);

  useEffect(() => {
    const visible = isDemoActive && question.trim() === '';
    demoHintOp.value = withTiming(visible ? 1 : 0, { duration: 250 });
    demoHintY.value = withTiming(visible ? 0 : 6, { duration: 250 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoActive, question]);

  const demoHintStyle = useAnimatedStyle(() => ({
    opacity: demoHintOp.value,
    transform: [{ translateY: demoHintY.value }],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value,
    transform: [{ translateY: headerY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOp.value,
    transform: [{ translateY: formY.value }],
  }));

  return (
    <CosmosBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 py-4 gap-4"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Pressable onPress={dismissKeyboard} accessible={false}>
          <AnimatedView
            style={headerStyle}
            className="flex-row items-center justify-center gap-2 mb-2"
          >
            <AnimatedView style={sparkleStyle}>
              <Sparkles color={colors.accentGold} size={typography.xl} />
            </AnimatedView>
            <Text className="font-cormorant-medium text-2xl text-text-primary">
              {t('home.title')}
            </Text>
          </AnimatedView>

          {currentStreak > 0 && (
            <View className="items-center -mt-1">
              <StreakBadge streak={currentStreak} />
            </View>
          )}

          {keyMissing && (
            <BannerPressable
              onPress={() => router.push('/(tabs)/settings' as never)}
              accessibilityLabel={t('home.noApiKeyBanner')}
            >
              <Text className="font-inter text-sm text-text-secondary flex-1 mr-2">
                {t('home.noApiKeyBanner')}
              </Text>
              <Text className="font-inter-medium text-sm text-accent-gold">
                {t('home.noApiKeyAction')}
              </Text>
            </BannerPressable>
          )}

          {errorMessage && !dismissedError && (
            <Banner
              message={errorMessage}
              type="error"
              onDismiss={() => setDismissedError(true)}
            />
          )}

          {locationMissing && (
            <BannerPressable
              onPress={handleOpenPicker}
              accessibilityLabel={t('home.chooseCity')}
            >
              <Text className="font-inter text-sm text-text-secondary">
                {t('home.locationDeniedPickCity')}
              </Text>
              <Text className="font-inter-medium text-sm text-accent-gold">
                {t('home.chooseCity')}
              </Text>
            </BannerPressable>
          )}

          {isLimitExceeded && !dismissedLimit && (
            <Banner
              message={t('home.questionLimitBanner')}
              type="warning"
              onDismiss={() => setDismissedLimit(true)}
              // TODO Phase 3: replace this banner with a paywall modal (RevenueCat entitlement gate)
            />
          )}

          {mutation.isPending ? (
            <LoadingView label={t('home.castingChart')} />
          ) : (
            <AnimatedView style={formStyle}>
              <AnimatedView style={demoHintStyle} className="mb-2">
                <Pressable
                  onPress={() => {
                    setQuestion(DEMO_QUESTIONS[category]);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Fill demo question"
                  className="flex-row items-center px-1 py-1"
                >
                  <Text
                    className="font-inter text-xs text-text-secondary"
                    numberOfLines={1}
                  >
                    {`✨ ${DEMO_QUESTIONS[category]}`}
                  </Text>
                </Pressable>
              </AnimatedView>
              <AskForm
                value={question}
                onChangeText={setQuestion}
                onSubmit={handleSubmit}
                isLoading={mutation.isPending}
                city={resolvedDefault?.city}
                locationSourceLabel={locationSourceLabel}
                locationPending={locationPending}
                locationMissing={locationMissing}
                noApiKey={keyMissing}
                category={category}
                onSelectCategory={handleSelectCategory}
                subcategory={subcategory}
                onSelectSubcategory={setSubcategory}
                subjectRole={subjectRole}
                onSelectSubjectRole={setSubjectRole}
                override={override}
                onOpenLocationPicker={handleOpenPicker}
                onClearOverride={handleClearOverride}
              />
            </AnimatedView>
          )}

          {onThisDayEntry && (
            <OnThisDayBanner
              entry={onThisDayEntry}
              onOpen={() => router.push(`/result/${onThisDayEntry.id}` as never)}
              onDismiss={() => {
                dismissToday().catch(() => {});
                setOnThisDayEntry(null);
              }}
            />
          )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <LocationPickerSheet
        ref={pickerRef}
        detectedCity={location?.city}
        override={override}
        onPick={handlePickLocation}
        onUseGps={handleClearOverride}
      />
    </CosmosBackground>
  );
}
