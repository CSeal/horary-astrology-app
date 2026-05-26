// src/components/ui/Button.tsx
// Primary / Secondary / Destructive button variants.
// No StyleSheet.create() — NativeWind className only.
// Colors from theme.ts — no inline hex values.

import { TouchableOpacity, Text, type TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  accessibilityLabel?: string;
}

export function Button({
  label,
  variant = 'primary',
  accessibilityLabel,
  disabled,
  ...props
}: ButtonProps) {
  const baseClass = 'rounded-xl items-center justify-center min-h-[56px] px-6';

  const variantClass = {
    primary: disabled
      ? 'bg-accent-gold-dim'
      : 'bg-accent-gold active:scale-[0.97]',
    secondary: 'bg-transparent border border-border-focus',
    destructive: 'bg-transparent',
  }[variant];

  const textClass = {
    primary: 'font-inter-semibold text-lg text-text-inverse',
    secondary: 'font-inter-medium text-base text-accent-gold',
    destructive: 'font-inter text-sm text-no underline',
  }[variant];

  return (
    <TouchableOpacity
      className={`${baseClass} ${variantClass}`}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      {...props}
    >
      <Text className={textClass}>{label}</Text>
    </TouchableOpacity>
  );
}
