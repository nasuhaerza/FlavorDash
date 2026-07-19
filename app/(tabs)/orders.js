/**
 * app/(tabs)/orders.js
 * Riwayat Pesanan — PROTECTED ROUTE
 *
 * Data diambil dari Supabase via useOrders hook.
 * Realtime subscription via useRealtimeOrders — update otomatis.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import OrderCard from '../../components/cards/OrderCard';
import EmptyState from '../../components/ui/EmptyState';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuth();

  // Fetch orders (polling)
  const { data, loading, refreshing, error, source, refresh } = useOrders();

  // Realtime subscription — update otomatis saat status berubah
  const { orders: realtimeOrders } = useRealtimeOrders(user?.id);

  // Pakai realtimeOrders jika ada, fallback ke data polling
  const displayOrders = realtimeOrders.length > 0 ? realtimeOrders : data;

  const paddingTop =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + 8
      : insets.top + 8;

  // Guest state
  if (!isAuthenticated) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestIcon}>🔒</Text>
        <Text style={styles.guestTitle}>Login Diperlukan</Text>
        <Text style={styles.guestText}>
          Anda perlu login untuk melihat riwayat pesanan.
        </Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginBtnText}>Masuk Sekarang</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ── Header ──────────────────────── */}
      <View style={[styles.header, { paddingTop }]}>
        <View>
          <Text style={styles.title}>Pesanan Saya 📦</Text>
          <Text style={styles.subtitle}>
            {loading ? 'Memuat...' : `${displayOrders.length} pesanan tercatat`}
          </Text>
        </View>
        {loading && !refreshing && (
          <ActivityIndicator size="small" color={Colors.primary} />
        )}
      </View>

      {/* Sumber data */}
      {source === 'supabase' && !loading && (
        <View style={[styles.sourceBanner, { backgroundColor: Colors.success + '15' }]}>
          <Ionicons name="cloud-done-outline" size={13} color={Colors.success} />
          <Text style={[styles.sourceBannerText, { color: Colors.success }]}>
            Live — Supabase Realtime aktif
          </Text>
        </View>
      )}
      {source === 'local' && !loading && (
        <View style={styles.sourceBanner}>
          <Ionicons name="cloud-offline-outline" size={13} color={Colors.warning} />
          <Text style={styles.sourceBannerText}>Data dari cache lokal</Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <EmptyState
          icon="cloud-offline-outline"
          title="Gagal Memuat"
          message={error}
          actionLabel="Coba Lagi"
          onAction={refresh}
        />
      )}

      {/* List */}
      {!error && (
        <FlatList
          data={displayOrders}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={(o) => router.push(`/orders/${o.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            !loading && (
              <EmptyState
                emoji="🛒"
                title="Belum ada pesanan"
                message="Yuk pesan makanan favoritmu sekarang!"
                actionLabel="Lihat Katalog"
                onAction={() => router.push('/(tabs)/catalog')}
              />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title:    { fontSize: 22, fontWeight: '800', color: Colors.secondary },
  subtitle: { fontSize: 13, color: Colors.textGray, marginTop: 2 },

  sourceBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: 16, paddingVertical: 7,
  },
  sourceBannerText: { fontSize: 12, color: Colors.warning, fontWeight: '500' },

  list: { paddingTop: 8, paddingBottom: 24 },

  guestContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 32, backgroundColor: Colors.background,
  },
  guestIcon:    { fontSize: 56, marginBottom: 16 },
  guestTitle:   { fontSize: 20, fontWeight: '800', color: Colors.secondary, marginBottom: 8 },
  guestText:    { fontSize: 14, color: Colors.textGray, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  loginBtn:     { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  loginBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
