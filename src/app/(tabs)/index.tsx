// src/app/(tabs)/index.tsx
// Home screen — AskForm, location row, monthly question counter.
// Wires AskForm → useHoraryQuery mutation. Navigation handled in mutation onSuccess.
// Header + form rise in gently on mount.

import { useState, useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, Linking } from 'react-native';
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
import {
  LocationPickerSheet,
  type LocationPickerSheetRef,
} from '@/components/LocationPickerSheet';
import { useHoraryQuery } from '@/hooks/useHoraryQuery';
import { useLocation } from '@/hooks/useLocation';
import { useQuestionsStore } from '@/stores/questionsStore';
import { MONTHLY_QUESTION_LIMIT } from '@/constants/config';
import { colors, typography } from '@/constants/theme';
import type { HoraryAPIError } from '@/types/horary';
import type { LocationOverride } from '@/types/location';

export default function HomeScreen() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [dismissedLimit, setDismissedLimit] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);
  const [override, setOverride] = useState<LocationOverride | null>(null);

  const { location, permissionStatus } = useLocation();
  const monthlyCount = useQuestionsStore((s) => s.monthlyCount);

  // The mutation's `city` is what's persisted to the journal entry. When the
  // user has set a manual override, that's the city used for the chart — so
  // pass it to the mutation; otherwise fall back to the GPS-resolved city.
  const journalCity = override?.city ?? location?.city;
  const mutation = useHoraryQuery(journalCity);

  const pickerRef = useRef<LocationPickerSheetRef>(null);

  const lastError = mutation.error as HoraryAPIError | null | undefined;
  const errorMessage = lastError
    ? lastError.code === 'NETWORK_ERROR'
      ? t('errors.noInternet')
      : lastError.code === 'TIMEOUT'
        ? t('errors.timeout')
        : t('errors.apiError')
    : null;

  const limitReached = monthlyCount >= MONTHLY_QUESTION_LIMIT;
  const locationPending = permissionStatus === 'loading';
  const locationDenied = permissionStatus === 'denied';

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      /* fail silently */
    });
  }, []);

  const handleSubmit = useCallback(() => {
    // Override supplies coords; timezone always comes from the device (Intl).
    // If neither override nor GPS is available we can't build a request.
    const coords = override ?? location;
    if (!coords) return;
    const timezone = location?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDismissedError(false);
    mutation.mutate({
      question: question.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
      timezone,
      timestamp: new Date().toISOString(),
    });
  }, [location, override, mutation, question]);

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
              {t('appName')}
            </Text>
          </AnimatedView>

          {errorMessage && !dismissedError && (
            <Banner
              message={errorMessage}
              type="error"
              onDismiss={() => setDismissedError(true)}
            />
          )}

          {locationDenied && (
            <View>
              <Banner
                message={t('errors.locationDenied')}
                type="warning"
                onDismiss={openSettings}
                dismissLabel={t('a11y.settingsIcon')}
              />
            </View>
          )}

          {limitReached && !dismissedLimit && (
            <Banner
              message={t('home.questionLimitBanner', {
                limit: MONTHLY_QUESTION_LIMIT,
              })}
              type="warning"
              onDismiss={() => setDismissedLimit(true)}
            />
          )}

          {mutation.isPending ? (
            <View className="items-center justify-center py-12 gap-4">
              <ActivityIndicator color={colors.accentGold} size="large" />
              <Text className="font-cormorant-medium text-lg text-text-primary">
                {t('home.title')}
              </Text>
            </View>
          ) : (
            <AnimatedView style={formStyle}>
              <AskForm
                value={question}
                onChangeText={setQuestion}
                onSubmit={handleSubmit}
                isLoading={mutation.isPending}
                city={location?.city}
                locationPending={locationPending}
                locationDenied={locationDenied}
                monthlyCount={monthlyCount}
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
