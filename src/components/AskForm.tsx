// src/components/AskForm.tsx
// Multiline question input + category/subcategory/subject_role selectors +
// location row + primary CTA.
// Category chips use ChipScrollRow (auto-center on select + icons).
// Subcategory chips appear when the selected category has sub-options.
// Subject role chips let the user specify whose perspective is being asked.

import { useMemo } from 'react';
import { View, Text, TouchableOpacity } from '@/tw';
import { useTranslation } from 'react-i18next';
import {
  MapPin, X,
  CircleHelp, Heart, Gem, TrendingUp, Briefcase, Coins,
  HeartPulse, Baby, Leaf, Package, Plane,
  User, Users, Users2, Building2, UserPlus, UserX, UserRound,
} from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ChipScrollRow, type ChipItem } from '@/components/ChipScrollRow';
import { colors, typography } from '@/constants/theme';
import {
  MAX_QUESTION_CHARS,
  MIN_QUESTION_CHARS,
  HORARY_CATEGORIES,
  HORARY_SUBCATEGORIES,
  SUBJECT_ROLES,
  type HoraryCategory,
  type SubjectRole,
} from '@/constants/config';
import type { LocationOverride } from '@/types/location';

// Icon render-functions per category (ChipScrollRow injects the correct color).
const CATEGORY_ICONS: Record<HoraryCategory, (c: string, s: number) => React.ReactElement> = {
  general:      (c, s) => <CircleHelp  color={c} size={s} />,
  love:         (c, s) => <Heart       color={c} size={s} />,
  marriage:     (c, s) => <Gem         color={c} size={s} />,
  career:       (c, s) => <TrendingUp  color={c} size={s} />,
  job:          (c, s) => <Briefcase   color={c} size={s} />,
  money:        (c, s) => <Coins       color={c} size={s} />,
  health:       (c, s) => <HeartPulse  color={c} size={s} />,
  pregnancy:    (c, s) => <Baby        color={c} size={s} />,
  fertility:    (c, s) => <Leaf        color={c} size={s} />,
  missing_item: (c, s) => <Package     color={c} size={s} />,
  travel:       (c, s) => <Plane       color={c} size={s} />,
};

const SUBJECT_ROLE_ICONS: Record<SubjectRole, (c: string, s: number) => React.ReactElement> = {
  self:                  (c, s) => <User      color={c} size={s} />,
  spouse_partner:        (c, s) => <Heart     color={c} size={s} />,
  third_party_friend:    (c, s) => <UserPlus  color={c} size={s} />,
  third_party_employer:  (c, s) => <Building2 color={c} size={s} />,
  third_party_parent:    (c, s) => <Users     color={c} size={s} />,
  third_party_child:     (c, s) => <Baby      color={c} size={s} />,
  third_party_other:     (c, s) => <UserRound color={c} size={s} />,
};

// Unused icons kept to avoid import-pruning — referenced by future roles.
void Users2; void UserX;

interface AskFormProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  city?: string;
  locationSourceLabel?: string;
  locationPending?: boolean;
  locationMissing?: boolean;
  noApiKey?: boolean;
  category: HoraryCategory;
  onSelectCategory: (category: HoraryCategory) => void;
  subcategory?: string;
  onSelectSubcategory: (sub: string | undefined) => void;
  subjectRole: SubjectRole;
  onSelectSubjectRole: (role: SubjectRole) => void;
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
  noApiKey = false,
  category,
  onSelectCategory,
  subcategory,
  onSelectSubcategory,
  subjectRole,
  onSelectSubjectRole,
  override = null,
  onOpenLocationPicker,
  onClearOverride,
}: AskFormProps) {
  const { t } = useTranslation();
  const trimmedLen = value.trim().length;
  const isValid = trimmedLen >= MIN_QUESTION_CHARS && value.length <= MAX_QUESTION_CHARS;

  const hasLocation = override !== null || (!locationPending && !locationMissing);
  const canSubmit = isValid && !isLoading && hasLocation && !noApiKey;

  const showOverrideChip = override !== null;

  const locationDisplay = locationPending
    ? t('errors.locationDetecting')
    : locationMissing
      ? t('home.locationSet')
      : `${city ?? t('home.locationLabel')}${locationSourceLabel ? ` ${locationSourceLabel}` : ''}`;

  // Build category chip items.
  const categoryItems = useMemo<ChipItem[]>(
    () =>
      HORARY_CATEGORIES.map((cat) => ({
        key: cat,
        label: t(`categories.${cat}`),
        icon: CATEGORY_ICONS[cat],
      })),
    [t]
  );

  // Build subcategory chip items for the selected category.
  const subcategoryKeys = HORARY_SUBCATEGORIES[category];
  const subcategoryItems = useMemo<ChipItem[]>(() => {
    if (!subcategoryKeys) return [];
    return subcategoryKeys.map((sub) => ({
      key: sub,
      label: t(`subcategories.${sub}`),
    }));
  }, [subcategoryKeys, t]);

  // Build subject role chip items.
  const subjectRoleItems = useMemo<ChipItem[]>(
    () =>
      SUBJECT_ROLES.map((role) => ({
        key: role,
        label: t(`subjectRoles.${role}`),
        icon: SUBJECT_ROLE_ICONS[role],
      })),
    [t]
  );

  const handleSelectCategory = (cat: string) => {
    onSelectCategory(cat as HoraryCategory);
  };

  const handleSelectSubcategory = (sub: string) => {
    // Tapping the already-selected subcategory deselects it.
    onSelectSubcategory(sub === subcategory ? undefined : sub);
  };

  const handleSelectSubjectRole = (role: string) => {
    onSelectSubjectRole(role as SubjectRole);
  };

  return (
    <View className="gap-4">
      <Text className="font-inter text-sm text-text-secondary">
        {t('home.inputHint')}
      </Text>

      <Input
        value={value}
        onChangeText={onChangeText}
        multiline
        showCharCount
        maxLength={MAX_QUESTION_CHARS}
        placeholder={t('home.inputPlaceholder')}
        accessibilityLabel={t('home.inputPlaceholder')}
      />

      {/* Category — required by API */}
      <ChipScrollRow
        items={categoryItems}
        selected={category}
        onSelect={handleSelectCategory}
        sectionLabel={t('home.categoryLabel')}
      />

      {/* Subcategory — shown when the selected category has sub-options */}
      {subcategoryItems.length > 0 && (
        <ChipScrollRow
          items={subcategoryItems}
          selected={subcategory ?? ''}
          onSelect={handleSelectSubcategory}
          sectionLabel={t('home.subCategoryLabel')}
        />
      )}

      {/* Subject role — whose perspective */}
      <ChipScrollRow
        items={subjectRoleItems}
        selected={subjectRole}
        onSelect={handleSelectSubjectRole}
        sectionLabel={t('home.subjectRoleLabel')}
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

      {/* GPS / home-city row — tappable to open picker */}
      {!showOverrideChip && (
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

    </View>
  );
}
