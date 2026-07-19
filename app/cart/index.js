/**
 * app/cart/index.js
 * Halaman Keranjang Belanja — Modal presentation
 *
 * Menampilkan semua item di cart, qty selector, dan total harga
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Colors from '../../constants/Colors';
import { useCart } from '../../contexts/CartContext';
import { createOrder } from '../../services/supabaseFoodService';
import { formatPrice } from '../../utils/formatters';


// Komponen satu baris item keranjang
function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
          <Ionicons name="remove" size={14} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.qty}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
          <Ionicons name="add" size={14} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <Ionicons name="trash-outline" size={16} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart, updateQty, removeFromCart, clearCart, cartTotal, cartCount } = useCart();

  const DELIVERY_FEE = cart.length > 0 ? 5000 : 0;
  const grandTotal = cartTotal + DELIVERY_FEE;

  async function handleCheckout() {
    Alert.alert(
      'Konfirmasi Pesanan',
      `Total pembayaran: ${formatPrice(grandTotal)}\n\nLanjutkan ke pembayaran?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Pesan Sekarang',
          onPress: async () => {
            try {
              // Simpan ke Supabase (atau simulasi jika belum dikonfigurasi)
              await createOrder({
                items:       cart.map((i) => ({ foodId: i.id, name: i.name, qty: i.qty, price: i.price })),
                address:     'Jl. Kebon Sirih No.12, Jakarta Pusat',
                note:        '',
                deliveryFee: DELIVERY_FEE,
                restaurant:  null,
              });
              clearCart();
              Alert.alert('✅ Pesanan Berhasil!', 'Pesanan Anda sedang diproses.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/orders') },
              ]);
            } catch (err) {
              Alert.alert('Gagal', err.message || 'Pesanan gagal. Silakan coba lagi.');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.root}>
      <Header title={`Keranjang (${cartCount})`} showBack />

      {cart.length === 0 ? (
        /* Empty State */
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Keranjang Kosong</Text>
          <Text style={styles.emptyText}>Belum ada item di keranjang. Yuk pilih makananmu!</Text>
          <Button
            title="Lihat Katalog"
            onPress={() => router.replace('/(tabs)/catalog')}
            style={styles.emptyBtn}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CartItem
                item={item}
                onIncrease={() => updateQty(item.id, item.qty + 1)}
                onDecrease={() => updateQty(item.id, item.qty - 1)}
                onRemove={() => removeFromCart(item.id)}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            // Tap tombol +/- tetap berfungsi meski keyboard terbuka
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListFooterComponent={
              /* Order Summary */
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal ({cartCount} item)</Text>
                  <Text style={styles.summaryValue}>{formatPrice(cartTotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Ongkos Kirim</Text>
                  <Text style={styles.summaryValue}>{formatPrice(DELIVERY_FEE)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>{formatPrice(grandTotal)}</Text>
                </View>
              </View>
            }
          />

          {/* Bottom checkout bar */}
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.totalInfo}>
              <Text style={styles.totalInfoLabel}>Total Bayar</Text>
              <Text style={styles.totalInfoAmount}>{formatPrice(grandTotal)}</Text>
            </View>
            <Button
              title="Pesan Sekarang"
              onPress={handleCheckout}
              style={styles.checkoutBtn}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // List
  list: {
    padding: 16,
    paddingBottom: 120,
  },

  // Cart item
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.secondary,
    minWidth: 18,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 4,
    marginLeft: 4,
  },

  // Summary
  summary: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textGray,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.secondary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  totalInfo: {
    flex: 1,
  },
  totalInfoLabel: {
    fontSize: 12,
    color: Colors.textGray,
  },
  totalInfoAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  checkoutBtn: {
    flex: 1,
  },

  // Empty state
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  emptyBtn: {
    paddingHorizontal: 32,
  },
});
