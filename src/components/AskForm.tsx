// src/components/AskForm.tsx
// Multiline question input + location row + monthly counter + primary CTA.
// Location row is tappable — opens LocationPickerSheet for manual override.
// Override is shown as a removable chip; tap ✕ to revert to GPS.

import { View, Text, TouchableOpacity, ScrollView } from '@/tw';
import { useTranslation } from 'react-i18next';
import { MapPin, X } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, typography } from '@/constants/theme';
import {
  MAX_QUESTION_CHARS,
  MIN_QUESTION_CHARS,
  MONTHLY_QUESTION_LIMIT,
  HORARY_CATEGORIES,
  type HoraryCategory,
} from '@/constants/config';
import type { LocationOverride } from '@/types/location';

interface AskFormProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  city?: string;
  // Suffix shown after the city, e.g. '· GPS' or '· default'.
  locationSourceLabel?: string;
  // GPS still resolving and no fallback city is available yet.
  locationPending?: boolean;
  // No usable coordinates at all — blocks submit and prompts to set a city.
  locationMissing?: boolean;
  monthlyCount: number;
  category: HoraryCategory;
  onSelectCategory: (category: HoraryCategory) => void;
  override?: LocationOverride | null;
  onOpenLocationPicker?: () => void;
  onClearOverride?: () => void;
}

export function AskForm({
  value,
  onChangeText,
  onSubmit,
  isLoading = false,
  city,
  locationSourceLabel,
  locationPending = false,
  locationMissing = false,
  monthlyCount,
  category,
  onSelectCategory,
  override = null,
  onOpenLocationPicker,
  onClearOverride,
}: AskFormProps) {
  const { t } = useTranslation();
  const trimmedLen = value.trim().length;
  const isValid = trimmedLen >= MIN_QUESTION_CHARS && value.length <= MAX_QUESTION_CHARS;

  // An override always supplies coordinates. Otherwise we need a resolved
  // default (GPS or home city) — blocked only while pending or fully missing.
  const hasLocation = override !== null || (!locationPending && !locationMissing);
  const canSubmit = isValid && !isLoading && hasLocation;

  const showOverrideChip = override !== null;
  const showGpsRow = !showOverrideChip;

  const locationDisplay = locationPending
    ? t('errors.locationDetecting')
    : locationMissing
      ? t('home.locationSet')
      : `${city ?? t('home.locationLabel')}${
          locationSourceLabel ? ` ${locationSourceLabel}` : ''
        }`;

  return (
    <View className="gap-4">
      <View>
        <Text className="font-inter-semibold text-lg text-text-primary mb-1">
          {t('home.title')}
        </Text>
        <Text className="font-inter text-sm text-text-secondary">
          {t('home.inputHint')}
        </Text>
      </View>

      <Input
        value={value}
        onChangeText={onChangeText}
        multiline
        showCharCount
        maxLength={MAX_QUESTION_CHARS}
        placeholder={t('home.inputPlaceholder')}
        accessibilityLabel={t('home.inputPlaceholder')}
      />

      {/* Category selector — required by the API; 'general' is the default */}
      <View className="gap-2">
        <Text className="font-inter-medium text-sm text-text-secondary">
          {t('home.categoryLabel')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-2 pr-2"
        >
          {HORARY_CATEGORIES.map((cat) => {
            const selected = cat === category;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => onSelectCategory(cat)}
                className={`px-4 min-h-10 rounded-full items-center justify-center border ${
                  selected
                    ? 'bg-accent-gold border-accent-gold'
                    : 'bg-bg-card border-border'
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  className={`font-inter-medium text-sm ${
                    selected ? 'text-text-inverse' : 'text-text-primary'
                  }`}
                >
                  {t(`categories.${cat}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Override chip — visible when user has manually picked a city */}
      {showOverrideChip && override && (
        <View className="flex-row items-center gap-2 self-start px-3 py-2 rounded-full bg-bg-card border border-accent-gold">
          <MapPin color={colors.accentGold} size={typography.sm} />
          <Text className="font-inter-medium text-sm text-text-primary">
            {override.city}
          </Text>
          <Text className="font-inter text-xs text-text-secondary">
            {t('home.locationManual')}
          </Text>
          <TouchableOpacity
            onPress={onClearOverride}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.clearOverride')}
            hitSlop={8}
          >
            <X color={colors.textSecondary} size={typography.base} />
          </TouchableOpacity>
        </View>
      )}

      {/* GPS row — tappable to open picker */}
      {showGpsRow && (
        <TouchableOpacity
          onPress={onOpenLocationPicker}
          disabled={!onOpenLocationPicker}
          className="flex-row items-center gap-2"
          accessibilityRole="button"
          accessibilityLabel={t('a11y.openLocationPicker')}
        >
          <MapPin
            color={locationMissing ? colors.no : colors.accentGold}
            size={typography.base}
          />
          <Text className="font-inter text-sm text-text-primary flex-1">
            {locationDisplay}
          </Text>
          {!locationMissing && (
            <Text className="font-inter text-xs text-accent-gold">
              {t('home.changeLocation')}
            </Text>
          )}
        </TouchableOpacity>
      )}

      <Button
        label={t('home.submitButton')}
        onPress={onSubmit}
        disabled={!canSubmit}
        loading={isLoading}
        accessibilityLabel={t('a11y.askButton')}
      />

      <Text className="font-inter text-xs text-text-secondary text-center">
        {t('home.questionCounter', {
          count: monthlyCount,
          limit: MONTHLY_QUESTION_LIMIT,
        })}
      </Text>
    </View>
  );
}
