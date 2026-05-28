// src/components/DebugSheet.tsx
// Hidden developer debug menu. Reached only via the 7-tap version-label gesture
// (useDebugTrigger) followed by the build-time PIN (DEBUG_PIN). Strings here are
// intentionally hardcoded English and NOT in the i18n bundle — keeping debug
// vocabulary out of the shipped translation files.
//
// All actions mutate LOCAL device state only. No server-side bypass exists.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity } from '@/tw';
import { useQuestionsStore } from '../stores/questionsStore';
import { useDebugStore } from '../stores/debugStore';
import { DEBUG_PIN, ASYNC_STORAGE_KEYS } from '../constants/config';
import { colors } from '../constants/theme';
import type { VerdictType } from '../types/horary';

export interface DebugSheetRef {
  present: () => void;
  dismiss: () => void;
}

const VERDICTS: VerdictType[] = ['YES', 'NO', 'MAYBE', 'UNCLEAR'];

interface DebugSheetProps {
  ref?: React.Ref<DebugSheetRef>;
}

export function DebugSheet({ ref }: DebugSheetProps) {
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
    setTimeout(() => setStatus(null), 2000);
  }, []);

  const handleVerifyPin = useCallback(() => {
    // DEBUG_PIN is null when EXPO_PUBLIC_DEBUG_PIN is unset → gate never opens.
    if (DEBUG_PIN && pinInput === DEBUG_PIN) {
      activate();
      setPinError(false);
      setPinInput('');
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});
    } else {
      setPinError(true);
      setPinInput('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
    }
  }, [pinInput, activate]);

  const handleResetCounter = useCallback(async () => {
    await resetMonthlyCount();
    flashStatus('Monthly counter reset to 0');
  }, [resetMonthlyCount, flashStatus]);

  const handleClearJournal = useCallback(() => {
    Alert.alert('Clear all journal entries?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearAllEntries();
          flashStatus('Journal cleared');
        },
      },
    ]);
  }, [clearAllEntries, flashStatus]);

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
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.7}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={['85%']}
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
          ⚙ Debug Mode
        </Text>

        {!isActive ? (
          // ── PIN gate ──
          <View className="gap-3">
            <Text className="font-inter text-sm text-text-secondary">
              Enter developer PIN to continue.
            </Text>
            <BottomSheetTextInput
              value={pinInput}
              onChangeText={(v) => {
                setPinInput(v);
                setPinError(false);
              }}
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
              <Text className="font-inter text-sm text-no">
                Incorrect PIN.
              </Text>
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
                Unlock
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

            <DebugSection title="STATE">
              <DebugButton
                label="Reset monthly counter → 0"
                onPress={handleResetCounter}
              />
              <DebugButton
                label="Clear all journal entries"
                onPress={handleClearJournal}
                destructive
              />
            </DebugSection>

            <DebugSection title="NAVIGATION">
              <DebugButton
                label="Reset onboarding (re-run first launch)"
                onPress={handleResetOnboarding}
              />
              <DebugButton
                label="Trigger force-update screen"
                onPress={handleForceUpdate}
              />
            </DebugSection>

            <DebugSection title="MOCK API">
              <DebugToggle
                label="Mock API responses"
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
                          mockVerdict === v
                            ? 'text-text-inverse'
                            : 'text-text-primary'
                        }`}
                      >
                        {v}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </DebugSection>

            <DebugSection title="PERFORMANCE">
              <DebugToggle
                label="Skip min loading delay (1.5s)"
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="font-inter-semibold text-xs text-accent-gold tracking-widest">
        {title}
      </Text>
      {children}
    </View>
  );
}

function DebugButton({
  label,
  onPress,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`min-h-12 rounded-xl px-4 justify-center bg-bg-surface border ${
        destructive ? 'border-no' : 'border-border'
      }`}
      accessibilityRole="button"
    >
      <Text
        className={`font-inter text-base ${
          destructive ? 'text-no' : 'text-text-primary'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DebugToggle({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between min-h-12 px-4 rounded-xl bg-bg-surface border border-border">
      <Text className="font-inter text-base text-text-primary flex-1">
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.bgCard, true: colors.accentGold }}
        thumbColor={colors.textPrimary}
      />
    </View>
  );
}
