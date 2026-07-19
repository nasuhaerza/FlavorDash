/**
 * app/maps/index.js
 * Halaman Peta Restoran / Lokasi Pengiriman
 *
 * Fitur:
 * - react-native-maps dengan marker restoran FlavorDash
 * - Koordinat target dari params pesanan
 * - Tombol "Lokasi Saya" via expo-location (useLocation hook)
 * - Callout popup berisi nama & alamat
 * - Legend warna marker
 * - Animasi kamera ke marker tujuan
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Callout, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '../../constants/Colors';
import { useLocation } from '../../hooks/useLocation';

// Koordinat default: Monas, Jakarta Pusat
const DEFAULT = { lat: -6.1754, lng: 106.8272, name: 'FlavorDash Kitchen Pusat', address: 'Jl. Merdeka Selatan, Jakarta Pusat' };

// Restoran FlavorDash — selalu ditampilkan di peta
const RESTAURANTS = [
  { id: 'r1', name: 'FlavorDash Kitchen Pusat',    address: 'Jl. Merdeka Selatan No.1, Jakarta Pusat',  latitude: -6.1754, longitude: 106.8272, type: 'kitchen' },
  { id: 'r2', name: 'FlavorDash Cabang Selatan',   address: 'Jl. Sudirman No.45, Jakarta Selatan',      latitude: -6.2088, longitude: 106.8456, type: 'branch'  },
  { id: 'r3', name: 'FlavorDash Cabang Barat',     address: 'Jl. Kebon Jeruk No.12, Jakarta Barat',     latitude: -6.1945, longitude: 106.7891, type: 'branch'  },
];

const PIN_COLORS = { kitchen: Colors.primary, branch: Colors.info, target: Colors.danger };

export default function MapsScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const params  = useLocalSearchParams();
  const mapRef  = useRef(null);

  // ── expo-location hook ────────────────────────────
  const { location, loading: locLoading, fetchLocation } = useLocation();

  const targetLat  = params.lat  ? parseFloat(params.lat)  : DEFAULT.lat;
  const targetLng  = params.lng  ? parseFloat(params.lng)  : DEFAULT.lng;
  const targetName = params.name    ?? DEFAULT.name;
  const targetAddr = params.address ?? DEFAULT.address;

  const initialRegion = {
    latitude:       targetLat,
    longitude:      targetLng,
    latitudeDelta:  0.06,
    longitudeDelta: 0.06,
  };

  // ── Animasi kamera ke lokasi pengguna ────────────
  async function goToMyLocation() {
    const coords = await fetchLocation();
    if (!coords) return;
    mapRef.current?.animateToRegion({
      latitude:      coords.latitude,
      longitude:     coords.longitude,
      latitudeDelta:  0.01,
      longitudeDelta: 0.01,
    }, 800);
  }

  // ── Animasi kamera ke marker tujuan ──────────────
  function goToTarget() {
    mapRef.current?.animateToRegion({
      latitude:      targetLat,
      longitude:     targetLng,
      latitudeDelta:  0.02,
      longitudeDelta: 0.02,
    }, 800);
  }

  return (
    <View style={styles.root}>
      {/* ── Header ────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.secondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Lokasi Restoran</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{targetName}</Text>
        </View>
        {/* Tombol fokus ke tujuan */}
        <TouchableOpacity style={styles.focusBtn} onPress={goToTarget}>
          <Ionicons name="navigate" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Map ───────────────────────────── */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={!!location}
        showsCompass
      >
        {/* Marker tujuan (dari params pesanan) */}
        {params.lat && (
          <Marker
            coordinate={{ latitude: targetLat, longitude: targetLng }}
            pinColor={PIN_COLORS.target}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <View style={styles.calloutHeader}>
                  <Ionicons name="location" size={14} color={Colors.danger} />
                  <Text style={styles.calloutName}>{targetName}</Text>
                </View>
                <Text style={styles.calloutAddr}>{targetAddr}</Text>
              </View>
            </Callout>
          </Marker>
        )}

        {/* Marker restoran */}
        {RESTAURANTS.map((r) => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.latitude, longitude: r.longitude }}
            pinColor={PIN_COLORS[r.type]}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <View style={styles.calloutHeader}>
                  <Ionicons name="restaurant" size={14} color={Colors.primary} />
                  <Text style={styles.calloutName}>{r.name}</Text>
                </View>
                <Text style={styles.calloutAddr}>{r.address}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* ── FAB Lokasi Saya ───────────────── */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={goToMyLocation}
        disabled={locLoading}
        activeOpacity={0.85}
      >
        {locLoading
          ? <ActivityIndicator size="small" color="#fff" />
          : <Ionicons name="locate" size={22} color="#fff" />
        }
      </TouchableOpacity>

      {/* ── Legend ────────────────────────── */}
      <View style={[styles.legend, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.legendTitle}>Keterangan</Text>
        <View style={styles.legendItems}>
          {[
            { color: Colors.danger,  label: 'Lokasi Tujuan'    },
            { color: Colors.primary, label: 'Dapur Pusat'      },
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

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 3,
  },
  backBtn:      { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { fontSize: 16, fontWeight: '700', color: Colors.secondary },
  headerSub:    { fontSize: 12, color: Colors.textGray, marginTop: 2 },
  focusBtn:     { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },

  map: { flex: 1 },

  // FAB Lokasi Saya
  fab: {
    position: 'absolute',
    right: 16,
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },

  callout: {
    backgroundColor: Colors.surface,
    borderRadius: 10, padding: 10, maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  calloutHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  calloutName:   { fontSize: 13, fontWeight: '700', color: Colors.secondary, flexShrink: 1 },
  calloutAddr:   { fontSize: 11, color: Colors.textGray },

  legend: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  legendTitle:  { fontSize: 11, fontWeight: '700', color: Colors.textGray, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  legendItems:  { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  legendItem:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:    { width: 10, height: 10, borderRadius: 5 },
  legendLabel:  { fontSize: 12, color: Colors.secondary },
});
