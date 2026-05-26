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
export const AnimatedView = (
  props: React.ComponentProps<typeof Animated.View> & { className?: string }
): React.ReactElement => useCssElement(Animated.View, props, { className: 'style' });
AnimatedView.displayName = 'CSS(AnimatedView)';

// AnimatedScrollView
export const AnimatedScrollView = (
  props: React.ComponentProps<typeof Animated.ScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  }
): React.ReactElement =>
  useCssElement(Animated.ScrollView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  });
AnimatedScrollView.displayName = 'CSS(AnimatedScrollView)';
