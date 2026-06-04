// src/app/(tabs)/index.tsx
// Home screen — AskForm, location row, monthly question counter.
// Wires AskForm → useHoraryQuery mutation. Navigation handled in mutation onSuccess.
// Header + form rise in gently on mount.

import { useState, useCallback, useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { AnimatedView, SafeAreaView, ScrollView, View, Text } from '@/tw';
import { CosmosBackground } from '@/components/CosmosBackground';
import { AskForm } from '@/components/AskForm';
import { Banner } from '@/components/ui/Banner';
import { PlanetOrbit } from '@/components/svg/PlanetOrbit';
import {
  LocationPickerSheet,
  type LocationPickerSheetRef,
} from '@/components/LocationPickerSheet';
import { useHoraryQuery } from '@/hooks/useHoraryQuery';
import { useLocation } from '@/hooks/useLocation';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  DEFAULT_HORARY_CATEGORY,
  DEFAULT_SUBJECT_ROLE,
  type HoraryCategory,
  type SubjectRole,
} from '@/constants/config';
import { colors, typography } from '@/constants/theme';
import type { HoraryAPIError } from '@/types/horary';
import type { LocationOverride } from '@/types/location';

export default function HomeScreen() {
  const { t } = useTranslation();
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

  const lastError = mutation.error as HoraryAPIError | null | undefined;
  const isLimitExceeded = lastError?.code === 'LIMIT_EXCEEDED';
  const errorMessage = lastError && !isLimitExceeded
    ? lastError.code === 'NETWORK_ERROR'
      ? t('errors.noInternet')
      : lastError.code === 'TIMEOUT'
        ? t('errors.timeout')
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

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      /* fail silently */
    });
  }, []);

  const handleSubmit = useCallback(() => {
    // Coords come from the override or the resolved default (GPS / home city).
    // Timezone always comes from the device (Intl) — never overridden.
    const coords = override ?? resolvedDefault;
    if (!coords) return;
    const timezone = location?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDismissedError(false);
    setDismissedLimit(false);
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

  useEffect(() => {
    const spring = { damping: 12, stiffness: 90 };
    headerY.value = withSpring(0, spring);
    headerOp.value = withTiming(1, { duration: 350 });
    formY.value = withDelay(100, withSpring(0, spring));
    formOp.value = withDelay(100, withTiming(1, { duration: 350 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        >
          <AnimatedView
            style={headerStyle}
            className="flex-row items-center justify-center gap-2 mb-2"
          >
            <Sparkles color={colors.accentGold} size={typography.xl} />
            <Text className="font-cormorant-medium text-2xl text-text-primary">
              {t('home.title')}
            </Text>
          </AnimatedView>

          {errorMessage && !dismissedError && (
            <Banner
              message={errorMessage}
              type="error"
              onDismiss={() => setDismissedError(true)}
            />
          )}

          {locationMissing && (
            <View>
              <Banner
                message={t('errors.locationDenied')}
                type="warning"
                onDismiss={openSettings}
                dismissLabel={t('a11y.settingsIcon')}
              />
            </View>
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
            <View className="items-center justify-center py-12 gap-6">
              <PlanetOrbit size={140} />
              <Text className="font-cormorant-medium text-lg text-text-primary">
                {t('home.castingChart')}
              </Text>
            </View>
          ) : (
            <AnimatedView style={formStyle}>
              <AskForm
                value={question}
                onChangeText={setQuestion}
                onSubmit={handleSubmit}
                isLoading={mutation.isPending}
                city={resolvedDefault?.city}
                locationSourceLabel={locationSourceLabel}
                locationPending={locationPending}
                locationMissing={locationMissing}
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
