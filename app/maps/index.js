/**
 * app/maps/index.js
 * Halaman Peta Restoran / Lokasi Pengiriman
 *
 * Fitur:
 * - Tampilkan peta dengan marker lokasi restoran
 * - Koordinat bisa diterima via query params (lat, lng, name)
 * - Tombol kembali ke halaman sebelumnya
 * - Fallback ke koordinat default jika params tidak ada
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

// Koordinat default: Monas, Jakarta Pusat
const DEFAULT_LOCATION = {
  latitude:  -6.1754,
  longitude: 106.8272,
  name:      'FlavorDash Kitchen',
  address:   'Jl. Merdeka Selatan, Jakarta Pusat',
};

// Data restoran dummy untuk ditampilkan di peta
const RESTAURANT_MARKERS = [
  {
    id: 'r1',
    name: 'FlavorDash Kitchen Pusat',
    address: 'Jl. Merdeka Selatan No.1, Jakarta Pusat',
    latitude:  -6.1754,
    longitude: 106.8272,
    type: 'kitchen',
  },
  {
    id: 'r2',
    name: 'FlavorDash Cabang Selatan',
    address: 'Jl. Sudirman No.45, Jakarta Selatan',
    latitude:  -6.2088,
    longitude: 106.8456,
    type: 'branch',
  },
  {
    id: 'r3',
    name: 'FlavorDash Cabang Barat',
    address: 'Jl. Kebon Jeruk No.12, Jakarta Barat',
    latitude:  -6.1945,
    longitude: 106.7891,
    type: 'branch',
  },
];

export default function MapsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Ambil koordinat dari params atau gunakan default
  const targetLat  = params.lat  ? parseFloat(params.lat)  : DEFAULT_LOCATION.latitude;
  const targetLng  = params.lng  ? parseFloat(params.lng)  : DEFAULT_LOCATION.longitude;
  const targetName = params.name ?? DEFAULT_LOCATION.name;
  const targetAddr = params.address ?? DEFAULT_LOCATION.address;

  const initialRegion = {
    latitude:       targetLat,
    longitude:      targetLng,
    latitudeDelta:  0.05,
    longitudeDelta: 0.05,
  };

  const MARKER_COLORS = {
    kitchen: Colors.primary,
    branch:  Colors.info,
    target:  Colors.danger,
  };

  return (
    <View style={styles.root}>
      {/* ── Header ───────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.secondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Lokasi Restoran</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{targetName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Map ──────────────────────────────── */}
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Marker tujuan (dari params) */}
        {params.lat && (
          <Marker
            coordinate={{ latitude: targetLat, longitude: targetLng }}
            pinColor={Colors.danger}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>{targetName}</Text>
                <Text style={styles.calloutAddr}>{targetAddr}</Text>
              </View>
            </Callout>
          </Marker>
        )}

        {/* Marker restoran FlavorDash */}
        {RESTAURANT_MARKERS.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude:  restaurant.latitude,
              longitude: restaurant.longitude,
            }}
            pinColor={MARKER_COLORS[restaurant.type] ?? Colors.primary}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <View style={styles.calloutHeader}>
                  <Ionicons name="restaurant" size={14} color={Colors.primary} />
                  <Text style={styles.calloutName}>{restaurant.name}</Text>
                </View>
                <Text style={styles.calloutAddr}>{restaurant.address}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* ── Legend ───────────────────────────── */}
      <View style={[styles.legend, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.legendTitle}>Keterangan</Text>
        <View style={styles.legendItems}>
          {[
            { color: Colors.danger,  label: 'Lokasi Tujuan' },
            { color: Colors.primary, label: 'Dapur Pusat' },
            { color: Colors.info,    label: 'Cabang FlavorDash' },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { fontSize: 16, fontWeight: '700', color: Colors.secondary },
  headerSub:    { fontSize: 12, color: Colors.textGray, marginTop: 2 },

  // Map
  map: { flex: 1 },

  // Callout popup
  callout: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  calloutHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  calloutName:   { fontSize: 13, fontWeight: '700', color: Colors.secondary },
  calloutAddr:   { fontSize: 11, color: Colors.textGray, marginTop: 2 },

  // Legend
  legend: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textGray,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendItems: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:   { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: Colors.secondary },
});
