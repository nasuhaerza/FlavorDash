/**
 * components/cards/OrderCard.js
 * Kartu ringkasan pesanan untuk halaman Riwayat Pesanan
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { calcOrderTotal, formatDate, formatPrice } from '../../utils/formatters';

const STATUS_STYLE = {
  delivered: { color: Colors.success, icon: 'checkmark-circle', label: 'Terkirim' },
  processing: { color: Colors.warning, icon: 'time', label: 'Diproses' },
  cancelled: { color: Colors.danger, icon: 'close-circle', label: 'Dibatalkan' },
  pending: { color: Colors.info, icon: 'hourglass', label: 'Menunggu' },
};

export default function OrderCard({ order, onPress }) {
  const statusInfo = STATUS_STYLE[order.status] || STATUS_STYLE.pending;
  const total = calcOrderTotal(order.items, order.deliveryFee);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(order)}
      activeOpacity={0.9}
    >
      {/* Header: ID + Status */}
      <View style={styles.header}>
        <Text style={styles.orderId}>{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
          <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Tanggal */}
      <Text style={styles.date}>{formatDate(order.date)}</Text>

      {/* Item list (max 2, sisanya ditampilkan sebagai "+X lagi") */}
      {order.items.slice(0, 2).map((item, idx) => (
        <View key={idx} style={styles.itemRow}>
          <Text style={styles.itemQty}>{item.qty}x</Text>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemPrice}>{formatPrice(item.price * item.qty)}</Text>
        </View>
      ))}
      {order.items.length > 2 && (
        <Text style={styles.moreItems}>+{order.items.length - 2} item lainnya</Text>
      )}

      {/* Separator */}
      <View style={styles.separator} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Pembayaran</Text>
        <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
      </View>

      {/* Arrow */}
      <Ionicons
        name="chevron-forward"
        size={16}
        color={Colors.textLight}
        style={styles.arrow}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    width: 28,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: Colors.secondary,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  moreItems: {
    fontSize: 12,
    color: Colors.textGray,
    fontStyle: 'italic',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: Colors.textGray,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  arrow: {
    position: 'absolute',
    right: 14,
    top: '50%',
  },
});
