import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, shadows } from '../theme';

/**
 * Card displaying station summary - used in lists and detail headers
 */
export default function StationCard({ name, address, pricePerKwh, availableChargers, totalChargers, onPress }) {
  const { colors } = useTheme();
  const statusColor =
    availableChargers === 0
      ? colors.markerRed
      : availableChargers >= totalChargers / 2
      ? colors.markerGreen
      : colors.markerOrange;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <Icon name="ev-station" size={28} color={colors.primary} />
        <View style={[styles.badge, { backgroundColor: colors.textSecondary + '15' }]}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
            {availableChargers}/{totalChargers} available
          </Text>
        </View>
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
      <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={2}>
        {address}
      </Text>
      <Text style={[styles.price, { color: colors.primary }]}>₹{Number(pricePerKwh).toFixed(2)}/kWh</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: spacing.cardRadius, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, ...shadows.card },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: typography.caption,
  name: { ...typography.h2, marginBottom: spacing.xs },
  address: { ...typography.bodySmall, marginBottom: spacing.sm },
  price: { ...typography.body, fontWeight: '600' },
});
