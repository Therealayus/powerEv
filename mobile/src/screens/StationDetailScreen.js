import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getStationById, getChargers, startCharging } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { spacing, typography } from '../theme';
import StationCard from '../components/StationCard';
import SectionHeader from '../components/SectionHeader';
import PrimaryButton from '../components/PrimaryButton';
import Loader from '../components/Loader';

export default function StationDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const { stationId } = route.params;
  const [station, setStation] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    chargerList: { marginBottom: spacing.lg },
    chargerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: spacing.buttonRadius, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    chargerIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.textSecondary + '33', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    chargerIconAvailable: { backgroundColor: colors.primary + '33' },
    chargerInfo: { flex: 1 },
    chargerType: { ...typography.body, color: colors.text, fontWeight: '600' },
    chargerPower: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: 10, backgroundColor: colors.border },
    statusAvailable: { backgroundColor: colors.primary + '40' },
    statusText: { ...typography.caption, color: colors.textSecondary },
    btn: { marginTop: spacing.lg },
  }), [colors]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [stationRes, chargersRes] = await Promise.all([
          getStationById(stationId),
          getChargers(stationId),
        ]);
        if (!cancelled) {
          setStation(stationRes.data);
          setChargers(chargersRes.data);
        }
      } catch (e) {
        if (!cancelled) showAlert('Error', 'Could not load station');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [stationId]);

  const availableCharger = chargers.find((c) => c.status === 'available');

  const handleStartCharging = async () => {
    if (!availableCharger) {
      showAlert('No charger available', 'All chargers are in use or offline.', 'info');
      return;
    }
    setStarting(true);
    try {
      await startCharging({ stationId, chargerId: availableCharger._id });
      navigation.navigate('Main', { screen: 'Charging' });
    } catch (e) {
      showAlert('Error', e.response?.data?.message || 'Could not start charging');
    } finally {
      setStarting(false);
    }
  };

  if (loading || !station) return <Loader message="Loading station..." />;

  const available = station.availableChargers ?? chargers.filter((c) => c.status === 'available').length;
  const total = station.totalChargers ?? chargers.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StationCard
        name={station.name}
        address={station.address}
        pricePerKwh={station.pricePerKwh}
        availableChargers={available}
        totalChargers={total}
      />
      <SectionHeader title="Chargers" />
      <View style={styles.chargerList}>
        {chargers.map((c) => (
          <View key={c._id} style={styles.chargerRow}>
            <View style={[styles.chargerIconWrap, c.status === 'available' && styles.chargerIconAvailable]}>
              <Icon
                name="bolt"
                size={22}
                color={c.status === 'available' ? colors.primary : colors.textSecondary}
              />
            </View>
            <View style={styles.chargerInfo}>
              <Text style={styles.chargerType}>{c.chargerType}</Text>
              <Text style={styles.chargerPower}>{c.powerKw} kW</Text>
            </View>
            <View style={[styles.statusBadge, c.status === 'available' && styles.statusAvailable]}>
              <Text style={styles.statusText}>{c.status}</Text>
            </View>
          </View>
        ))}
      </View>
      <PrimaryButton
        title={available ? 'Start Charging' : 'No charger available'}
        onPress={handleStartCharging}
        loading={starting}
        disabled={!available}
        style={styles.btn}
      />
    </ScrollView>
  );
}

