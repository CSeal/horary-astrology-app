// src/components/ForceUpdateScreen.tsx
// Non-dismissible full-screen gate rendered after the animated splash when
// the installed native version is below the minimum required.
// Opens the App Store / Play Store and cannot be bypassed.

import { useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Svg, Polygon, Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { View, Text, Pressable } from '@/tw';
import { colors, typography, radius, spacing } from '@/constants/theme';

// 8-pointed star — 220×220 viewBox (shared with AnimatedSplash)
const STAR_POINTS =
  '110,28 122.6,79.5 168,52 140.5,97.4 192,110 ' +
  '140.5,122.6 168,168 122.6,140.5 110,192 97.4,140.5 ' +
  '52,168 79.5,122.6 28,110 79.5,97.4 52,52 97.4,79.5';

// Shadow polygon: same star scaled 1.07× around center (110,110).
// Pre-calculated: coord = 110 + (coord − 110) × 1.07
const STAR_POINTS_SHADOW =
  '110,22.3 123.5,77.4 172.1,47.9 142.6,96.5 197.7,110 ' +
  '142.6,123.5 172.1,172.1 123.5,142.6 110,197.7 96.5,142.6 ' +
  '47.9,172.1 77.4,123.5 22.3,110 77.4,96.5 47.9,47.9 96.5,77.4';

interface ForceUpdateScreenProps {
  storeUrl: string;
}

export function ForceUpdateScreen({ storeUrl }: ForceUpdateScreenProps) {
  const { t } = useTranslation();

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // stable Reanimated ref excluded from deps

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 40 }],
  }));

  const openStore = async () => {
    const tryOpen = async (url: string): Promise<boolean> => {
      try {
        if (await Linking.canOpenURL(url)) {
          await Linking.openURL(url);
          return true;
        }
      } catch {
        // fall through
      }
      return false;
    };

    const opened = await tryOpen(storeUrl);
    if (!opened) {
      // Fallback from deep-link scheme to HTTPS
      const httpsUrl =
        Platform.OS === 'ios'
          ? storeUrl.replace('itms-apps://', 'https://')
          : storeUrl.replace(
              'market://details?id=',
              'https://play.google.com/store/apps/details?id=',
            );
      await tryOpen(httpsUrl);
    }
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.bgBase,
          zIndex: 10000,
          alignItems: 'center',
          justifyContent: 'center',
        },
        overlayStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            alignItems: 'center',
            paddingHorizontal: spacing[8],
            width: '100%',
            maxWidth: 360,
          },
          contentStyle,
        ]}
      >
        {/* Star glyph — same geometry as AnimatedSplash */}
        <Svg
          width={110}
          height={110}
          viewBox="0 0 220 220"
          style={{ marginBottom: spacing[8] }}
        >
          <Circle cx={110} cy={110} r={100} fill={colors.accentGold} opacity={0.06} />
          <Circle
            cx={110}
            cy={110}
            r={104}
            fill="none"
            stroke={colors.accentGold}
            strokeWidth={0.8}
            strokeOpacity={0.18}
          />
          <Polygon
            points={STAR_POINTS_SHADOW}
            fill={colors.accentViolet}
            opacity={0.22}
          />
          <Polygon points={STAR_POINTS} fill={colors.accentGold} />
          <Polygon
            points={STAR_POINTS}
            fill="none"
            stroke={colors.textPrimary}
            strokeWidth={1.2}
            strokeOpacity={0.18}
            strokeLinejoin="round"
          />
          <Circle cx={110} cy={110} r={9} fill={colors.accentGold} />
          <Circle cx={110} cy={110} r={3} fill={colors.textPrimary} opacity={0.45} />
        </Svg>

        <Text
          style={{
            fontFamily: typography.displayBold,
            fontSize: typography.hero,
            lineHeight: typography.hero * typography.headingLineHeight,
            color: colors.textPrimary,
            textAlign: 'center',
            marginBottom: spacing[3],
          }}
        >
          {t('forceUpdate.title')}
        </Text>

        <Text
          style={{
            fontFamily: typography.body,
            fontSize: typography.base,
            lineHeight: typography.base * typography.bodyLineHeight,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: spacing[8],
          }}
        >
          {t('forceUpdate.body')}
        </Text>

        <View className="w-full">
          <Pressable
            onPress={() => { void openStore(); }}
            style={{
              backgroundColor: colors.accentGold,
              borderRadius: radius.xl,
              paddingHorizontal: spacing[8],
              paddingVertical: spacing[4],
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: typography.bodySemiBold,
                fontSize: typography.lg,
                color: colors.textInverse,
              }}
            >
              {t('forceUpdate.cta')}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
