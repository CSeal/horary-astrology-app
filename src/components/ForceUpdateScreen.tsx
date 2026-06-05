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
import { Svg, Polygon, Circle, Line } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { View, Text, Pressable } from '@/tw';
import { colors, typography, radius, spacing } from '@/constants/theme';


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
        {/* Zodiac clock glyph — same geometry as AnimatedSplash */}
        <Svg
          width={110}
          height={110}
          viewBox="0 0 220 220"
          style={{ marginBottom: spacing[8] }}
        >
          {/* Ambient violet glow */}
          <Circle cx={110} cy={110} r={97} fill={colors.accentViolet} fillOpacity={0.12} />
          {/* Outer ring */}
          <Circle cx={110} cy={110} r={97} fill="none" stroke={colors.accentGold} strokeWidth={3.3} strokeOpacity={0.6} />
          {/* Inner reference ring */}
          <Circle cx={110} cy={110} r={75} fill="none" stroke={colors.accentGold} strokeWidth={1.3} strokeOpacity={0.18} />
          {/* Cardinal ticks — 12/3/6/9 o'clock (longer) */}
          <Line x1={110} y1={13}  x2={110} y2={37}  stroke={colors.accentGold} strokeWidth={4}   strokeOpacity={0.9} strokeLinecap="round" />
          <Line x1={207} y1={110} x2={183} y2={110} stroke={colors.accentGold} strokeWidth={4}   strokeOpacity={0.9} strokeLinecap="round" />
          <Line x1={110} y1={207} x2={110} y2={183} stroke={colors.accentGold} strokeWidth={4}   strokeOpacity={0.9} strokeLinecap="round" />
          <Line x1={13}  y1={110} x2={37}  y2={110} stroke={colors.accentGold} strokeWidth={4}   strokeOpacity={0.9} strokeLinecap="round" />
          {/* Minor ticks — 1/2/4/5/7/8/10/11 o'clock (shorter) */}
          <Line x1={158} y1={26}  x2={152} y2={38}  stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={194} y1={62}  x2={182} y2={68}  stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={194} y1={158} x2={182} y2={152} stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={158} y1={194} x2={152} y2={182} stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={62}  y1={194} x2={68}  y2={182} stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={26}  y1={158} x2={38}  y2={152} stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={26}  y1={62}  x2={38}  y2={68}  stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          <Line x1={62}  y1={26}  x2={68}  y2={38}  stroke={colors.accentGold} strokeWidth={2.2} strokeOpacity={0.4} strokeLinecap="round" />
          {/* Pointer hand → 10 o'clock (300° from 12) */}
          <Line x1={110} y1={110} x2={53}  y2={79}  stroke={colors.accentGold} strokeWidth={4.8} strokeLinecap="round" />
          {/* Counterbalance tail */}
          <Line x1={110} y1={110} x2={130} y2={121} stroke={colors.accentGold} strokeWidth={3.1} strokeOpacity={0.5} strokeLinecap="round" />
          {/* 4-point star at pointer tip */}
          <Polygon points="53,67 56,78 66,79 56,80 53,91 50,80 40,79 50,78" fill={colors.accentGold} />
          {/* Center pivot */}
          <Circle cx={110} cy={110} r={7.7} fill={colors.accentGold} />
          <Circle cx={110} cy={110} r={3.3} fill="white" fillOpacity={0.4} />
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
