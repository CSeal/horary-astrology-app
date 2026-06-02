// src/components/DebugSheet.tsx
// Hidden developer debug menu. Reached only via the 7-tap version-label gesture
// (useDebugTrigger) followed by the build-time PIN (DEBUG_PIN).
// All actions mutate LOCAL device state only. No server-side bypass exists.
//
// isActive resets automatically when the sheet is fully closed (onChange index === -1),
// so the PIN gate is shown again next time the sheet is opened.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import {
  Archive,
  Compass,
  FlaskConical,
  Gauge,
} from 'lucide-react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity } from '@/tw';
import { Button } from '@/components/ui/Button';
import { useQuestionsStore } from '@/stores/questionsStore';
import { useDebugStore } from '@/stores/debugStore';
import { DEBUG_PIN, ASYNC_STORAGE_KEYS } from '@/constants/config';
import { colors, shadows } from '@/constants/theme';
import type { VerdictType } from '@/types/horary';

export interface DebugSheetRef {
  present: () => void;
  dismiss: () => void;
}

const VERDICTS: VerdictType[] = ['YES', 'NO', 'MAYBE', 'UNCLEAR'];

// Cross-platform card elevation: shadow on iOS, elevation on Android.
const cardStyle = Platform.select({
  ios: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
    ...shadows.card,
  },
  android: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  default: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
  },
});

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

  // Reset PIN gate when sheet fully closes so it's always shown on next open.
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        deactivate();
        setPinInput('');
        setPinError(false);
        setStatus(null);
      }
    },
    [deactivate]
  );

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
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.bgSurface }}
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
          <View style={cardStyle}>
            <View style={{ gap: 16 }}>
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
              {pinError ? (
                <Text className="font-inter text-sm text-no">{t('debug.pinError')}</Text>
              ) : null}
              <Button
                label={t('debug.unlock')}
                variant="primary"
                size="sm"
                disabled={pinInput.length === 0}
                onPress={handleVerifyPin}
              />
            </View>
          </View>
        ) : (
          // ── Action menu ───────────────────────────────────────────────────
          <View style={{ gap: 20 }}>

            {/* Status flash */}
            {status ? (
              <View style={{ ...cardStyle, padding: 12 }}>
                <Text className="font-inter-medium text-sm text-yes">✓ {status}</Text>
              </View>
            ) : null}

            {/* STATE */}
            <DebugSection
              title={t('debug.stateSection')}
              hint={t('debug.stateSectionHint')}
              icon={<Archive color={colors.accentGold} size={13} />}
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
              icon={<Compass color={colors.accentGold} size={13} />}
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
              icon={<FlaskConical color={colors.accentGold} size={13} />}
            >
              <DebugToggleRow
                label={t('debug.mockApiToggle')}
                description={t('debug.mockApiToggleHint')}
                value={mockMode}
                onValueChange={setMockMode}
              />
              {mockMode ? (
                <>
                  <Divider />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {VERDICTS.map((v) => {
                      const sel = mockVerdict === v;
                      // MAYBE does not exist in the real API contract (yes/no/unclear/reask_later only).
                      const mockOnly = v === 'MAYBE';
                      return (
                        <TouchableOpacity
                          key={v}
                          onPress={() => setMockVerdict(v)}
                          style={mockOnly ? { borderStyle: 'dashed' } : undefined}
                          className={`px-4 min-h-10 rounded-full items-center justify-center border ${
                            sel ? 'bg-accent-gold border-accent-gold' : 'bg-bg-surface border-border'
                          }`}
                          accessibilityRole="button"
                          accessibilityState={{ selected: sel }}
                        >
                          <Text className={`font-inter-medium text-sm ${sel ? 'text-text-inverse' : 'text-text-primary'}`}>
                            {t(`verdictTypes.${v}`)}
                            {mockOnly ? ' *' : ''}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                    {'* '}
                    {t('debug.maybeOnlyHint')}
                  </Text>
                </>
              ) : null}
            </DebugSection>

            {/* PERFORMANCE */}
            <DebugSection
              title={t('debug.performanceSection')}
              hint={t('debug.performanceSectionHint')}
              icon={<Gauge color={colors.accentGold} size={13} />}
            >
              <DebugToggleRow
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

// ── Sub-components ────────────────────────────────────────────────────────────

function DebugSection({
  title,
  hint,
  icon,
  children,
}: {
  title: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 6 }}>
      {/* Section header — matches Settings style */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon}
        <Text className="text-xs font-inter-semibold text-accent-gold tracking-widest">
          {title}
        </Text>
      </View>
      {hint ? (
        <Text className="font-inter text-xs text-text-secondary">{hint}</Text>
      ) : null}
      {/* Elevated card with cross-platform shadow */}
      <View style={cardStyle}>
        <View style={{ gap: 16 }}>{children}</View>
      </View>
    </View>
  );
}

// Вертикальный ряд: описание сверху → кнопка снизу, полная ширина.
function DebugRow({
  description,
  action,
}: {
  description: string;
  action: React.ReactNode;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text className="font-inter text-xs text-text-secondary leading-relaxed">
        {description}
      </Text>
      {action}
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{ height: 1, backgroundColor: colors.border }}
    />
  );
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
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text className="font-inter-medium text-base text-text-primary" style={{ flex: 1 }}>
          {label}
        </Text>
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
