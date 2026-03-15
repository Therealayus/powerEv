import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, shadows } from '../theme';

/**
 * Base card - rounded, elevated, consistent border
 */
export default function Card({ children, style }) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: spacing.cardRadius, padding: spacing.lg, borderWidth: 1, ...shadows.card },
});
