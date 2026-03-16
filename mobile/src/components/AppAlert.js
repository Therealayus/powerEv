import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';

/**
 * Themed in-app alert modal. Use via useAlert().showAlert(title, message, variant).
 * Matches app UI: dark card, primary/success green, error red, accent blue.
 */
const variantStyles = (colors) => ({
  error: { borderColor: colors.error, iconColor: colors.error },
  success: { borderColor: colors.success, iconColor: colors.success },
  info: { borderColor: colors.accent, iconColor: colors.accent },
});

export default function AppAlert({ visible, title, message, variant = 'error', onDismiss }) {
  const { colors } = useTheme();
  const variantStyle = variantStyles(colors)[variant] || variantStyles(colors).error;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={onDismiss}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={[styles.card, { backgroundColor: colors.card, borderColor: variantStyle.borderColor }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}
          <TouchableOpacity
            onPress={onDismiss}
            style={[styles.button, { backgroundColor: variantStyle.iconColor }]}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: spacing.cardRadius,
    borderWidth: 2,
    padding: spacing.xl,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    borderRadius: spacing.buttonRadius,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
