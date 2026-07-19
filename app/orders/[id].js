/**
 * app/orders/[id].js
 * Halaman Detail Pesanan — PROTECTED ROUTE
 *
 * Fitur:
 * - Route Protection via JWT (redirect login jika token tidak valid)
 * - Tombol "Foto Bukti" → buka expo-camera
 * - Tombol "Lihat Peta" → buka react-native-maps dengan koordinat restoran
 * - Tampilkan foto bukti setelah diambil
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../../components/layout/Header';
import Colors from '../../constants/Colors';
import { MOCK_ORDERS } from '../../constants/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { calcOrderTotal, formatDate, formatPrice } from '../../utils/formatters';

const STATUS_CONFIG = {
  delivered: {
    color: Colors.success,
    bg: Colors.success + '15',
    icon: 'checkmark-circle',
    label: 'Pesanan Terkirim',
    desc: 'Pesanan Anda telah berhasil diterima.',
  },
  processing: {
    color: Colors.warning,
    bg: Colors.warning + '15',
    icon: 'time',
    label: 'Sedang Diproses',
    desc: 'Pesanan Anda sedang disiapkan.',
  },
  cancelled: {
    color: Colors.danger,
    bg: Colors.danger + '15',
    icon: 'close-circle',
    label: 'Pesanan Dibatalkan',
    desc: 'Pesanan ini telah dibatalkan.',
  },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();

  // Foto bukti dari kamera
  const [proofPhoto, setProofPhoto] = useState(null);

  // ── Route Protection ────────────────────────────────
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      Alert.alert(
        'Sesi Berakhir',
        'Token Anda tidak valid atau sudah kedaluwarsa.',
        [{ text: 'Login', onPress: () => router.replace('/(auth)/login') }]
      );
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Memverifikasi sesi...</Text>
      </View>
    );
  }
  if (!isAuthenticated) return null;

  const order = MOCK_ORDERS.find((o) => o.id === String(id));

  if (!order) {
    return (
      <View style={styles.notFound}>
        <Header title="Detail Pesanan" showBack />
        <View style={styles.notFoundBody}>
          <Text style={styles.notFoundIcon}>📭</Text>
          <Text style={styles.notFoundText}>Pesanan tidak ditemukan</Text>
        </View>
      </View>
    );
  }

  const status   = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.processing;
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total    = calcOrderTotal(order.items, order.deliveryFee);
  const location = order.restaurant;

  // ── Buka kamera ─────────────────────────────────────
  function openCamera() {
    router.push({
      pathname: '/camera',
      params: { orderId: order.id },
    });
  }

  // ── Buka maps ────────────────────────────────────────
  function openMaps() {
    if (!location) {
      Alert.alert('Info', 'Lokasi restoran tidak tersedia untuk pesanan ini.');
      return;
    }
    router.push({
      pathname: '/maps',
      params: {
        lat:     String(location.lat),
        lng:     String(location.lng),
        name:    location.name,
        address: order.address,
      },
    });
  }

  return (
    <View style={styles.root}>
      <Header title="Detail Pesanan" showBack />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Status Banner ──────────────────── */}
        <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon} size={28} color={status.color} />
          <View style={styles.statusText}>
            <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
            <Text style={styles.statusDesc}>{status.desc}</Text>
          </View>
        </View>

        {/* ── Aksi Cepat: Camera & Maps ──────── */}
        <View style={styles.actionRow}>
          {/* Tombol Foto Bukti */}
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: Colors.primary }]}
            onPress={openCamera}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="camera" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Foto Bukti</Text>
            <Text style={styles.actionSub}>Ambil foto penerimaan</Text>
          </TouchableOpacity>

          {/* Tombol Lihat Peta */}
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: Colors.info }]}
            onPress={openMaps}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.info + '15' }]}>
              <Ionicons name="map" size={22} color={Colors.info} />
            </View>
            <Text style={styles.actionLabel}>Lihat Peta</Text>
            <Text style={styles.actionSub}>Lokasi restoran</Text>
          </TouchableOpacity>
        </View>

        {/* ── Foto Bukti (jika sudah diambil) ─── */}
        {proofPhoto && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="camera" size={16} color={Colors.primary} />
              <Text style={styles.cardTitle}>Foto Bukti Penerimaan</Text>
            </View>
            <Image
              source={{ uri: proofPhoto }}
              style={styles.proofImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removePhotoBtn}
              onPress={() => setProofPhoto(null)}
            >
              <Text style={styles.removePhotoText}>Hapus foto</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Informasi Pesanan ──────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Pesanan</Text>
          {[
            { label: 'ID Pesanan', value: order.id },
            { label: 'Tanggal',    value: formatDate(order.date) },
            { label: 'Alamat',     value: order.address },
            ...(order.note ? [{ label: 'Catatan', value: order.note }] : []),
            ...(location   ? [{ label: 'Restoran', value: location.name }] : []),
          ].map((row) => (
            <View key={row.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue} numberOfLines={2}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Item Pesanan ───────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Item Pesanan</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyText}>{item.qty}x</Text>
                </View>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatPrice(item.price * item.qty)}</Text>
            </View>
          ))}
          <View style={styles.separator} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Ongkos Kirim</Text>
            <Text style={styles.priceValue}>{formatPrice(order.deliveryFee)}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
          </View>
        </View>

        {/* ── JWT Info ──────────────────────── */}
        <View style={styles.secureNote}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
          <Text style={styles.secureText}>
            Halaman ini dilindungi JWT. Hanya bisa diakses dengan token yang valid.
          </Text>
        </View>

        {/* ── Ulasan ────────────────────────── */}
        {order.status === 'delivered' && (
          <TouchableOpacity
            style={styles.reviewBtn}
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert('Beri Ulasan', 'Fitur ulasan akan segera tersedia.', [
                { text: 'Nanti', style: 'cancel' },
                { text: '⭐ Beri Rating', onPress: () =>
                  Alert.alert('Terima Kasih! 🙏', 'Ulasan Anda telah kami catat.') },
              ])
            }
          >
            <Ionicons name="star-outline" size={18} color={Colors.primary} />
            <Text style={styles.reviewBtnText}>Beri Ulasan</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Kembali ke Pesanan</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16 },

  loading:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, color: Colors.textGray },

  // Status
  statusBanner: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 16, marginBottom: 16, gap: 12,
  },
  statusText:  { flex: 1 },
  statusLabel: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  statusDesc:  { fontSize: 13, color: Colors.textGray },

  // Aksi cepat Camera + Maps
  actionRow: {
    flexDirection: 'row', gap: 12, marginBottom: 16,
  },
  actionBtn: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  actionLabel: { fontSize: 14, fontWeight: '700', color: Colors.secondary },
  actionSub:   { fontSize: 11, color: Colors.textGray, marginTop: 2, textAlign: 'center' },

  // Foto bukti
  proofImage: {
    width: '100%', aspectRatio: 4 / 3,
    borderRadius: 12, marginTop: 10,
  },
  removePhotoBtn: { alignSelf: 'center', marginTop: 8, padding: 4 },
  removePhotoText: { fontSize: 12, color: Colors.danger, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.secondary },

  // Info
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 10, gap: 12,
  },
  infoLabel: {
    fontSize: 13, color: Colors.textGray, fontWeight: '500',
    width: 90, flexShrink: 0,
  },
  infoValue: {
    flex: 1, fontSize: 13, color: Colors.secondary,
    fontWeight: '600', textAlign: 'right',
  },

  // Order items
  orderItem: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  orderItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  qtyBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, minWidth: 30, alignItems: 'center',
  },
  qtyText:  { fontSize: 12, fontWeight: '700', color: Colors.primary },
  itemName: { flex: 1, fontSize: 14, color: Colors.secondary, fontWeight: '500' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: Colors.secondary },

  separator: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  priceRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 13, color: Colors.textGray },
  priceValue: { fontSize: 13, fontWeight: '600', color: Colors.secondary },
  totalRow:  { marginTop: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  totalLabel: { fontSize: 15, fontWeight: '700', color: Colors.secondary },
  totalAmount: { fontSize: 18, fontWeight: '900', color: Colors.primary },

  secureNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.success + '15',
    borderRadius: 10, padding: 10, marginBottom: 16,
  },
  secureText: { flex: 1, fontSize: 11, color: Colors.success, fontWeight: '500' },

  reviewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primaryLight,
    borderRadius: 14, paddingVertical: 14, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.primary + '40',
  },
  reviewBtnText: { fontSize: 15, fontWeight: '700', color: Colors.primary },

  backBtn:     { alignItems: 'center', paddingVertical: 10 },
  backBtnText: { fontSize: 14, color: Colors.textGray, fontWeight: '500' },

  notFound:     { flex: 1, backgroundColor: Colors.background },
  notFoundBody: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  notFoundIcon: { fontSize: 52, marginBottom: 12 },
  notFoundText: { fontSize: 17, color: Colors.secondary, fontWeight: '600' },
});
