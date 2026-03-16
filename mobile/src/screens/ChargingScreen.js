import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getActiveCharging, stopCharging } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { spacing, typography } from '../theme';
import { ChargingCard, BatteryProgress } from '../components/ChargingCard';
import PrimaryButton from '../components/PrimaryButton';
import Loader from '../components/Loader';

function formatDuration(ms) {
  if (!ms) return '0:00';
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ChargingScreen() {
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState(false);
  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
    stationName: { ...typography.h2, color: colors.text },
    statusBadge: { backgroundColor: colors.primary + '30', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 12 },
    status: { ...typography.caption, color: colors.primary, fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
    stopBtn: { marginTop: spacing.lg },
    stopBtnWrap: { marginTop: 'auto', paddingBottom: spacing.xl },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    emptyIconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.border + '40', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
    emptyEmoji: { fontSize: 40 },
    emptyTitle: { ...typography.h3, color: colors.text },
    emptyText: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
  }), [colors]);

  const fetchActive = async () => {
    try {
      const { data } = await getActiveCharging();
      setSession(data || null);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStop = async () => {
    setStopping(true);
    try {
      await stopCharging();
      setSession(null);
    } catch (e) {
      showAlert('Error', e.response?.data?.message || 'Could not stop charging');
    } finally {
      setStopping(false);
    }
  };

  if (loading && !session) return <Loader message="Loading..." />;

  if (!session) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIconWrap}>
          <Text style={styles.emptyEmoji}>🔌</Text>
        </View>
        <Text style={styles.emptyTitle}>No active charging</Text>
        <Text style={styles.emptyText}>Select a station on the map and start charging</Text>
      </View>
    );
  }

  const startTime = session.startTime ? new Date(session.startTime).getTime() : Date.now();
  const elapsed = Date.now() - startTime;
  const powerKw = session.chargerId?.powerKw || 22;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stationName}>{session.stationId?.name || 'Charging'}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.status}>Charging</Text>
        </View>
      </View>
      <BatteryProgress percent={(session.unitsConsumed || 0) * 5} charging />
      <View style={styles.grid}>
        <ChargingCard icon="schedule" label="Time" value={formatDuration(elapsed)} />
        <ChargingCard
          icon="bolt"
          label="Units"
          value={(session.unitsConsumed || 0).toFixed(2)}
          unit="kWh"
        />
        <ChargingCard icon="currency-rupee" label="Cost" value={`₹${(session.cost || 0).toFixed(2)}`} />
        <ChargingCard icon="speed" label="Speed" value={powerKw} unit="kW" />
      </View>
      <View style={styles.stopBtnWrap}>
        <PrimaryButton
          title="Stop Charging"
          onPress={handleStop}
          loading={stopping}
          variant="danger"
        />
      </View>
    </View>
  );
}

