// src/components/AskForm.tsx
// Multiline question input + location row + monthly counter + primary CTA.
// Location row is tappable — opens LocationPickerSheet for manual override.
// Override is shown as a removable chip; tap ✕ to revert to GPS.

import { View, Text, TouchableOpacity } from '@/tw';
import { useTranslation } from 'react-i18next';
import { MapPin, X } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, typography } from '@/constants/theme';
import {
  MAX_QUESTION_CHARS,
  MIN_QUESTION_CHARS,
  MONTHLY_QUESTION_LIMIT,
} from '@/constants/config';
import type { LocationOverride } from '@/types/location';

interface AskFormProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  city?: string;
  locationPending?: boolean;
  locationDenied?: boolean;
  monthlyCount: number;
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
  locationPending = false,
  locationDenied = false,
  monthlyCount,
  override = null,
  onOpenLocationPicker,
  onClearOverride,
}: AskFormProps) {
  const { t } = useTranslation();
  const trimmedLen = value.trim().length;
  const isValid = trimmedLen >= MIN_QUESTION_CHARS && value.length <= MAX_QUESTION_CHARS;

  // With an override the user has explicitly chosen a city — submit is allowed
  // even when GPS is pending/denied. Otherwise both must be resolved.
  const hasLocation = override !== null || (!locationPending && !locationDenied);
  const canSubmit = isValid && !isLoading && hasLocation;

  const showOverrideChip = override !== null;
  const showGpsRow = !showOverrideChip;

  const locationDisplay = locationPending
    ? t('errors.locationDetecting')
    : locationDenied
      ? t('errors.locationDenied')
      : (city ?? t('home.locationLabel'));

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
            color={locationDenied ? colors.no : colors.accentGold}
            size={typography.base}
          />
          <Text className="font-inter text-sm text-text-primary flex-1">
            {locationDisplay}
          </Text>
          <Text className="font-inter text-xs text-accent-gold">
            {t('home.changeLocation')}
          </Text>
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
