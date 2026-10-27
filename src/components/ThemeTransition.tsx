import React, { useEffect, useRef } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme';

/** Wraps the app; every time the theme flips it dips and restores opacity for a soft cross-fade. */
export function ThemeTransition({ children }: { children: React.ReactNode }) {
  const { mode, colors } = useTheme();
  const opacity = useSharedValue(1);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    opacity.value = withSequence(
      withTiming(0.55, { duration: 90 }),
      withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) }),
    );
  }, [mode, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>{children}</Animated.View>;
}
