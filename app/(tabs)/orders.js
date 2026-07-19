/**
 * app/(tabs)/orders.js
 * Halaman Riwayat Pesanan — PROTECTED ROUTE
 *
 * Hanya bisa diakses jika token JWT valid.
 * Menampilkan daftar pesanan dan link ke detail masing-masing.
 */

import { useRouter } from 'expo-router';
import {
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import OrderCard from '../../components/cards/OrderCard';
import Colors from '../../constants/Colors';
import { MOCK_ORDERS } from '../../constants/mockData';
import { useAuth } from '../../contexts/AuthContext';

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  const paddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : insets.top + 8;

  // Extra protection layer: jika tidak auth, tampilkan prompt login
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
      {/* ── Header ───────────────────────────────── */}
      <View style={[styles.header, { paddingTop }]}>
        <Text style={styles.title}>Pesanan Saya 📦</Text>
        <Text style={styles.subtitle}>{MOCK_ORDERS.length} pesanan tercatat</Text>
      </View>

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            // Navigasi ke halaman detail pesanan (protected route)
            onPress={(o) => router.push(`/orders/${o.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
            <Text style={styles.emptyText}>Yuk pesan makanan favoritmu sekarang!</Text>
            <TouchableOpacity
              style={styles.orderBtn}
              onPress={() => router.push('/(tabs)/catalog')}
            >
              <Text style={styles.orderBtnText}>Lihat Katalog</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textGray,
    marginTop: 2,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 24,
  },

  // Guest state
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  guestIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 8,
  },
  guestText: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  loginBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  orderBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  orderBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
