// src/app/onboarding.tsx
// First-run onboarding — 3 steps over a CosmosBackground.
//   Step 1: Welcome (app name + tagline)
//   Step 2: How it works (Ask → Cast → Verdict cards)
//   Step 3: Location permission request
// On completion, sets ONBOARDING_COMPLETE in AsyncStorage and navigates Home.
// Root layout reads this flag at boot to gate the route.
// Step transitions cross-fade with directional rise (forward = up, back = down).

import { useState, useCallback, useRef, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { HelpCircle, MapPin, Star } from 'lucide-react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AnimatedView, ScrollView, View, Text, TouchableOpacity } from '@/tw';
import { CosmosBackground } from '../components/CosmosBackground';
import { Button } from '../components/ui/Button';
import { PlanetGlyph } from '../components/svg/PlanetGlyph';
import { locationService } from '../services/locationService';
import { ASYNC_STORAGE_KEYS } from '../constants/config';
import { colors, typography } from '../constants/theme';

const TOTAL_STEPS = 3;
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
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const directionRef = useRef<'forward' | 'back'>('forward');

  const finish = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETE, '1');
    } catch {
      // Non-fatal — root layout will retry next boot.
    }
    router.replace('/');
  }, [router]);

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

  const next = useCallback(() => {
    directionRef.current = 'forward';
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }, []);

  const back = useCallback(() => {
    directionRef.current = 'back';
    setStep((s) => Math.max(0, s - 1));
  }, []);

  return (
    <CosmosBackground>
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-6 py-6 justify-between gap-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Top: skip on steps 0 / 1 */}
          <View className="flex-row justify-end min-h-11">
            {step < TOTAL_STEPS - 1 ? (
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
              <View className="items-center gap-4">
                <Text className="font-cormorant-medium text-text-primary text-center text-5xl">
                  {t('appName')}
                </Text>
                <Text className="font-inter text-base text-text-secondary text-center leading-relaxed px-4">
                  {t('appTagline')}
                </Text>
              </View>
            )}

            {step === 1 && (
              <View className="w-full gap-6">
                <Text className="font-cormorant-medium text-text-primary text-center text-3xl">
                  {t('onboarding.step2Title')}
                </Text>
                <View className="flex-row gap-3">
                  <HowCard
                    icon={
                      <HelpCircle
                        color={colors.accentGold}
                        size={typography.xl}
                      />
                    }
                    label={t('onboarding.step2HowAsk')}
                  />
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
                  <HowCard
                    icon={
                      <Star color={colors.accentGold} size={typography.xl} />
                    }
                    label={t('onboarding.step2HowVerdict')}
                  />
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
            {step < TOTAL_STEPS - 1 ? (
              <Button
                label={step === 0 ? t('onboarding.getStarted') : t('onboarding.next')}
                variant="primary"
                onPress={next}
              />
            ) : (
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
                  onPress={finish}
                  disabled={busy}
                />
              </View>
            )}
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
    </CosmosBackground>
  );
}
