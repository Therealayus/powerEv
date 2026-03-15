import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, shadows } from '../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Primary gradient button with press scale and optional loading state
 */
export default function PrimaryButton({ title, onPress, loading, disabled, style, variant = 'primary' }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const gradientColors =
    variant === 'danger'
      ? disabled ? [colors.border, colors.border] : ['#DC2626', '#B91C1C']
      : disabled ? [colors.border, colors.border] : [colors.primary, '#16A34A'];

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[styles.wrapper, animatedStyle, style]}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: spacing.buttonRadius,
    overflow: 'hidden',
    ...shadows.button,
  },
  gradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  text: typography.button,
});
