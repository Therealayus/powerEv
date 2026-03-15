import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { getChargingHistory } from '../services/api';
import { spacing, typography, shadows } from '../theme';
import SectionHeader from '../components/SectionHeader';
import Loader from '../components/Loader';

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(start, end) {
  if (!start || !end) return '—';
  const ms = new Date(end) - new Date(start);
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m} min`;
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
    list: { padding: spacing.lg, paddingBottom: 100 },
    card: { backgroundColor: colors.card, borderRadius: spacing.cardRadius, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.card },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    cardIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary + '26', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    cardHeaderText: { flex: 1 },
    stationName: { ...typography.h3, color: colors.text },
    date: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    stat: {},
    statLabel: { ...typography.caption, color: colors.textSecondary },
    statValue: { ...typography.body, color: colors.text, fontWeight: '600', marginTop: 2 },
    cost: { color: colors.primary },
    empty: { alignItems: 'center', paddingVertical: spacing.xxl },
    emptyIconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.textSecondary + '1A', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
    emptyTitle: { ...typography.h3, color: colors.text },
    emptyText: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.sm },
  }), [colors]);

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await getChargingHistory();
      setSessions(data);
    } catch (e) {
      Alert.alert('Error', 'Could not load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  if (loading) return <Loader message="Loading history..." />;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Icon name="ev-station" size={24} color={colors.primary} />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.stationName}>{item.stationId?.name || 'Station'}</Text>
          <Text style={styles.date}>{formatDate(item.endTime || item.startTime)}</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Units</Text>
          <Text style={styles.statValue}>{(item.unitsConsumed || 0).toFixed(2)} kWh</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Cost</Text>
          <Text style={[styles.statValue, styles.cost]}>{`₹${(item.cost || 0).toFixed(2)}`}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{formatDuration(item.startTime, item.endTime)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionHeader title="Charging history" />
      </View>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Icon name="history" size={48} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No charging history yet</Text>
            <Text style={styles.emptyText}>Your sessions will appear here after you charge</Text>
          </View>
        }
      />
    </View>
  );
}

