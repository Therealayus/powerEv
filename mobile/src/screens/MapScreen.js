import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getStations } from '../services/api';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, shadows } from '../theme';

const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const PEEK_HEIGHT = 140;
const SNAP_POINTS_FULL = 0;

const springConfig = { damping: 22, stiffness: 200 };

function getSnapPoint(translateY, sheetHeight, height) {
  const peek = sheetHeight - PEEK_HEIGHT;
  const half = sheetHeight * 0.48;
  const points = [SNAP_POINTS_FULL, half, peek];
  let nearest = points[0];
  let minDist = Math.abs(translateY - points[0]);
  for (const p of points) {
    const d = Math.abs(translateY - p);
    if (d < minDist) {
      minDist = d;
      nearest = p;
    }
  }
  return nearest;
}

// Dark map style (when device is in dark mode)
const mapStyleDark = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
];

// Light map style (when device is in light mode) – subtle, matches app light theme
const mapStyleLight = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e3e9ec' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
];

export default function MapScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const markerColors = { green: colors.markerGreen, orange: colors.markerOrange, red: colors.markerRed };
  const customMapStyle = isDark ? mapStyleDark : mapStyleLight;
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState(DEFAULT_REGION);
  const { height } = useWindowDimensions();
  const mapRef = useRef(null);
  const styles = React.useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    searchWrap: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 44 + spacing.lg, left: spacing.lg, right: spacing.lg, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: spacing.buttonRadius, paddingHorizontal: spacing.md, height: 52, borderWidth: 1, borderColor: colors.border, ...shadows.float },
    searchIcon: { marginRight: spacing.sm },
    searchInput: { flex: 1, ...typography.body, color: colors.text, paddingVertical: 0 },
    fabContainer: { position: 'absolute', right: spacing.lg, bottom: PEEK_HEIGHT + spacing.lg, gap: spacing.sm },
    fab: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, ...shadows.float },
    fabSecond: { marginTop: spacing.sm },
    sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.card, borderTopLeftRadius: spacing.cardRadius, borderTopRightRadius: spacing.cardRadius, borderWidth: 1, borderBottomWidth: 0, borderColor: colors.border, ...shadows.float },
    sheetHandle: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center' },
    handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.sm },
    sheetTitle: { ...typography.h3, color: colors.text },
    sheetList: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl + 32 },
    stationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.md },
    stationRowText: { flex: 1 },
    stationRowName: { ...typography.body, color: colors.text, fontWeight: '600' },
    stationRowMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    stationMarker: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: '#FFFFFF',
      ...shadows.float,
    },
  }), [colors]);

  const sheetHeight = height * 0.92;
  const snapPeek = sheetHeight - PEEK_HEIGHT;

  const translateY = useSharedValue(snapPeek);
  const contextY = useSharedValue(0);

  const filteredStations = search.trim()
    ? stations.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          (s.address && s.address.toLowerCase().includes(search.toLowerCase()))
      )
    : stations;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getStations();
        if (!cancelled) setStations(data);
      } catch (e) {
        if (!cancelled) Alert.alert('Error', 'Could not load stations. Is the backend running?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = contextY.value + e.translationY;
      translateY.value = Math.max(SNAP_POINTS_FULL, Math.min(snapPeek, next));
    })
    .onEnd((e) => {
      const snap = getSnapPoint(translateY.value, sheetHeight, height);
      const velocity = e.velocityY;
      if (Math.abs(velocity) > 300) {
        if (velocity > 0) {
          const lower = [snapPeek, sheetHeight * 0.48, SNAP_POINTS_FULL].filter((p) => p > translateY.value);
          const next = lower.length ? Math.min(...lower) : snapPeek;
          translateY.value = withSpring(next, springConfig);
        } else {
          const higher = [SNAP_POINTS_FULL, sheetHeight * 0.48, snapPeek].filter((p) => p < translateY.value);
          const next = higher.length ? Math.max(...higher) : SNAP_POINTS_FULL;
          translateY.value = withSpring(next, springConfig);
        }
      } else {
        translateY.value = withSpring(snap, springConfig);
      }
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleBarOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [snapPeek, sheetHeight * 0.48, SNAP_POINTS_FULL],
      [1, 0.6, 0.4],
      Extrapolation.CLAMP
    ),
  }));

  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        { title: 'Location', message: 'EV Charging needs your location to show you on the map and find nearby stations.' }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  const goToMyLocation = () => {
    requestLocationPermission().then((ok) => {
      if (!ok) {
        Alert.alert('Location', 'Allow location access to center the map on you.');
        return;
      }
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const region = {
            latitude,
            longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          };
          if (mapRef.current) {
            mapRef.current.animateToRegion(region, 500);
          }
        },
        (err) => Alert.alert('Location', err.message || 'Could not get your location.'),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  const fitAllStations = () => {
    if (!mapRef.current || filteredStations.length === 0) return;
    const lats = filteredStations.map((s) => s.latitude);
    const lngs = filteredStations.map((s) => s.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const pad = 0.008;
    mapRef.current.fitToCoordinates(
      [
        { latitude: minLat - pad, longitude: minLng - pad },
        { latitude: maxLat + pad, longitude: maxLng + pad },
      ],
      { edgePadding: { top: 80, right: 40, bottom: 200, left: 40 }, animated: true }
    );
  };

  if (loading) return <Loader message="Loading stations..." />;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        mapType="standard"
        customMapStyle={customMapStyle}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {stations.map((s) => {
          const markerColor = markerColors[s.markerColor] || colors.primary;
          return (
            <Marker
              key={s._id}
              coordinate={{ latitude: s.latitude, longitude: s.longitude }}
              title={s.name}
              description={`${s.availableChargers}/${s.totalChargers} available · $${s.pricePerKwh}/kWh`}
              tracksViewChanges={false}
              onPress={() => navigation.navigate('StationDetail', { stationId: s._id })}
              onCalloutPress={() => navigation.navigate('StationDetail', { stationId: s._id })}
            >
              <View style={[styles.stationMarker, { backgroundColor: markerColor }]}>
                <Icon name="local-gas-station" size={22} color="#FFFFFF" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Floating search */}
      <View style={styles.searchWrap}>
        <Icon name="search" size={22} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stations..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={12}>
            <Icon name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* FABs - right side */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={goToMyLocation}
          activeOpacity={0.85}
        >
          <Icon name="my-location" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, styles.fabSecond]}
          onPress={fitAllStations}
          activeOpacity={0.85}
        >
          <Icon name="layers" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Draggable bottom sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { height: sheetHeight },
          sheetAnimatedStyle,
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheetHandle, handleBarOpacity]}>
            <View style={styles.handleBar} />
            <Text style={styles.sheetTitle}>Nearby stations · {filteredStations.length}</Text>
          </Animated.View>
        </GestureDetector>
        <FlatList
            data={filteredStations}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.stationRow}
                onPress={() => navigation.navigate('StationDetail', { stationId: item._id })}
                activeOpacity={0.8}
              >
                <View style={[styles.dot, { backgroundColor: markerColors[item.markerColor] || colors.primary }]} />
                <View style={styles.stationRowText}>
                  <Text style={styles.stationRowName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.stationRowMeta} numberOfLines={1}>
                    {item.availableChargers}/{item.totalChargers} · ${item.pricePerKwh}/kWh
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          />
      </Animated.View>
    </View>
  );
}
