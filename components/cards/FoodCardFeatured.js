/**
 * components/cards/FoodCardFeatured.js
 * Kartu makanan vertikal untuk tampilan "Rekomendasi" di Home
 * Scroll horizontal, ukuran lebih besar
 *
 * Perbaikan button:
 * - ➕ Tombol tambah ke cart: stopPropagation agar tidak trigger onPress kartu
 * - activeOpacity dan hitSlop untuk kemudahan tap
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Colors from '../../constants/Colors';
import { formatPrice } from '../../utils/formatters';
import Badge from '../ui/Badge';

const { width } = Dimensions.get('window');
// Lebar kartu: 65% lebar layar, tapi minimal 200 dan maksimal 260
const CARD_WIDTH = Math.min(Math.max(width * 0.65, 200), 260);

export default function FoodCardFeatured({ item, onPress, onAddToCart }) {
  const [imgError, setImgError] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.card, { width: CARD_WIDTH }]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.9}
    >
      {/* Gambar */}
      <View style={styles.imageWrap}>
        <Image
          source={imgError ? require('../../assets/images/icon.png') : { uri: item.image }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
        {item.badge && (
          <View style={styles.badgeWrap}>
            <Badge type={item.badge} />
          </View>
        )}
        {/* Overlay gradient efek */}
        <View style={styles.overlay} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={Colors.star} />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.prepTime}>{item.prepTime}</Text>
        </View>
        <View style={styles.bottom}>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              onAddToCart?.(item);
            }}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="add" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  badgeWrap: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
    marginLeft: 3,
  },
  dot: {
    fontSize: 12,
    color: Colors.textGray,
    marginHorizontal: 4,
  },
  prepTime: {
    fontSize: 12,
    color: Colors.textGray,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
