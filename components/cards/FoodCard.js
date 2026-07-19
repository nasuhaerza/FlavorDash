/**
 * components/cards/FoodCard.js
 *
 * Kartu makanan katalog — layout Flexbox horizontal:
 * [Gambar | Info (nama, deskripsi, harga, rating)]
 *
 * Perbaikan button:
 * - ❤️ Tombol favorit sekarang interaktif (toggle state lokal)
 * - ➕ Tombol tambah ke cart memanggil onAddToCart dengan feedback
 * - Seluruh kartu bisa di-tap untuk ke detail
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Colors from '../../constants/Colors';
import { formatPrice } from '../../utils/formatters';
import Badge from '../ui/Badge';

export default function FoodCard({ item, onPress, onAddToCart }) {
  const [imgError, setImgError] = useState(false);
  // ✅ State favorit lokal — toggle saat tap ❤️
  const [isFav, setIsFav] = useState(item?.isFavorite ?? false);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(item)}
      activeOpacity={0.92}
    >
      {/* ── Kiri: Gambar ─────────────────────── */}
      <View style={styles.imageContainer}>
        <Image
          source={
            imgError
              ? require('../../assets/images/icon.png')
              : { uri: item.image }
          }
          style={styles.image}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
        {item.badge && (
          <View style={styles.badgeWrap}>
            <Badge type={item.badge} />
          </View>
        )}
      </View>

      {/* ── Kanan: Informasi ─────────────────── */}
      <View style={styles.info}>
        {/* Nama & ✅ Tombol Favorit interaktif */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity
            onPress={(e) => {
              // Hentikan propagasi agar tidak trigger onPress kartu
              e.stopPropagation?.();
              setIsFav((v) => !v);
            }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={18}
              color={isFav ? Colors.danger : Colors.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Deskripsi */}
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Rating & waktu masak */}
        <View style={styles.metaRow}>
          <Ionicons name="star" size={12} color={Colors.star} />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          <View style={styles.dot} />
          <Ionicons name="time-outline" size={12} color={Colors.textGray} />
          <Text style={styles.prepTime}>{item.prepTime}</Text>
        </View>

        {/* Kalori */}
        <Text style={styles.calories}>🔥 {item.calories} kal</Text>

        {/* Harga & ✅ Tombol Tambah ke Cart */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onAddToCart?.(item);
            }}
            activeOpacity={0.8}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name="add" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Gambar — 32% lebar kartu, tinggi proporsional via aspectRatio
  imageContainer: { width: '32%' },
  image: { width: '100%', aspectRatio: 0.85 },
  badgeWrap: { position: 'absolute', top: 8, left: 6 },

  // Info — mengisi sisa ruang
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.secondary,
    marginRight: 6,
  },
  description: {
    fontSize: 12,
    color: Colors.textGray,
    lineHeight: 17,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12, fontWeight: '700',
    color: Colors.secondary, marginLeft: 3,
  },
  reviewCount: { fontSize: 11, color: Colors.textGray, marginLeft: 2 },
  dot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: Colors.textLight, marginHorizontal: 6,
  },
  prepTime: { fontSize: 11, color: Colors.textGray, marginLeft: 3 },
  calories: { fontSize: 11, color: Colors.textGray, marginBottom: 8 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  addButton: {
    backgroundColor: Colors.primary,
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
});
