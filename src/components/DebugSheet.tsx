// src/components/DebugSheet.tsx
// Hidden developer debug menu. Reached only via the 7-tap version-label gesture
// (useDebugTrigger) followed by the build-time PIN (DEBUG_PIN).
// All actions mutate LOCAL device state only. No server-side bypass exists.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity } from '@/tw';
import { useQuestionsStore } from '@/stores/questionsStore';
import { useDebugStore } from '@/stores/debugStore';
import { DEBUG_PIN, ASYNC_STORAGE_KEYS } from '@/constants/config';
import { colors } from '@/constants/theme';
import type { VerdictType } from '@/types/horary';

export interface DebugSheetRef {
  present: () => void;
  dismiss: () => void;
}

const VERDICTS: VerdictType[] = ['YES', 'NO', 'MAYBE', 'UNCLEAR'];

interface DebugSheetProps {
  ref?: React.Ref<DebugSheetRef>;
}

export function DebugSheet({ ref }: DebugSheetProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const sheetRef = useRef<BottomSheet>(null);

  const isActive = useDebugStore((s) => s.isActive);
  const activate = useDebugStore((s) => s.activate);
  const mockMode = useDebugStore((s) => s.mockMode);
  const setMockMode = useDebugStore((s) => s.setMockMode);
  const mockVerdict = useDebugStore((s) => s.mockVerdict);
  const setMockVerdict = useDebugStore((s) => s.setMockVerdict);
  const skipMinLoading = useDebugStore((s) => s.skipMinLoading);
  const setSkipMinLoading = useDebugStore((s) => s.setSkipMinLoading);
  const triggerForceUpdate = useDebugStore((s) => s.triggerForceUpdate);

  const resetMonthlyCount = useQuestionsStore((s) => s.resetMonthlyCount);
  const clearAllEntries = useQuestionsStore((s) => s.clearAllEntries);

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (ref) {
      const handle: DebugSheetRef = {
        present: () => sheetRef.current?.expand(),
        dismiss: () => sheetRef.current?.close(),
      };
      if (typeof ref === 'function') ref(handle);
      else (ref as React.RefObject<DebugSheetRef | null>).current = handle;
    }
  }, [ref]);

  const flashStatus = useCallback((msg: string) => {
    setStatus(msg);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => setStatus(null), 2000);
  }, []);

  const handleVerifyPin = useCallback(() => {
    if (DEBUG_PIN && pinInput === DEBUG_PIN) {
      activate();
      setPinError(false);
      setPinInput('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      setPinError(true);
      setPinInput('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  }, [pinInput, activate]);

  const handleResetCounter = useCallback(async () => {
    await resetMonthlyCount();
    flashStatus(t('debug.resetCounter'));
  }, [resetMonthlyCount, flashStatus, t]);

  const handleClearJournal = useCallback(() => {
    Alert.alert(t('debug.clearJournalConfirm'), '', [
      { text: t('journal.deleteCancel'), style: 'cancel' },
      {
        text: t('debug.clearLabel'),
        style: 'destructive',
        onPress: async () => {
          await clearAllEntries();
          flashStatus(t('debug.clearJournal'));
        },
      },
    ]);
  }, [clearAllEntries, flashStatus, t]);

  const handleResetOnboarding = useCallback(async () => {
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETE);
    sheetRef.current?.close();
    router.replace('/onboarding');
  }, [router]);

  const handleForceUpdate = useCallback(() => {
    sheetRef.current?.close();
    triggerForceUpdate();
  }, [triggerForceUpdate]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.7} />
    ),
    []
  );

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={['85%']}
      enableDynamicSizing={false}
      enablePanDownToClose
      index={-1}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.bgCard }}
      handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView
        contentContainerStyle={{ padding: 20, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-cormorant-medium text-2xl text-text-primary">
          ⚙ {t('debug.title')}
        </Text>

        {!isActive ? (
          // ── PIN gate ──
          <View className="gap-3">
            <Text className="font-inter text-sm text-text-secondary">
              {t('debug.pinHint')}
            </Text>
            <BottomSheetTextInput
              value={pinInput}
              onChangeText={(v) => { setPinInput(v); setPinError(false); }}
              placeholder="PIN"
              placeholderTextColor={colors.textDisabled}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={8}
              style={{
                backgroundColor: colors.bgSurface,
                color: colors.textPrimary,
                fontFamily: 'Inter_400Regular',
                fontSize: 17,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: pinError ? colors.no : colors.border,
                letterSpacing: 8,
              }}
            />
            {pinError && (
              <Text className="font-inter text-sm text-no">{t('debug.pinError')}</Text>
            )}
            <TouchableOpacity
              onPress={handleVerifyPin}
              disabled={pinInput.length === 0}
              className={`min-h-12 rounded-xl items-center justify-center ${
                pinInput.length === 0 ? 'bg-accent-gold-dim' : 'bg-accent-gold'
              }`}
              accessibilityRole="button"
            >
              <Text className="font-inter-semibold text-base text-text-inverse">
                {t('debug.unlock')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ── Action menu ──
          <View className="gap-6">
            {status && (
              <View className="px-3 py-2 rounded-xl bg-bg-surface">
                <Text className="font-inter text-sm text-yes">✓ {status}</Text>
              </View>
            )}

            <DebugSection
              title={t('debug.stateSection')}
              hint={t('debug.stateSectionHint')}
            >
              <DebugButton
                label={t('debug.resetCounter')}
                description={t('debug.resetCounterHint')}
                onPress={handleResetCounter}
              />
              <DebugButton
                label={t('debug.clearJournal')}
                description={t('debug.clearJournalHint')}
                onPress={handleClearJournal}
                destructive
              />
            </DebugSection>

            <DebugSection
              title={t('debug.navigationSection')}
              hint={t('debug.navigationSectionHint')}
            >
              <DebugButton
                label={t('debug.resetOnboarding')}
                description={t('debug.resetOnboardingHint')}
                onPress={handleResetOnboarding}
              />
              <DebugButton
                label={t('debug.triggerForceUpdate')}
                description={t('debug.triggerForceUpdateHint')}
                onPress={handleForceUpdate}
              />
            </DebugSection>

            <DebugSection
              title={t('debug.mockApiSection')}
              hint={t('debug.mockApiSectionHint')}
            >
              <DebugToggle
                label={t('debug.mockApiToggle')}
                description={t('debug.mockApiToggleHint')}
                value={mockMode}
                onValueChange={setMockMode}
              />
              {mockMode && (
                <View className="flex-row flex-wrap gap-2 mt-1">
                  {VERDICTS.map((v) => (
                    <TouchableOpacity
                      key={v}
                      onPress={() => setMockVerdict(v)}
                      className={`px-4 min-h-10 rounded-lg items-center justify-center border ${
                        mockVerdict === v
                          ? 'bg-accent-gold border-accent-gold'
                          : 'bg-bg-surface border-border'
                      }`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: mockVerdict === v }}
                    >
                      <Text
                        className={`font-inter-medium text-sm ${
                          mockVerdict === v ? 'text-text-inverse' : 'text-text-primary'
                        }`}
                      >
                        {t(`verdictTypes.${v}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </DebugSection>

            <DebugSection
              title={t('debug.performanceSection')}
              hint={t('debug.performanceSectionHint')}
            >
              <DebugToggle
                label={t('debug.skipLoadingDelay')}
                description={t('debug.skipLoadingDelayHint')}
                value={skipMinLoading}
                onValueChange={setSkipMinLoading}
              />
            </DebugSection>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

function DebugSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="font-inter-semibold text-xs text-accent-gold tracking-widest">
        {title}
      </Text>
      {hint && (
        <Text className="font-inter text-xs text-text-secondary -mt-1">{hint}</Text>
      )}
      {children}
    </View>
  );
}

function DebugButton({
  label,
  description,
  onPress,
  destructive = false,
}: {
  label: string;
  description?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-xl px-4 py-3 bg-bg-surface border ${
        destructive ? 'border-no' : 'border-border'
      }`}
      accessibilityRole="button"
    >
      <Text
        className={`font-inter text-base ${destructive ? 'text-no' : 'text-text-primary'}`}
      >
        {label}
      </Text>
      {description && (
        <Text className="font-inter text-xs text-text-secondary mt-1">{description}</Text>
      )}
    </TouchableOpacity>
  );
}

function DebugToggle({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="rounded-xl px-4 py-3 bg-bg-surface border border-border gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="font-inter text-base text-text-primary flex-1 mr-3">{label}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.bgCard, true: colors.accentGold }}
          thumbColor={colors.textPrimary}
        />
      </View>
      {description && (
        <Text className="font-inter text-xs text-text-secondary">{description}</Text>
      )}
    </View>
  );
}
