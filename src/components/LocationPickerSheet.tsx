// src/components/LocationPickerSheet.tsx
// Bottom sheet for manual location override during the ask flow.
// Per-question scope — never persisted. Domain rule: chart is cast for the
// device's location at the moment the question is asked, so override exists
// only to recover from a wrong GPS reading, not to "set a home city".

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { MapPin, Search, Check } from 'lucide-react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useDebounce } from 'use-debounce';
import { View, Text, TouchableOpacity, AnimatedView } from '@/tw';
import { dismissKeyboard } from '@/utils/keyboard';
import { geocodingService } from '@/services/geocodingService';
import { colors, typography } from '@/constants/theme';
import type { LocationOverride } from '@/types/location';

function ResultItem({
  item,
  index,
  onPress,
}: {
  item: LocationOverride;
  index: number;
  onPress: () => void;
}) {
  const op = useSharedValue(0);
  const y = useSharedValue(12);

  useEffect(() => {
    const delay = Math.min(index * 40, 200);
    op.value = withDelay(delay, withTiming(1, { duration: 300 }));
    y.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 120 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: y.value }],
  }));

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <AnimatedView style={style}>
      <TouchableOpacity
        onPress={handlePress}
        className="px-3 py-3 rounded-xl active:bg-bg-surface"
        accessibilityRole="button"
      >
        <Text className="font-inter text-base text-text-primary">{item.city}</Text>
        <Text className="font-inter text-xs text-text-secondary mt-1">
          {item.displayName}
        </Text>
      </TouchableOpacity>
    </AnimatedView>
  );
}

export interface LocationPickerSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface LocationPickerSheetProps {
  detectedCity?: string;
  override: LocationOverride | null;
  onPick: (override: LocationOverride) => void;
  onUseGps: () => void;
  ref?: React.Ref<LocationPickerSheetRef>;
}

export function LocationPickerSheet({
  detectedCity,
  override,
  onPick,
  onUseGps,
  ref,
}: LocationPickerSheetProps) {
  const { t, i18n } = useTranslation();
  const sheetRef = useRef<BottomSheet>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 350);
  const [results, setResults] = useState<LocationOverride[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const snapPoints = useMemo(() => ['75%'], []);
  const lang: 'en' | 'ru' = i18n.language === 'ru' ? 'ru' : 'en';

  useEffect(() => {
    if (ref) {
      const handle: LocationPickerSheetRef = {
        present: () => sheetRef.current?.expand(),
        dismiss: () => sheetRef.current?.close(),
      };
      if (typeof ref === 'function') ref(handle);
      else (ref as React.RefObject<LocationPickerSheetRef | null>).current = handle;
    }
  }, [ref]);

  // Run geocode on debounced query change. Cancels in-flight request when
  // the user keeps typing or closes the sheet.
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setSearching(false);
      setSearchError(false);
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setSearching(true);
    setSearchError(false);

    geocodingService
      .search(debouncedQuery, lang, ctrl.signal)
      .then((items) => {
        if (ctrl.signal.aborted) return;
        setResults(items);
        setSearching(false);
      })
      .catch((err) => {
        if (ctrl.signal.aborted || (err as Error).name === 'AbortError') return;
        setResults([]);
        setSearching(false);
        setSearchError(true);
      });

    return () => ctrl.abort();
  }, [debouncedQuery, lang]);

  const handlePick = useCallback(
    (item: LocationOverride) => {
      dismissKeyboard();
      onPick(item);
      setQuery('');
      setResults([]);
      sheetRef.current?.close();
    },
    [onPick]
  );

  const handleUseGps = useCallback(() => {
    onUseGps();
    setQuery('');
    setResults([]);
    sheetRef.current?.close();
  }, [onUseGps]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
      />
    ),
    []
  );

  const showEmptyState =
    debouncedQuery.trim().length >= 2 && !searching && results.length === 0;

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      // gorhom v5 defaults enableDynamicSizing to true; with our flex-1 content
      // that measures as ~0 height and the sheet opens collapsed. Force the
      // fixed 75% snap point instead.
      enableDynamicSizing={false}
      enablePanDownToClose
      index={-1}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.bgCard }}
      handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <View className="px-5 pt-2 pb-4 gap-4 flex-1">
        <Text className="font-cormorant-medium text-2xl text-text-primary">
          {t('locationPicker.title')}
        </Text>

        {/* Detected GPS row */}
        {detectedCity && (
          <View className="flex-row items-center gap-3 px-3 py-3 rounded-xl bg-bg-surface">
            <MapPin color={colors.accentGold} size={typography.base} />
            <View className="flex-1">
              <Text className="font-inter text-xs text-text-secondary">
                {t('locationPicker.detected')}
              </Text>
              <Text className="font-inter text-base text-text-primary">
                {detectedCity}
              </Text>
            </View>
            {!override && (
              <Check color={colors.accentGold} size={typography.base} />
            )}
          </View>
        )}

        {/* Hint copy — doctrinal correctness */}
        <Text className="font-inter text-xs text-text-secondary">
          {t('locationPicker.hint')}
        </Text>

        {/* Search input */}
        <View className="flex-row items-center gap-2 px-3 min-h-12 rounded-xl bg-bg-surface border border-border">
          <Search color={colors.textSecondary} size={typography.base} />
          <BottomSheetTextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('locationPicker.search')}
            placeholderTextColor={colors.textDisabled}
            autoCapitalize="words"
            autoCorrect={false}
            style={{
              flex: 1,
              color: colors.textPrimary,
              fontFamily: typography.body,
              fontSize: typography.base,
              paddingVertical: 12,
            }}
          />
          {searching && (
            <ActivityIndicator color={colors.accentGold} size="small" />
          )}
        </View>

        {/* Results / empty / error states */}
        <View className="flex-1">
          {searchError && (
            <Text className="font-inter text-sm text-no text-center mt-4">
              {t('locationPicker.error')}
            </Text>
          )}
          {showEmptyState && !searchError && (
            <Text className="font-inter text-sm text-text-secondary text-center mt-4">
              {t('locationPicker.noResults')}
            </Text>
          )}
          {results.length > 0 && (
            <BottomSheetFlatList
              data={results}
              keyExtractor={(item, idx) =>
                `${item.latitude}-${item.longitude}-${idx}`
              }
              keyboardShouldPersistTaps="handled"
              renderItem={({ item, index }) => (
                <ResultItem
                  item={item}
                  index={index}
                  onPress={() => handlePick(item)}
                />
              )}
              ItemSeparatorComponent={() => <View className="h-px bg-border" />}
            />
          )}
        </View>

        {/* Use GPS reset (visible only when override active) */}
        {override && (
          <TouchableOpacity
            onPress={handleUseGps}
            className="min-h-11 rounded-xl items-center justify-center border border-accent-gold"
            accessibilityRole="button"
          >
            <Text className="font-inter-medium text-base text-accent-gold">
              {t('locationPicker.useGps')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Attribution — OSM data license */}
        <Text className="font-inter text-xs text-text-secondary text-center">
          {t('locationPicker.attribution')}
        </Text>
      </View>
    </BottomSheet>
  );
}
