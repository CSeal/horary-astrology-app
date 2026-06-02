// src/components/DebugSheet.tsx
// Hidden developer debug menu. Reached only via the 7-tap version-label gesture
// (useDebugTrigger) followed by the build-time PIN (DEBUG_PIN).
// All actions mutate LOCAL device state only. No server-side bypass exists.
//
// NOTE: Zustand state is in-memory and persists across Fast Refresh in the same
// Metro session. Use the "Lock" button or full app restart to re-show the PIN gate.

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
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
  const deactivate = useDebugStore((s) => s.deactivate);
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
    setTimeout(() => setStatus(null), 2500);
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

  const handleLock = useCallback(() => {
    deactivate();
    sheetRef.current?.close();
  }, [deactivate]);

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
      snapPoints={['90%']}
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
        contentContainerStyle={{ padding: 20, gap: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-cormorant-medium text-2xl text-text-primary">
          ⚙ {t('debug.title')}
        </Text>

        {!isActive ? (
          // ── PIN gate ──────────────────────────────────────────────────────
          <Card elevated>
            <View className="gap-4">
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
              <Button
                label={t('debug.unlock')}
                variant="primary"
                size="sm"
                disabled={pinInput.length === 0}
                onPress={handleVerifyPin}
              />
            </View>
          </Card>
        ) : (
          // ── Action menu ───────────────────────────────────────────────────
          <View className="gap-6">

            {/* Status flash */}
            {status && (
              <Card>
                <Text className="font-inter-medium text-sm text-yes">✓ {status}</Text>
              </Card>
            )}

            {/* STATE */}
            <DebugSection
              title={t('debug.stateSection')}
              hint={t('debug.stateSectionHint')}
            >
              <DebugRow
                description={t('debug.resetCounterHint')}
                action={
                  <Button
                    label={t('debug.resetCounter')}
                    variant="secondary"
                    size="sm"
                    onPress={handleResetCounter}
                  />
                }
              />
              <Divider />
              <DebugRow
                description={t('debug.clearJournalHint')}
                action={
                  <Button
                    label={t('debug.clearJournal')}
                    variant="destructive"
                    size="sm"
                    onPress={handleClearJournal}
                  />
                }
              />
            </DebugSection>

            {/* NAVIGATION */}
            <DebugSection
              title={t('debug.navigationSection')}
              hint={t('debug.navigationSectionHint')}
            >
              <DebugRow
                description={t('debug.resetOnboardingHint')}
                action={
                  <Button
                    label={t('debug.resetOnboarding')}
                    variant="secondary"
                    size="sm"
                    onPress={handleResetOnboarding}
                  />
                }
              />
              <Divider />
              <DebugRow
                description={t('debug.triggerForceUpdateHint')}
                action={
                  <Button
                    label={t('debug.triggerForceUpdate')}
                    variant="secondary"
                    size="sm"
                    onPress={handleForceUpdate}
                  />
                }
              />
            </DebugSection>

            {/* MOCK API */}
            <DebugSection
              title={t('debug.mockApiSection')}
              hint={t('debug.mockApiSectionHint')}
            >
              <DebugToggleRow
                label={t('debug.mockApiToggle')}
                description={t('debug.mockApiToggleHint')}
                value={mockMode}
                onValueChange={setMockMode}
              />
              {mockMode && (
                <>
                  <Divider />
                  <View className="flex-row flex-wrap gap-2">
                    {VERDICTS.map((v) => {
                      const sel = mockVerdict === v;
                      return (
                        <TouchableOpacity
                          key={v}
                          onPress={() => setMockVerdict(v)}
                          className={`px-4 min-h-10 rounded-full items-center justify-center border ${
                            sel ? 'bg-accent-gold border-accent-gold' : 'bg-bg-surface border-border'
                          }`}
                          accessibilityRole="button"
                          accessibilityState={{ selected: sel }}
                        >
                          <Text className={`font-inter-medium text-sm ${sel ? 'text-text-inverse' : 'text-text-primary'}`}>
                            {t(`verdictTypes.${v}`)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </DebugSection>

            {/* PERFORMANCE */}
            <DebugSection
              title={t('debug.performanceSection')}
              hint={t('debug.performanceSectionHint')}
            >
              <DebugToggleRow
                label={t('debug.skipLoadingDelay')}
                description={t('debug.skipLoadingDelayHint')}
                value={skipMinLoading}
                onValueChange={setSkipMinLoading}
              />
            </DebugSection>

            {/* LOCK — re-show PIN gate (needed after Fast Refresh) */}
            <Button
              label={t('debug.lockLabel')}
              variant="destructive"
              size="sm"
              onPress={handleLock}
            />

          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
      <Text className="text-xs font-inter-semibold text-accent-gold tracking-widest">
        {title}
      </Text>
      {hint ? (
        <Text className="font-inter text-xs text-text-secondary">{hint}</Text>
      ) : null}
      <Card elevated>
        <View className="gap-4">{children}</View>
      </Card>
    </View>
  );
}

// Вертикальный ряд: описание → кнопка на полную ширину.
function DebugRow({
  description,
  action,
}: {
  description: string;
  action: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="font-inter text-xs text-text-secondary leading-relaxed">
        {description}
      </Text>
      {action}
    </View>
  );
}

// Разделитель между рядами внутри карточки.
function Divider() {
  return <View className="h-px bg-border" />;
}

// Ряд тогла: label + Switch в одну строку, описание снизу.
function DebugToggleRow({
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
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="font-inter-medium text-base text-text-primary flex-1">{label}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.bgSurface, true: colors.accentGold }}
          thumbColor={colors.textPrimary}
        />
      </View>
      {description ? (
        <Text className="font-inter text-xs text-text-secondary">{description}</Text>
      ) : null}
    </View>
  );
}
