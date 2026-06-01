// CSS-wrapped React Native components for NativeWind v5 + react-native-css.
// Import from '@/tw' instead of 'react-native' to get className support.
// Required because globalClassNamePolyfill is disabled to preserve PlatformColor.

import { Link as RouterLink } from 'expo-router';
import React from 'react';
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TextInput as RNTextInput,
  TouchableOpacity as RNTouchableOpacity,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useCssElement as _useCssElement, useNativeVariable as useFunctionalVariable } from 'react-native-css';
import Animated from 'react-native-reanimated';

// Typed alias that avoids TS2590 "union too complex" on complex RN/Expo component props
const useCssElement = _useCssElement as (c: unknown, p: unknown, m: unknown) => React.ReactElement;

// CSS Variable hook — functional on native, var() fallback on web
export const useCSSVariable =
  process.env.EXPO_OS !== 'web'
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

// Link
export const Link = (
  props: React.ComponentProps<typeof RouterLink> & { className?: string }
): React.ReactElement => useCssElement(RouterLink, props, { className: 'style' });
Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

// View
export type ViewProps = React.ComponentProps<typeof RNView> & { className?: string };
export const View = (props: ViewProps): React.ReactElement =>
  useCssElement(RNView, props, { className: 'style' });
View.displayName = 'CSS(View)';

// Text
export const Text = (
  props: React.ComponentProps<typeof RNText> & { className?: string }
): React.ReactElement => useCssElement(RNText, props, { className: 'style' });
Text.displayName = 'CSS(Text)';

// ScrollView
export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  }
): React.ReactElement =>
  useCssElement(RNScrollView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  });
ScrollView.displayName = 'CSS(ScrollView)';

// Pressable
export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string }
): React.ReactElement => useCssElement(RNPressable, props, { className: 'style' });
Pressable.displayName = 'CSS(Pressable)';

// TouchableOpacity
export const TouchableOpacity = (
  props: React.ComponentProps<typeof RNTouchableOpacity> & { className?: string }
): React.ReactElement => useCssElement(RNTouchableOpacity, props, { className: 'style' });
TouchableOpacity.displayName = 'CSS(TouchableOpacity)';

// TextInput
export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string }
): React.ReactElement => useCssElement(RNTextInput, props, { className: 'style' });
TextInput.displayName = 'CSS(TextInput)';

// AnimatedView
// Cannot pass Animated.View directly to useCssElement — in Reanimated 4,
// Animated.View.displayName = 'View' (not 'Animated.*'), so react-native-css's
// animatedComponentFamily tries to double-wrap it and Reanimated throws.
// Fix: CSS-aware base (forwardRef to RNView) + createAnimatedComponent on top.
const _AnimatedViewBase = React.forwardRef<
  React.ComponentRef<typeof RNView>,
  React.ComponentProps<typeof RNView> & { className?: string }
>((props, ref) =>
  useCssElement(RNView, { ...props, ref }, { className: 'style' }) as React.ReactElement
);
_AnimatedViewBase.displayName = 'CSSAnimatedViewBase';
export const AnimatedView = Animated.createAnimatedComponent(_AnimatedViewBase);
(AnimatedView as { displayName?: string }).displayName = 'CSS(AnimatedView)';

// SafeAreaView
export const SafeAreaView = (
  props: React.ComponentProps<typeof RNSafeAreaView> & { className?: string }
): React.ReactElement => useCssElement(RNSafeAreaView, props, { className: 'style' });
SafeAreaView.displayName = 'CSS(SafeAreaView)';

// AnimatedScrollView
const _AnimatedScrollViewBase = React.forwardRef<
  React.ComponentRef<typeof RNScrollView>,
  React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  }
>((props, ref) =>
  useCssElement(
    RNScrollView,
    { ...props, ref },
    { className: 'style', contentContainerClassName: 'contentContainerStyle' }
  ) as React.ReactElement
);
_AnimatedScrollViewBase.displayName = 'CSSAnimatedScrollViewBase';
export const AnimatedScrollView = Animated.createAnimatedComponent(_AnimatedScrollViewBase);
(AnimatedScrollView as { displayName?: string }).displayName = 'CSS(AnimatedScrollView)';
