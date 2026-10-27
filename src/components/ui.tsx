import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, SCREEN_PAD, useTheme } from '../theme';

/* ---------------------------------- Text --------------------------------- */

const variants: Record<string, TextStyle> = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  heading: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '500' },
  caption: { fontSize: 12.5, fontWeight: '500' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
};

type AppTextProps = TextProps & {
  variant?: keyof typeof variants;
  muted?: boolean;
  color?: string;
};

export function AppText({ variant = 'body', muted, color, style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      {...rest}
      style={[variants[variant], { color: color ?? (muted ? colors.textMuted : colors.text) }, style]}
    />
  );
}

/* ------------------------------ ScalePressable ---------------------------- */

const APressable = Animated.createAnimatedComponent(Pressable);

type ScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
};

export function ScalePressable({
  style,
  scaleTo = 0.975,
  haptic,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: ScaleProps) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <APressable
      {...rest}
      style={[style, anim]}
      onPressIn={(e) => {
        scale.value = withTiming(scaleTo, { duration: 120 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: 240 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.(e);
      }}
    />
  );
}

/* ----------------------------------- Card --------------------------------- */

export function Card({
  index = 0,
  style,
  children,
}: {
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Animated.View
      entering={FadeInDown.duration(450).delay(index * 60)}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

/* -------------------------------- ProgressBar ----------------------------- */

export function ProgressBar({
  value,
  color,
  height = 8,
}: {
  value: number; // 0..1
  color: string;
  height?: number;
}) {
  const { colors } = useTheme();
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(Math.min(Math.max(value, 0), 1), {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, w]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View
      style={{ height, borderRadius: height, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}
    >
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: color }, fill]} />
    </View>
  );
}

/* ---------------------------------- Button -------------------------------- */

export function Button({
  label,
  onPress,
  color,
  variant = 'solid',
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  color: string;
  variant?: 'solid' | 'soft';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  const solid = variant === 'solid';
  return (
    <ScalePressable
      haptic
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: radius.md,
          backgroundColor: solid ? color : color + '22',
        },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={18} color={solid ? '#fff' : color} />}
      <AppText variant="heading" color={solid ? '#fff' : color}>
        {label}
      </AppText>
    </ScalePressable>
  );
}

/* ------------------------------- ThemeToggle ------------------------------ */

export function ThemeToggle() {
  const { isDark, colors, toggle } = useTheme();
  const p = useSharedValue(isDark ? 1 : 0);
  useEffect(() => {
    p.value = withSpring(isDark ? 1 : 0, { damping: 14, stiffness: 160 });
  }, [isDark, p]);
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: p.value * 26 }, { rotate: `${p.value * 360}deg` }],
  }));
  return (
    <Pressable
      onPress={toggle}
      hitSlop={10}
      style={{
        width: 56,
        height: 30,
        borderRadius: 15,
        padding: 2,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Animated.View
        style={[
          {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.text,
            alignItems: 'center',
            justifyContent: 'center',
          },
          knob,
        ]}
      >
        <Ionicons name={isDark ? 'moon' : 'sunny'} size={13} color={colors.bg} />
      </Animated.View>
    </Pressable>
  );
}

/* ---------------------------------- Screen -------------------------------- */

export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: SCREEN_PAD,
          paddingBottom: 48,
          gap: 16,
        }}
      >
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <AppText variant="title">{title}</AppText>
            {subtitle ? (
              <AppText variant="caption" muted style={{ marginTop: 2, textTransform: 'capitalize' }}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
          <ThemeToggle />
        </Animated.View>
        {children}
      </ScrollView>
    </View>
  );
}

/* ---------------------------- Sheet / Field / Misc ------------------------ */

export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.overlay }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
        <Animated.View
          entering={SlideInDown.duration(380).easing(Easing.out(Easing.cubic))}
          style={{
            maxHeight: '88%',
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            paddingTop: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.border,
              marginBottom: 14,
            }}
          />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 24, gap: 16 }}
          >
            <AppText variant="title" style={{ fontSize: 22 }}>
              {title}
            </AppText>
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Field({ label, ...rest }: TextInputProps & { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <AppText variant="label" muted>
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={colors.textMuted}
        {...rest}
        style={{
          backgroundColor: colors.surfaceAlt,
          color: colors.text,
          borderRadius: radius.md,
          paddingHorizontal: 14,
          paddingVertical: 13,
          fontSize: 16,
          fontWeight: '600',
        }}
      />
    </View>
  );
}

export function ColorPicker({
  colors: options,
  value,
  onChange,
}: {
  colors: string[];
  value: string;
  onChange: (c: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {options.map((c) => (
        <ScalePressable
          key={c}
          haptic
          onPress={() => onChange(c)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: c,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: value === c ? colors.text : 'transparent',
          }}
        >
          {value === c && <Ionicons name="checkmark" size={16} color="#fff" />}
        </ScalePressable>
      ))}
    </View>
  );
}

export function MonthNav({
  label,
  onPrev,
  onNext,
  nextDisabled,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  const { colors } = useTheme();
  const btn = {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <ScalePressable onPress={onPrev} style={btn} haptic>
        <Ionicons name="chevron-back" size={18} color={colors.text} />
      </ScalePressable>
      <AppText variant="heading">{label}</AppText>
      <ScalePressable
        onPress={onNext}
        disabled={nextDisabled}
        style={[btn, nextDisabled && { opacity: 0.3 }]}
        haptic
      >
        <Ionicons name="chevron-forward" size={18} color={colors.text} />
      </ScalePressable>
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
      <AppText variant="caption" muted>
        {text}
      </AppText>
    </View>
  );
}
