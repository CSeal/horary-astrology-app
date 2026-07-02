// src/components/KeyboardDismissBar.tsx
// Floating "hide keyboard" button that appears just above the software
// keyboard — visible only while it's open. iOS keeps the window fixed while
// the keyboard floats over it, so the button is translated up by the live
// keyboard height (Reanimated useAnimatedKeyboard). Android already resizes
// the window via windowSoftInputMode="adjustResize" (see app.json), so no
// extra offset is needed there — applying one too would double-shift it.

import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react-native';
import {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AnimatedView, Pressable } from '@/tw';
import { dismissKeyboard } from '@/utils/keyboard';
import { colors, typography } from '@/constants/theme';

export function KeyboardDismissBar() {
  const { t } = useTranslation();
  const keyboard = useAnimatedKeyboard();
  const [visible, setVisible] = useState(false);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 180 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const barStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: Platform.OS === 'ios' ? -keyboard.height.value - 8 : -8 },
    ],
  }));

  if (!visible) return null;

  return (
    <AnimatedView
      pointerEvents="box-none"
      style={barStyle}
      className="absolute right-4 bottom-0 z-50"
    >
      <Pressable
        onPress={dismissKeyboard}
        accessibilityRole="button"
        accessibilityLabel={t('home.hideKeyboard')}
        className="w-10 h-10 items-center justify-center rounded-full bg-bg-card border border-border"
      >
        <ChevronDown color={colors.textSecondary} size={typography.base} />
      </Pressable>
    </AnimatedView>
  );
}
