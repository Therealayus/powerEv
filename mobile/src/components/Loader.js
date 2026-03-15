import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';

/**
 * Full-screen loading with subtle pulse
 */
export default function Loader({ message }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.6);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.indicatorWrap, pulseStyle]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Animated.View>
      {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  indicatorWrap: { marginBottom: spacing.md },
  message: typography.body,
});
