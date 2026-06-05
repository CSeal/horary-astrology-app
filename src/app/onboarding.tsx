// src/app/onboarding.tsx
// First-run onboarding — 5 steps over a CosmosBackground.
//   Step 0: Welcome (orbit + app name + tagline)
//   Step 1: How it works (Ask → Chart → Verdict cards, staggered entrance)
//   Step 2: Chronicle (journal / streak intro)
//   Step 3: API key setup (optional personal astrology-api.io key)
//   Step 4: Location permission request
// On completion, sets ONBOARDING_COMPLETE in AsyncStorage and navigates Home.
// Root layout reads this flag at boot to gate the route.
// Step transitions cross-fade with directional rise (forward = up, back = down).

import { useState, useCallback, useRef, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {
  BookOpen,
  Flame,
  HelpCircle,
  KeyRound,
  MapPin,
  Sparkles,
  Star,
} from 'lucide-react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import {
  AnimatedView,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from '@/tw';
import { CosmosBackground } from '@/components/CosmosBackground';
import { Button } from '@/components/ui/Button';
import { PlanetGlyph } from '@/components/svg/PlanetGlyph';
import { PlanetOrbit } from '@/components/svg/PlanetOrbit';
import {
  LocationPickerSheet,
  type LocationPickerSheetRef,
} from '@/components/LocationPickerSheet';
import { locationService } from '@/services/locationService';
import { secureKeyService } from '@/services/secureKeyService';
import { useSettingsStore } from '@/stores/settingsStore';
import { colors, typography } from '@/constants/theme';
import type { LocationOverride } from '@/types/location';

const TOTAL_STEPS = 5;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StepDotsProps {
  current: number;
}

function StepDots({ current }: StepDotsProps) {
  return (
    <View className="flex-row gap-2 justify-center" accessibilityRole="tablist">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <StepDot key={i} active={i === current} index={i} />
      ))}
    </View>
  );
}

interface StepDotProps {
  active: boolean;
  index: number;
}

function StepDot({ active, index }: StepDotProps) {
  const scale = useSharedValue(active ? 1 : 0.8);
  const opacity = useSharedValue(active ? 1 : 0.6);

  useEffect(() => {
    scale.value = withSpring(active ? 1 : 0.8, { damping: 14, stiffness: 140 });
    opacity.value = withTiming(active ? 1 : 0.6, { duration: 220 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedView
      style={animatedStyle}
      className={`w-2 h-2 rounded-full ${active ? 'bg-accent-gold' : 'bg-text-disabled'}`}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Step ${index + 1}`}
    />
  );
}

// Generic fade-in + slide-up wrapper used for staggered entrances.
interface StaggerInProps {
  delay: number;
  children: React.ReactNode;
  className?: string;
}

function StaggerIn({ delay, children, className }: StaggerInProps) {
  const enterY = useSharedValue(20);
  const enterOpacity = useSharedValue(0);

  useEffect(() => {
    enterY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 110 }));
    enterOpacity.value = withDelay(delay, withTiming(1, { duration: 320 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
    transform: [{ translateY: enterY.value }],
  }));

  return (
    <AnimatedView style={animatedStyle} className={className}>
      {children}
    </AnimatedView>
  );
}

interface HowCardProps {
  icon: React.ReactNode;
  label: string;
}

function HowCard({ icon, label }: HowCardProps) {
  return (
    <View className="flex-1 bg-bg-card border border-border rounded-2xl p-4 items-center gap-2">
      {icon}
      <Text className="font-inter-medium text-sm text-text-primary text-center">
        {label}
      </Text>
    </View>
  );
}

interface FeaturePointProps {
  icon: React.ReactNode;
  label: string;
}

function FeaturePoint({ icon, label }: FeaturePointProps) {
  return (
    <View className="flex-row items-center gap-3">
      {icon}
      <Text className="flex-1 font-inter text-sm text-text-secondary leading-relaxed">
        {label}
      </Text>
    </View>
  );
}

interface StepBodyProps {
  direction: 'forward' | 'back';
  children: React.ReactNode;
}

function StepBody({ direction, children }: StepBodyProps) {
  const initialY = direction === 'forward' ? 24 : -24;
  const enterY = useSharedValue(initialY);
  const enterOpacity = useSharedValue(0);

  useEffect(() => {
    enterY.value = withSpring(0, { damping: 13, stiffness: 95 });
    enterOpacity.value = withTiming(1, { duration: 320 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
    transform: [{ translateY: enterY.value }],
  }));

  return (
    <AnimatedView
      style={[animatedStyle, { minWidth: SCREEN_WIDTH - 48 }]}
      className="flex-1 items-center justify-center gap-6"
    >
      {children}
    </AnimatedView>
  );
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const setHomeLocation = useSettingsStore((s) => s.setHomeLocation);
  const setHasApiKey = useSettingsStore((s) => s.setHasApiKey);
  const setApiKeySource = useSettingsStore((s) => s.setApiKeySource);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const directionRef = useRef<'forward' | 'back'>('forward');
  const pickerRef = useRef<LocationPickerSheetRef>(null);

  const finish = useCallback(async () => {
    await completeOnboarding();
    router.replace('/');
  }, [completeOnboarding, router]);

  const next = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    directionRef.current = 'forward';
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }, []);

  const back = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    directionRef.current = 'back';
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const handleSaveKey = useCallback(async () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed.length === 0) return;
    setSavingKey(true);
    try {
      await secureKeyService.setKey(trimmed);
      setHasApiKey(true);
      setApiKeySource('personal');
    } finally {
      setSavingKey(false);
      next();
    }
  }, [apiKeyInput, setHasApiKey, setApiKeySource, next]);

  const handleAllowLocation = useCallback(async () => {
    setBusy(true);
    try {
      await locationService.requestPermission();
    } catch {
      // Permission errors are swallowed — user can grant later from Settings.
    } finally {
      setBusy(false);
      await finish();
    }
  }, [finish]);

  // "Continue without location" → pick a default city instead of using GPS.
  const handleSkipLocation = useCallback(() => {
    pickerRef.current?.present();
  }, []);

  // City chosen in the picker becomes the persisted home location (source =
  // 'manual'); onboarding then completes.
  const handlePickHome = useCallback(
    async (loc: LocationOverride) => {
      await setHomeLocation(loc);
      await finish();
    },
    [setHomeLocation, finish]
  );

  return (
    <CosmosBackground>
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-6 py-6 justify-between gap-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Top: skip on steps 1 / 2 / 3 */}
          <View className="flex-row justify-end min-h-11">
            {step >= 1 && step <= 3 ? (
              <TouchableOpacity
                onPress={finish}
                className="min-h-11 min-w-11 px-3 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.skip')}
              >
                <Text className="font-inter text-sm text-text-secondary">
                  {t('onboarding.skip')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Step body — re-mounts on key={step} so entrance animation fires */}
          <StepBody key={step} direction={directionRef.current}>
            {step === 0 && (
              <View className="items-center gap-6">
                <PlanetOrbit size={160} />
                <StaggerIn delay={150} className="items-center">
                  <Text className="font-cormorant-medium text-text-primary text-center text-5xl">
                    {t('appName')}
                  </Text>
                </StaggerIn>
                <StaggerIn delay={300} className="items-center">
                  <Text className="font-inter text-base text-text-secondary text-center leading-relaxed px-4">
                    {t('appTagline')}
                  </Text>
                </StaggerIn>
              </View>
            )}

            {step === 1 && (
              <View className="w-full gap-6">
                <Text className="font-cormorant-medium text-text-primary text-center text-3xl">
                  {t('onboarding.step2Title')}
                </Text>
                <View className="flex-row gap-3">
                  <StaggerIn delay={0} className="flex-1 flex-row">
                    <HowCard
                      icon={
                        <HelpCircle
                          color={colors.accentGold}
                          size={typography.xl}
                        />
                      }
                      label={t('onboarding.step2HowAsk')}
                    />
                  </StaggerIn>
                  <StaggerIn delay={120} className="flex-1 flex-row">
                    <HowCard
                      icon={
                        <PlanetGlyph
                          planet="jupiter"
                          size={typography.xl}
                          color={colors.accentViolet}
                        />
                      }
                      label={t('onboarding.step2HowCast')}
                    />
                  </StaggerIn>
                  <StaggerIn delay={240} className="flex-1 flex-row">
                    <HowCard
                      icon={
                        <Star color={colors.accentGold} size={typography.xl} />
                      }
                      label={t('onboarding.step2HowVerdict')}
                    />
                  </StaggerIn>
                </View>
                <View className="gap-3 mt-2">
                  <Text className="font-inter text-sm text-text-secondary leading-relaxed">
                    1. {t('onboarding.step2Point1')}
                  </Text>
                  <Text className="font-inter text-sm text-text-secondary leading-relaxed">
                    2. {t('onboarding.step2Point2')}
                  </Text>
                  <Text className="font-inter text-sm text-text-secondary leading-relaxed">
                    3. {t('onboarding.step2Point3')}
                  </Text>
                </View>
              </View>
            )}

            {step === 2 && (
              <View className="w-full items-center gap-5">
                <BookOpen color={colors.accentGold} size={48} />
                <Text className="font-cormorant-medium text-text-primary text-center text-3xl">
                  {t('onboarding.chronicleTitle')}
                </Text>
                <Text className="font-inter text-base text-text-primary text-center leading-relaxed px-2">
                  {t('onboarding.chronicleBody')}
                </Text>
                <View className="w-full gap-4 mt-2">
                  <FeaturePoint
                    icon={<Flame color={colors.accentGold} size={16} />}
                    label={t('onboarding.chroniclePoint1')}
                  />
                  <FeaturePoint
                    icon={<BookOpen color={colors.accentViolet} size={16} />}
                    label={t('onboarding.chroniclePoint2')}
                  />
                  <FeaturePoint
                    icon={<Sparkles color={colors.accentGold} size={16} />}
                    label={t('onboarding.chroniclePoint3')}
                  />
                </View>
              </View>
            )}

            {step === 3 && (
              <View className="w-full items-center gap-5">
                <KeyRound color={colors.accentGold} size={48} />
                <Text className="font-cormorant-medium text-text-primary text-center text-3xl">
                  {t('onboarding.step4Title')}
                </Text>
                <Text className="font-inter text-base text-text-primary text-center leading-relaxed px-2">
                  {t('onboarding.step4Body')}
                </Text>
                <TextInput
                  value={apiKeyInput}
                  onChangeText={setApiKeyInput}
                  placeholder={t('settings.apiKeyPlaceholder')}
                  placeholderTextColor={colors.textDisabled}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 font-inter text-base text-text-primary"
                />
                <Text className="font-inter text-xs text-text-disabled text-center leading-relaxed px-2">
                  {t('onboarding.apiKeyNote')}
                </Text>
              </View>
            )}

            {step === 4 && (
              <View className="items-center gap-4">
                <MapPin color={colors.accentGold} size={56} />
                <Text className="font-cormorant-medium text-text-primary text-center text-3xl">
                  {t('onboarding.step3Title')}
                </Text>
                <Text className="font-inter text-base text-text-primary text-center leading-relaxed px-2">
                  {t('onboarding.step3Body')}
                </Text>
                <Text className="font-inter text-sm text-text-secondary text-center leading-relaxed px-2">
                  {t('onboarding.step3Privacy')}
                </Text>
              </View>
            )}
          </StepBody>

          {/* Footer: nav + dots */}
          <View className="gap-4">
            {step === 0 || step === 1 || step === 2 ? (
              <Button
                label={step === 0 ? t('onboarding.getStarted') : t('onboarding.next')}
                variant="primary"
                onPress={next}
              />
            ) : null}

            {step === 3 ? (
              <View className="gap-2">
                <Button
                  label={t('onboarding.step4Enter')}
                  variant="primary"
                  onPress={handleSaveKey}
                  disabled={apiKeyInput.trim().length === 0 || savingKey}
                  loading={savingKey}
                />
                <Button
                  label={t('onboarding.step4Skip')}
                  variant="secondary"
                  onPress={next}
                  disabled={savingKey}
                />
              </View>
            ) : null}

            {step === 4 ? (
              <View className="gap-2">
                <Button
                  label={t('onboarding.step3Button')}
                  variant="primary"
                  onPress={handleAllowLocation}
                  disabled={busy}
                  loading={busy}
                />
                <Button
                  label={t('onboarding.step3SkipButton')}
                  variant="secondary"
                  onPress={handleSkipLocation}
                  disabled={busy}
                />
              </View>
            ) : null}

            {step > 0 && (
              <TouchableOpacity
                onPress={back}
                className="min-h-11 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.back')}
              >
                <Text className="font-inter text-sm text-text-secondary">
                  {t('onboarding.back')}
                </Text>
              </TouchableOpacity>
            )}
            <StepDots current={step} />
          </View>
        </ScrollView>
      </SafeAreaView>

      <LocationPickerSheet
        ref={pickerRef}
        override={null}
        onPick={handlePickHome}
        onUseGps={handleAllowLocation}
      />
    </CosmosBackground>
  );
}
