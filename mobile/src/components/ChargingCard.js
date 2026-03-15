import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, shadows } from '../theme';

/**
 * Card for charging dashboard stats (timer, units, cost, speed)
 */
export function ChargingCard({ icon, label, value, unit }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.accent + '26' }]}>
        <Icon name={icon} size={24} color={colors.accent} />
      </View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {value}
        {unit ? <Text style={[styles.unit, { color: colors.textSecondary }]}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

/**
 * Battery progress for charging screen - large rounded bar + percentage
 */
export function BatteryProgress({ percent, charging }) {
  const { colors } = useTheme();
  const p = Math.min(100, Math.max(0, percent));
  return (
    <View style={styles.batteryWrap}>
      <View style={[styles.barOuter, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.barInner, { width: `${p}%`, backgroundColor: colors.primary }]} />
      </View>
      <Text style={[styles.batteryText, { color: colors.text }]}>{Math.round(p)}%</Text>
      {charging && (
        <View style={styles.chargingBadge}>
          <Icon name="bolt" size={14} color={colors.primary} />
          <Text style={[styles.chargingText, { color: colors.primary }]}>Charging</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: spacing.cardRadius, padding: spacing.lg, alignItems: 'center', borderWidth: 1, minWidth: '47%', ...shadows.card },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  label: typography.caption,
  value: { ...typography.h2, marginTop: 2 },
  unit: { ...typography.bodySmall, fontWeight: '400' },
  batteryWrap: { marginVertical: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  batteryText: { ...typography.h1, fontSize: 32 },
  chargingBadge: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: 4 },
  chargingText: typography.caption,
  barOuter: { width: '85%', height: 28, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  barInner: { height: '100%', borderRadius: 12 },
});
