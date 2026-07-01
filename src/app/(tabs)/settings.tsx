// src/app/(tabs)/settings.tsx
// Settings screen — language toggle, timezone display, monthly counter,
// API key management (via SecureStore).
// Cards stagger in from below on mount.
//
// Re-render isolation:
//   ApiKeySection  — owns editingKey/apiKeyInput/savingKey; keyboardDidHide listener.
//                    Keystroke re-renders stay local, never propagate to other sections.
//   NotificationsSection — owns notifPermissionDenied state.

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, Share, Linking, Switch, Keyboard, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import {
  Globe,
  Key,
  MapPin,
  Star,
  Clock,
  Bell,
  Pencil,
  Share2,
  Heart,
  ChevronRight,
} from 'lucide-react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedKeyboard,
  withSpring,
  withTiming,
  withDelay,
  type SharedValue,
  type AnimatedStyle,
} from 'react-native-reanimated';
import {
  AnimatedView,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from '@/tw';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DebugSheet, type DebugSheetRef } from '@/components/DebugSheet';
import {
  LocationPickerSheet,
  type LocationPickerSheetRef,
} from '@/components/LocationPickerSheet';
import { useSettingsStore } from '@/stores/settingsStore';
import { secureKeyService } from '@/services/secureKeyService';
import { notificationService } from '@/services/notificationService';
import { AppLogo } from '@/components/svg/AppLogo';
import { useDebugTrigger } from '@/hooks/useDebugTrigger';
import {
  ZODIAC_TYPES,
  APP_STORE_URL_INVITE,
  APP_STORE_REVIEW_URL,
  type SupportedLocale,
  type ZodiacType,
} from '@/constants/config';
import { colors, typography } from '@/constants/theme';
import type { LocationOverride } from '@/types/location';

const LANGUAGES: { code: SupportedLocale; flag: string; label: string }[] = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'uk', flag: '🇺🇦', label: 'Українська' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'pt', flag: '🇧🇷', label: 'Português' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
];

// ─── ApiKeySection ────────────────────────────────────────────────────────────
// Owns editingKey / apiKeyInput / savingKey so that controlled-input keystrokes
// do NOT trigger a re-render of the parent screen or any other section.

interface ApiKeySectionProps {
  animStyle: AnimatedStyle<ViewStyle>;
  // Reports edit-mode transitions so the parent can size the keyboard spacer
  // only while the key is actually being edited (no idle empty space).
  onEditingChange?: (editing: boolean) => void;
}

const ApiKeySection = React.memo(function ApiKeySection({
  animStyle,
  onEditingChange,
}: ApiKeySectionProps) {
  const { t } = useTranslation();
  const apiKeySource = useSettingsStore((s) => s.apiKeySource);
  const setApiKeySource = useSettingsStore((s) => s.setApiKeySource);
  const setHasApiKey = useSettingsStore((s) => s.setHasApiKey);

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [editingKey, setEditingKey] = useState(false);

  // Surface edit-mode to the parent so it can grow the keyboard spacer only
  // while editing (avoids an always-present empty gap below the content).
  useEffect(() => {
    onEditingChange?.(editingKey);
  }, [editingKey, onEditingChange]);

  // Detect whether a personal key is already stored on mount.
  useEffect(() => {
    let cancelled = false;
    secureKeyService.getKey().then((stored) => {
      if (!cancelled) setApiKeySource(stored ? 'personal' : 'default');
    });
    return () => {
      cancelled = true;
    };
  }, [setApiKeySource]);

  // Auto-reset edit mode whenever the keyboard is dismissed for any reason.
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidHide', () => {
      setEditingKey((prev) => {
        if (prev) {
          setApiKeyInput('');
          return false;
        }
        return prev;
      });
    });
    return () => sub.remove();
  }, []);

  const handleSaveKey = useCallback(async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    setSavingKey(true);
    try {
      await secureKeyService.setKey(trimmed);
      setApiKeySource('personal');
      setHasApiKey(true);
      setApiKeyInput('');
      setEditingKey(false);
    } catch {
      Alert.alert(t('errors.storageError'));
    } finally {
      setSavingKey(false);
    }
  }, [apiKeyInput, setApiKeySource, setHasApiKey, t]);

  const handleStartEditKey = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setApiKeyInput('');
    setEditingKey(true);
  }, []);

  const handleCancelEditKey = useCallback(() => {
    Keyboard.dismiss();
    setApiKeyInput('');
    setEditingKey(false);
  }, []);

  const handleClearKey = useCallback(() => {
    Keyboard.dismiss();
    Alert.alert(
      t('settings.apiKeyRemove'),
      '',
      [
        { text: t('journal.deleteCancel'), style: 'cancel' },
        {
          text: t('settings.apiKeyRemove'),
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            try {
              await secureKeyService.deleteKey();
              setApiKeySource('default');
              setHasApiKey(false);
            } catch {
              Alert.alert(t('errors.storageError'));
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [setApiKeySource, setHasApiKey, t]);

  return (
    <AnimatedView style={animStyle} className="gap-2">
      <View className="flex-row items-center gap-2">
        <Key color={colors.accentGold} size={typography.sm} />
        <Text
          className="text-xs font-inter-semibold text-accent-gold tracking-widest"
          accessibilityRole="header"
        >
          {t('settings.apiKeySection')}
        </Text>
      </View>
      <Card elevated>
        <Text className="font-inter text-base text-text-primary mb-1">
          {t('settings.apiKeyLabel')}
        </Text>
        <Text className="font-inter text-xs text-text-secondary mb-3">
          {apiKeySource === 'personal'
            ? t('settings.apiKeySourcePersonal')
            : t('settings.apiKeySourceDefault')}
        </Text>

        {editingKey ? (
          <>
            <TextInput
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveKey}
              placeholder={t('settings.apiKeyPlaceholder')}
              placeholderTextColor={colors.textDisabled}
              className="bg-bg-surface rounded-xl px-4 min-h-12 font-inter text-base text-text-primary border border-border"
            />
            <View className="mt-3 gap-2">
              <Button
                label={t('settings.apiKeySave')}
                variant="primary"
                size="sm"
                onPress={handleSaveKey}
                disabled={savingKey || apiKeyInput.trim().length === 0}
              />
              <Button
                label={t('journal.deleteCancel')}
                variant="secondary"
                size="sm"
                onPress={handleCancelEditKey}
              />
            </View>
          </>
        ) : apiKeySource === 'personal' ? (
          <>
            <View className="flex-row items-center gap-2">
              <Text className="flex-1 font-mono text-base text-text-primary tracking-widest">
                {'●●●●●●●●●●●●●●●●'}
              </Text>
              <TouchableOpacity
                onPress={handleStartEditKey}
                className="min-h-11 px-3 flex-row items-center justify-center gap-1.5"
                accessibilityRole="button"
                accessibilityLabel={t('settings.apiKeyEdit')}
              >
                <Pencil color={colors.accentGold} size={typography.base} />
                <Text className="font-inter-medium text-sm text-accent-gold">
                  {t('settings.apiKeyEdit')}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mt-3">
              <Button
                label={t('settings.apiKeyRemove')}
                variant="destructive"
                size="sm"
                onPress={handleClearKey}
              />
            </View>
          </>
        ) : (
          <Button
            label={t('settings.apiKeyPlaceholder')}
            variant="secondary"
            size="sm"
            onPress={handleStartEditKey}
          />
        )}
      </Card>
    </AnimatedView>
  );
});

// ─── NotificationsSection ─────────────────────────────────────────────────────
// Owns notifPermissionDenied so that toggle re-renders stay local.

interface NotificationsSectionProps {
  animStyle: AnimatedStyle<ViewStyle>;
}

const NotificationsSection = React.memo(function NotificationsSection({
  animStyle,
}: NotificationsSectionProps) {
  const { t } = useTranslation();
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const notificationDelayDays = useSettingsStore((s) => s.notificationDelayDays);
  const setNotificationDelayDays = useSettingsStore((s) => s.setNotificationDelayDays);
  const [notifPermissionDenied, setNotifPermissionDenied] = useState(false);

  const handleToggleNotifications = useCallback(
    async (next: boolean) => {
      Keyboard.dismiss();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      if (!next) {
        setNotifPermissionDenied(false);
        await setNotificationsEnabled(false);
        return;
      }
      const granted = await notificationService.requestPermission();
      if (granted) {
        setNotifPermissionDenied(false);
        await setNotificationsEnabled(true);
      } else {
        setNotifPermissionDenied(true);
        await setNotificationsEnabled(false);
      }
    },
    [setNotificationsEnabled]
  );

  const handleSelectDelay = useCallback(
    (days: 7 | 14 | 30) => {
      Keyboard.dismiss();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      void setNotificationDelayDays(days);
    },
    [setNotificationDelayDays]
  );

  return (
    <AnimatedView style={animStyle} className="gap-2">
      <View className="flex-row items-center gap-2">
        <Bell color={colors.accentGold} size={typography.sm} />
        <Text
          className="text-xs font-inter-semibold text-accent-gold tracking-widest"
          accessibilityRole="header"
        >
          {t('notifications.sectionTitle')}
        </Text>
      </View>
      <Card elevated>
        <View className="flex-row items-center justify-between min-h-11">
          <Text className="font-inter text-base text-text-primary">
            {t('notifications.enabled')}
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={(next) => void handleToggleNotifications(next)}
            trackColor={{ true: colors.accentGold, false: colors.border }}
            thumbColor={colors.textInverse}
            accessibilityLabel={t('notifications.enabled')}
          />
        </View>

        {notifPermissionDenied && (
          <View className="mt-2 rounded-xl bg-no/15 border border-no px-3 py-2">
            <Text className="font-inter text-xs text-no">
              {t('notifications.permissionDenied')}
            </Text>
          </View>
        )}

        {notificationsEnabled && (
          <View className="mt-4">
            <Text className="font-inter text-sm text-text-secondary mb-2">
              {t('notifications.delayLabel')}
            </Text>
            <View className="flex-row gap-2">
              {([7, 14, 30] as const).map((days) => {
                const active = notificationDelayDays === days;
                return (
                  <TouchableOpacity
                    key={days}
                    onPress={() => handleSelectDelay(days)}
                    className={`rounded-full px-3 py-1 ${
                      active
                        ? 'bg-accent-gold'
                        : 'bg-bg-surface border border-border'
                    }`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      className={`text-xs ${
                        active
                          ? 'text-text-inverse font-inter-semibold'
                          : 'text-text-secondary font-inter'
                      }`}
                    >
                      {t(`notifications.delay${days}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <Text className="font-inter text-xs text-text-secondary mt-3">
          {t('notifications.hint')}
        </Text>
      </Card>
    </AnimatedView>
  );
});

// ─── SettingsScreen ───────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const locationSource = useSettingsStore((s) => s.locationSource);
  const setLocationSource = useSettingsStore((s) => s.setLocationSource);
  const homeLocation = useSettingsStore((s) => s.homeLocation);
  const setHomeLocation = useSettingsStore((s) => s.setHomeLocation);
  const zodiacType = useSettingsStore((s) => s.zodiacType);
  const setZodiacType = useSettingsStore((s) => s.setZodiacType);
  const [timezone] = useState<string>(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const homePickerRef = useRef<LocationPickerSheetRef>(null);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const handleSelectDevice = useCallback(() => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    void setLocationSource('device');
  }, [setLocationSource]);

  const handleSelectManual = useCallback(() => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (homeLocation) {
      void setLocationSource('manual');
    } else {
      homePickerRef.current?.present();
    }
  }, [homeLocation, setLocationSource]);

  const handleOpenHomePicker = useCallback(() => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    homePickerRef.current?.present();
  }, []);

  const handlePickHome = useCallback(
    (loc: LocationOverride) => {
      void setHomeLocation(loc);
    },
    [setHomeLocation]
  );

  const handleHomeUseGps = useCallback(() => {
    void setLocationSource('device');
  }, [setLocationSource]);

  const debugSheetRef = useRef<DebugSheetRef>(null);
  const { registerTap, tapCount, requiredTaps, showDotsFrom } = useDebugTrigger(() =>
    debugSheetRef.current?.present()
  );
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleLocaleChange = useCallback(
    async (next: SupportedLocale) => {
      Keyboard.dismiss();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await setLocale(next);
      await i18n.changeLanguage(next);
    },
    [setLocale, i18n]
  );

  const handleInviteFriend = useCallback(async () => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await Share.share(
        {
          message: `${t('settings.inviteShareText')}\n${APP_STORE_URL_INVITE}`,
          url: APP_STORE_URL_INVITE,
        },
        { dialogTitle: t('settings.inviteFriendTitle') }
      );
    } catch {
      /* user dismissed the sheet or sharing is unavailable */
    }
  }, [t]);

  const handleRateApp = useCallback(() => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Linking.openURL(APP_STORE_REVIEW_URL).catch(() => {});
  }, []);

  // ── Keyboard avoidance (edge-to-edge safe) ──────────────────────────────────
  // Expo SDK 55 targets Android 15 (API 35) where edge-to-edge is enforced, so
  // android:windowSoftInputMode no longer shrinks the window — the IME is a
  // window inset we must consume ourselves. useAnimatedKeyboard reports the real
  // keyboard height on the UI thread (works on iOS too); we render a spacer of
  // that height at the end of the scroll content so the API-key section can be
  // scrolled above the keyboard. react-native-edge-to-edge (Expo SDK 55 default)
  // makes the hook inset-aware automatically — no options needed.
  //
  // The spacer only grows while the API key is being edited (isEditingKey),
  // so there is no idle empty gap below the content the rest of the time.
  const [isEditingKey, setIsEditingKey] = useState(false);
  const keyboard = useAnimatedKeyboard();
  const kbSpacerStyle = useAnimatedStyle(() => ({
    height: isEditingKey ? keyboard.height.value : 0,
  }));

  // Once the keyboard is fully shown, scroll to the freshly-grown end so the
  // API-key form sits just above the keyboard.
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    });
    return () => sub.remove();
  }, []);

  // ── Card stagger (sections + title) ──
  const titleY = useSharedValue(20);
  const titleOp = useSharedValue(0);
  const s0Y = useSharedValue(20);
  const s0Op = useSharedValue(0);
  const s1Y = useSharedValue(20);
  const s1Op = useSharedValue(0);
  const s2Y = useSharedValue(20);
  const s2Op = useSharedValue(0);
  const s3Y = useSharedValue(20);
  const s3Op = useSharedValue(0);
  const s4Y = useSharedValue(20);
  const s4Op = useSharedValue(0);
  const s5Y = useSharedValue(20);
  const s5Op = useSharedValue(0);
  const s6Y = useSharedValue(20);
  const s6Op = useSharedValue(0);

  useEffect(() => {
    const spring = { damping: 12, stiffness: 90 };
    const fade = { duration: 350 };
    // Order: title, language, location, zodiac, timezone, share, notifications, key.
    const sectionList: [SharedValue<number>, SharedValue<number>, number][] = [
      [titleY, titleOp, 0],
      [s0Y, s0Op, 80],
      [s4Y, s4Op, 160],
      [s5Y, s5Op, 240],
      [s1Y, s1Op, 320],
      [s2Y, s2Op, 400],
      [s6Y, s6Op, 480],
      [s3Y, s3Op, 560],
    ];
    sectionList.forEach(([y, op, delay]) => {
      y.value = withDelay(delay, withSpring(0, spring));
      op.value = withDelay(delay, withTiming(1, fade));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOp.value,
    transform: [{ translateY: titleY.value }],
  }));
  const s0Style = useAnimatedStyle(() => ({
    opacity: s0Op.value,
    transform: [{ translateY: s0Y.value }],
  }));
  const s1Style = useAnimatedStyle(() => ({
    opacity: s1Op.value,
    transform: [{ translateY: s1Y.value }],
  }));
  const s2Style = useAnimatedStyle(() => ({
    opacity: s2Op.value,
    transform: [{ translateY: s2Y.value }],
  }));
  const s3Style = useAnimatedStyle(() => ({
    opacity: s3Op.value,
    transform: [{ translateY: s3Y.value }],
  }));
  const s4Style = useAnimatedStyle(() => ({
    opacity: s4Op.value,
    transform: [{ translateY: s4Y.value }],
  }));
  const s5Style = useAnimatedStyle(() => ({
    opacity: s5Op.value,
    transform: [{ translateY: s5Y.value }],
  }));
  const s6Style = useAnimatedStyle(() => ({
    opacity: s6Op.value,
    transform: [{ translateY: s6Y.value }],
  }));

  return (
    <>
    <SafeAreaView className="flex-1 bg-bg-base" edges={['top']}>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="px-5 py-4 gap-6"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <AnimatedView style={titleStyle}>
          <Text className="font-cormorant-medium text-2xl text-text-primary">
            {t('settings.title')}
          </Text>
          <TouchableOpacity
            onPress={registerTap}
            activeOpacity={1}
            accessibilityRole="text"
            className="w-full items-center gap-1 mt-6"
          >
            <AppLogo size={108} />
            <Text className="font-cormorant-bold text-3xl text-accent-gold">Hora</Text>
            <Text className="font-inter text-xs text-text-secondary">
              {t('settings.appVersion', { version: appVersion })}
            </Text>
            {tapCount >= showDotsFrom && (
              <View className="flex-row gap-1 mt-1">
                {Array.from({ length: requiredTaps - showDotsFrom + 1 }).map((_, i) => (
                  <View
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      tapCount >= showDotsFrom + i ? 'bg-accent-gold' : 'bg-text-disabled'
                    }`}
                  />
                ))}
              </View>
            )}
          </TouchableOpacity>
        </AnimatedView>

        {/* LANGUAGE */}
        <AnimatedView style={s0Style} className="gap-2">
          <View className="flex-row items-center gap-2">
            <Globe color={colors.accentGold} size={typography.sm} />
            <Text
              className="text-xs font-inter-semibold text-accent-gold tracking-widest"
              accessibilityRole="header"
            >
              {t('settings.languageSection')}
            </Text>
          </View>
          <Card elevated>
            <Text className="font-inter text-base text-text-primary mb-3">
              {t('settings.languageLabel')}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {LANGUAGES.map(({ code, flag, label }) => {
                const active = locale === code;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => handleLocaleChange(code)}
                    className={`w-[48%] min-h-11 rounded-xl flex-row items-center justify-center gap-2 ${
                      active ? 'bg-accent-gold' : 'bg-bg-surface border border-border'
                    }`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={label}
                  >
                    <Text className="text-base">{flag}</Text>
                    <Text
                      className={`font-inter-medium text-sm ${
                        active ? 'text-text-inverse' : 'text-text-primary'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </AnimatedView>

        {/* LOCATION */}
        <AnimatedView style={s4Style} className="gap-2">
          <View className="flex-row items-center gap-2">
            <MapPin color={colors.accentGold} size={typography.sm} />
            <Text
              className="text-xs font-inter-semibold text-accent-gold tracking-widest"
              accessibilityRole="header"
            >
              {t('settings.locationSection')}
            </Text>
          </View>
          <Card elevated>
            <Text className="font-inter text-base text-text-primary mb-3">
              {t('settings.locationSourceLabel')}
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleSelectDevice}
                className={`flex-1 min-h-11 rounded-xl items-center justify-center ${
                  locationSource === 'device'
                    ? 'bg-accent-gold'
                    : 'bg-bg-surface border border-border'
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: locationSource === 'device' }}
              >
                <Text
                  className={`font-inter-medium text-base ${
                    locationSource === 'device'
                      ? 'text-text-inverse'
                      : 'text-text-primary'
                  }`}
                >
                  {t('settings.locationSourceDevice')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSelectManual}
                className={`flex-1 min-h-11 rounded-xl items-center justify-center ${
                  locationSource === 'manual'
                    ? 'bg-accent-gold'
                    : 'bg-bg-surface border border-border'
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: locationSource === 'manual' }}
              >
                <Text
                  className={`font-inter-medium text-base ${
                    locationSource === 'manual'
                      ? 'text-text-inverse'
                      : 'text-text-primary'
                  }`}
                >
                  {t('settings.locationSourceManual')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="font-inter text-xs text-text-secondary mt-3">
              {locationSource === 'manual'
                ? t('settings.locationManualHint')
                : t('settings.locationDeviceHint')}
            </Text>

            {/* Default city row */}
            <View className="mt-4 pt-4 border-t border-border">
              <Text className="font-inter text-sm text-text-secondary mb-2">
                {t('settings.locationCityLabel')}
              </Text>
              {homeLocation ? (
                <View className="flex-row items-center gap-2">
                  <MapPin color={colors.accentGold} size={typography.base} />
                  <Text className="font-inter text-base text-text-primary flex-1">
                    {homeLocation.city}
                  </Text>
                  <TouchableOpacity
                    onPress={handleOpenHomePicker}
                    className="min-h-11 px-3 items-center justify-center"
                    accessibilityRole="button"
                    accessibilityLabel={t('settings.locationChangeCity')}
                  >
                    <Text className="font-inter-medium text-sm text-accent-gold">
                      {t('settings.locationChangeCity')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Button
                  label={t('settings.locationChooseCity')}
                  variant="secondary"
                  size="sm"
                  onPress={handleOpenHomePicker}
                />
              )}
            </View>
          </Card>
        </AnimatedView>

        {/* ZODIAC TYPE */}
        <AnimatedView style={s5Style} className="gap-2">
          <View className="flex-row items-center gap-2">
            <Star color={colors.accentGold} size={typography.sm} />
            <Text
              className="text-xs font-inter-semibold text-accent-gold tracking-widest"
              accessibilityRole="header"
            >
              {t('settings.zodiacSection')}
            </Text>
          </View>
          <Card elevated>
            <Text className="font-inter text-base text-text-primary mb-3">
              {t('settings.zodiacLabel')}
            </Text>
            <View className="flex-row gap-2">
              {ZODIAC_TYPES.map((zt) => {
                const isSelected = zodiacType === zt;
                return (
                  <TouchableOpacity
                    key={zt}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                        () => {}
                      );
                      void setZodiacType(zt as ZodiacType);
                    }}
                    className={`flex-1 min-h-11 rounded-xl items-center justify-center ${
                      isSelected
                        ? 'bg-accent-gold'
                        : 'bg-bg-surface border border-border'
                    }`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      className={`font-inter-medium text-base ${
                        isSelected ? 'text-text-inverse' : 'text-text-primary'
                      }`}
                    >
                      {t(`settings.zodiac${zt}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text className="font-inter text-xs text-text-secondary mt-3">
              {zodiacType === 'Sidereal'
                ? t('settings.zodiacSiderealHint')
                : t('settings.zodiacTropicHint')}
            </Text>
          </Card>
        </AnimatedView>

        {/* TIMEZONE */}
        <AnimatedView style={s1Style} className="gap-2">
          <View className="flex-row items-center gap-2">
            <Clock color={colors.accentGold} size={typography.sm} />
            <Text
              className="text-xs font-inter-semibold text-accent-gold tracking-widest"
              accessibilityRole="header"
            >
              {t('settings.timezoneSection')}
            </Text>
          </View>
          <Card elevated>
            <Text className="font-inter text-base text-text-primary mb-1">
              {timezone}
            </Text>
            <Text className="font-inter text-xs text-text-secondary">
              {t('settings.timezoneHint')}
            </Text>
          </Card>
        </AnimatedView>

        {/* SHARE & INVITE */}
        <AnimatedView style={s2Style} className="gap-2">
          <View className="flex-row items-center gap-2">
            <Share2 color={colors.accentGold} size={typography.sm} />
            <Text
              className="text-xs font-inter-semibold text-accent-gold tracking-widest"
              accessibilityRole="header"
            >
              {t('settings.shareSection')}
            </Text>
          </View>
          <Card elevated>
            <TouchableOpacity
              onPress={handleInviteFriend}
              className="flex-row items-center gap-3 min-h-12"
              accessibilityRole="button"
              accessibilityLabel={t('settings.inviteFriend')}
            >
              <Share2 color={colors.accentViolet} size={typography.lg} />
              <Text className="flex-1 font-inter text-base text-text-primary">
                {t('settings.inviteFriend')}
              </Text>
              <ChevronRight color={colors.textSecondary} size={typography.base} />
            </TouchableOpacity>

            <View className="h-px bg-border my-1" />

            <TouchableOpacity
              onPress={handleRateApp}
              className="flex-row items-center gap-3 min-h-12"
              accessibilityRole="button"
              accessibilityLabel={t('settings.rateApp')}
            >
              <Heart color={colors.accentViolet} size={typography.lg} />
              <Text className="flex-1 font-inter text-base text-text-primary">
                {t('settings.rateApp')}
              </Text>
              <ChevronRight color={colors.textSecondary} size={typography.base} />
            </TouchableOpacity>
          </Card>
        </AnimatedView>

        {/* OUTCOME REMINDERS — isolated section, owns notifPermissionDenied */}
        <NotificationsSection animStyle={s6Style} />

        {/* API KEY — isolated section, owns editingKey / apiKeyInput / savingKey */}
        <ApiKeySection animStyle={s3Style} onEditingChange={setIsEditingKey} />

        {/* Keyboard spacer — grows to the real IME height (edge-to-edge safe)
            so the API-key form can scroll above the keyboard. */}
        <AnimatedView style={kbSpacerStyle} />
      </ScrollView>
    </SafeAreaView>
    <DebugSheet ref={debugSheetRef} />
    <LocationPickerSheet
      ref={homePickerRef}
      override={homeLocation}
      onPick={handlePickHome}
      onUseGps={handleHomeUseGps}
    />
    </>
  );
}
