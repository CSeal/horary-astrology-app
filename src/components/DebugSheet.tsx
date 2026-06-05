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
import { useSettingsStore } from '@/stores/settingsStore';
import { demoService } from '@/services/demoService';
import { DEBUG_PIN, ASYNC_STORAGE_KEYS } from '@/constants/config';
import { colors, shadows } from '@/constants/theme';
import type { VerdictType } from '@/types/horary';
import type { ForceErrorType } from '@/stores/debugStore';
import type { SupportedLocale } from '@/constants/config';

export interface DebugSheetRef {
  present: () => void;
  dismiss: () => void;
}

const VERDICTS: VerdictType[] = ['YES', 'NO', 'MAYBE', 'UNCLEAR'];

type ForceErrorOption = {
  label: string;
  value: ForceErrorType;
};

const FORCE_ERROR_OPTIONS: ForceErrorOption[] = [
  { label: 'None', value: null },
  { label: 'TIMEOUT', value: 'TIMEOUT' },
  { label: 'NET', value: 'NETWORK_ERROR' },
  { label: '401', value: 'INVALID_API_KEY' },
  { label: '429', value: 'LIMIT_EXCEEDED' },
  { label: '5XX', value: 'API_5XX' },
];

type DelayOption = {
  label: string;
  value: 0 | 600 | 2000;
};

const DELAY_OPTIONS: DelayOption[] = [
  { label: 'Instant (0ms)', value: 0 },
  { label: 'Realistic (600ms)', value: 600 },
  { label: 'Slow (2s)', value: 2000 },
];

const LOCALE_OPTIONS: SupportedLocale[] = ['en', 'ru', 'de'];

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
  const isDemoActive = useDebugStore((s) => s.isDemoActive);
  const setIsDemoActive = useDebugStore((s) => s.setIsDemoActive);
  const forceErrorType = useDebugStore((s) => s.forceErrorType);
  const setForceErrorType = useDebugStore((s) => s.setForceErrorType);
  const mockDelayMs = useDebugStore((s) => s.mockDelayMs);
  const setMockDelayMs = useDebugStore((s) => s.setMockDelayMs);

  const entries = useQuestionsStore((s) => s.entries);
  const clearAllEntries = useQuestionsStore((s) => s.clearAllEntries);

  const hasApiKey = useSettingsStore((s) => s.hasApiKey);
  const setHasApiKey = useSettingsStore((s) => s.setHasApiKey);
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (ref) {
      const handle: DebugSheetRef = {
        // Delay expand so the 7-tap gesture's final touch fully resolves before
        // GestureHandler starts tracking — otherwise the finger lift is
        // interpreted as a swipe-down and the sheet closes immediately.
        present: () => setTimeout(() => sheetRef.current?.expand(), 350),
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

  const handleDemoToggle = useCallback(async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsSeeding(true);
    try {
      if (val) {
        await demoService.seed();
        setIsDemoActive(true);
        flashStatus(t('debug.demoActivated'));
      } else {
        await demoService.clear();
        setIsDemoActive(false);
        flashStatus(t('debug.demoCleared'));
      }
    } finally {
      setIsSeeding(false);
    }
  }, [setIsDemoActive, flashStatus, t]);

  const handleLoadPowerUser = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsSeeding(true);
    try {
      await demoService.seed();
      setIsDemoActive(true);
      flashStatus(t('debug.demoPowerLoaded'));
    } finally {
      setIsSeeding(false);
    }
  }, [setIsDemoActive, flashStatus, t]);

  const handleResetNewUser = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsSeeding(true);
    try {
      await demoService.clear();
      setIsDemoActive(false);
      await clearAllEntries();
      flashStatus(t('debug.demoResetDone'));
    } finally {
      setIsSeeding(false);
    }
  }, [setIsDemoActive, clearAllEntries, flashStatus, t]);

  const handleSetDemoApiKey = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setHasApiKey(true);
    flashStatus(t('debug.inspectorApiKeyDone'));
  }, [setHasApiKey, flashStatus, t]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.7}
        // Tap on backdrop must NOT close the sheet — the sheet is hard to open
        // (7-tap gesture) and the user might tap the dim area accidentally
        // while trying to interact with the PIN input. Swipe-down still works.
        pressBehavior="none"
      />
    ),
    []
  );

  const isDemoSeeded = demoService.isDemoSeeded();
  const demoEntryCount = demoService.getDemoEntryCount();

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

            {/* DEMO DATA */}
            <DebugSection
              title={t('debug.demoSection')}
              hint={t('debug.demoSectionHint')}
              icon={<FlaskConical color={colors.accentGold} size={13} />}
            >
              <DebugToggleRow
                label={t('debug.demoToggle')}
                description={t('debug.demoToggleHint')}
                value={isDemoActive}
                onValueChange={handleDemoToggle}
                disabled={isSeeding}
              />
              {isDemoSeeded ? (
                <View
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: colors.bgSurface,
                    borderRadius: 99,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: colors.accentGoldDim,
                  }}
                >
                  <Text style={{ fontSize: 11, color: colors.accentGold, fontFamily: 'Inter_500Medium' }}>
                    {t('debug.demoEntryCount', { count: demoEntryCount })}
                  </Text>
                </View>
              ) : null}
              <Divider />
              <DebugRow
                description={t('debug.demoPowerUserHint')}
                action={
                  <Button
                    label={isSeeding ? t('debug.demoPowerUserLoading') : t('debug.demoPowerUserLabel')}
                    variant="secondary"
                    size="sm"
                    disabled={isSeeding}
                    onPress={handleLoadPowerUser}
                  />
                }
              />
              <Divider />
              <DebugRow
                description={t('debug.demoResetHint')}
                action={
                  <Button
                    label={isSeeding ? t('debug.demoClearingLabel') : t('debug.demoResetLabel')}
                    variant="destructive"
                    size="sm"
                    disabled={isSeeding}
                    onPress={handleResetNewUser}
                  />
                }
              />
            </DebugSection>

            {/* STATE */}
            <DebugSection
              title={t('debug.stateSection')}
              hint={t('debug.stateSectionHint')}
              icon={<Archive color={colors.accentGold} size={13} />}
            >
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

              <Divider />

              {/* Force Error subheader */}
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, textTransform: 'uppercase' }}>
                {t('debug.forceErrorHeader')}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {FORCE_ERROR_OPTIONS.map((opt) => {
                  const sel = forceErrorType === opt.value;
                  const label = opt.value === null ? t('debug.forceErrorNone') : opt.label;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setForceErrorType(opt.value);
                      }}
                      className={`px-3 min-h-9 rounded-lg items-center justify-center border ${
                        sel ? 'border-accent-gold bg-bg-surface' : 'bg-bg-surface border-border'
                      }`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: sel }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Inter_500Medium',
                          color: sel ? colors.accentGold : colors.textSecondary,
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Response Delay subheader */}
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, textTransform: 'uppercase' }}>
                {t('debug.delayHeader')}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {DELAY_OPTIONS.map((opt) => {
                  const sel = mockDelayMs === opt.value;
                  const label = opt.value === 0
                    ? t('debug.delayInstant')
                    : opt.value === 600
                      ? t('debug.delayRealistic')
                      : t('debug.delaySlow');
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setMockDelayMs(opt.value);
                      }}
                      className={`px-3 min-h-9 rounded-lg items-center justify-center border ${
                        sel ? 'border-accent-gold bg-bg-surface' : 'bg-bg-surface border-border'
                      }`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: sel }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Inter_500Medium',
                          color: sel ? colors.accentGold : colors.textSecondary,
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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

            {/* STATE INSPECTOR */}
            <DebugSection
              title={t('debug.inspectorSection')}
              hint={t('debug.inspectorSectionHint')}
              icon={<Gauge color={colors.accentGold} size={13} />}
            >
              <InspectorRow
                label={t('debug.inspectorApiKey')}
                value={hasApiKey ? t('debug.inspectorApiKeySet') : t('debug.inspectorApiKeyMissing')}
                positive={hasApiKey}
              />
              <Divider />
              <InspectorRow
                label={t('debug.inspectorJournal')}
                value={t('debug.inspectorJournalValue', { total: entries.length, demo: demoEntryCount })}
              />
              <Divider />
              <InspectorRow label={t('debug.inspectorLocale')} value={locale} />
              <Divider />
              <InspectorRow
                label={t('debug.inspectorMockMode')}
                value={mockMode ? t('debug.inspectorMockOn', { verdict: mockVerdict }) : t('debug.inspectorMockOff')}
              />
              <Divider />
              <InspectorRow
                label={t('debug.inspectorForceError')}
                value={forceErrorType ?? t('debug.inspectorNone')}
              />

              <Divider />

              {/* Quick actions */}
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, textTransform: 'uppercase' }}>
                {t('debug.inspectorQuickActions')}
              </Text>
              <Button
                label={t('debug.inspectorSetApiKey')}
                variant="secondary"
                size="sm"
                onPress={handleSetDemoApiKey}
              />

              {/* Locale quick-switch */}
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter_400Regular' }}>
                {t('debug.inspectorLocaleSwitch')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {LOCALE_OPTIONS.map((loc) => {
                  const sel = locale === loc;
                  return (
                    <TouchableOpacity
                      key={loc}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setLocale(loc).catch(() => {});
                      }}
                      className={`px-4 min-h-9 rounded-lg items-center justify-center border ${
                        sel ? 'border-accent-gold bg-bg-surface' : 'bg-bg-surface border-border'
                      }`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: sel }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: 'Inter_500Medium',
                          color: sel ? colors.accentGold : colors.textSecondary,
                          textTransform: 'uppercase',
                        }}
                      >
                        {loc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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

// Vertical row: description above → action below, full width.
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

// Toggle row: label + Switch inline, optional description below.
function DebugToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
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
          disabled={disabled}
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

// Read-only label/value row for the State Inspector section.
function InspectorRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          fontFamily: 'Inter_400Regular',
          color: colors.textSecondary,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 13,
          fontFamily: 'Inter_500Medium',
          color: positive === true
            ? colors.yes
            : positive === false
              ? colors.no
              : colors.textPrimary,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
