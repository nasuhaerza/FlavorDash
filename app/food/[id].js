/**
 * app/food/[id].js
 * Halaman Detail Makanan — Dynamic Route berdasarkan ID
 *
 * Data diambil dari Supabase via fetchFoodById (fallback ke mockData).
 * Toast notification via useNotification menggantikan Alert.
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Colors from '../../constants/Colors';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../hooks/useNotification';
import { fetchFoodById } from '../../services/supabaseFoodService';
import { formatPrice } from '../../utils/formatters';

const { width } = Dimensions.get('window');

export default function FoodDetailScreen() {
  const { id }  = useLocalSearchParams();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { addToCart, cart } = useCart();
  const { notify, NotificationView } = useNotification();

  const [item,     setItem]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [imgError, setImgError] = useState(false);
  const [qty,      setQty]      = useState(1);
  const [isFav,    setIsFav]    = useState(false);

  // ── Fetch dari Supabase ────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFoodById(id)
      .then((data) => {
        if (!cancelled) {
          setItem(data);
          setIsFav(data?.isFavorite ?? false);
        }
      })
      .catch(() => {
        if (!cancelled) setItem(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  // Cek cart
  const cartItem = cart.find((c) => c.id === String(id));

  // ── Loading ────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // ── Not found ──────────────────────────────────────
  if (!item) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundIcon}>😕</Text>
        <Text style={styles.notFoundText}>Menu tidak ditemukan</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLinkWrap}>
          <Ionicons name="chevron-back" size={16} color={Colors.primary} />
          <Text style={styles.backLink}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Tambah ke cart ─────────────────────────────────
  function handleAddToCart() {
    for (let i = 0; i < qty; i++) addToCart(item);
    notify(`${qty}x ${item.name} ditambahkan ke keranjang 🛒`, 'success');
  }

  function handleToggleFav() {
    setIsFav((v) => !v);
  }

  return (
    <View style={styles.root}>
      <NotificationView />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Gambar Hero ─────────────────────── */}
        <View style={styles.imageContainer}>
          <Image
            source={imgError ? require('../../assets/images/icon.png') : { uri: item.image }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cartBtn, { top: insets.top + 8 }]}
            onPress={() => router.push('/cart')}
            activeOpacity={0.85}
          >
            <Ionicons name="cart-outline" size={20} color={Colors.secondary} />
            {cartItem && <View style={styles.cartDot} />}
          </TouchableOpacity>
          {item.badge && (
            <View style={styles.heroBadge}><Badge type={item.badge} /></View>
          )}
        </View>

        {/* ── Info ─────────────────────────── */}
        <View style={styles.infoCard}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <TouchableOpacity
              onPress={handleToggleFav}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={26}
                color={isFav ? Colors.danger : Colors.textGray}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={Colors.star} />
              <Text style={styles.metaValue}>{item.rating}</Text>
              <Text style={styles.metaLabel}>({item.reviewCount} ulasan)</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.textGray} />
              <Text style={styles.metaValue}>{item.prepTime}</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>🔥 {item.calories} kal</Text>
            </View>
          </View>

          <Text style={styles.price}>{formatPrice(item.price)}</Text>

          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.tagsRow}>
            {(item.tags ?? []).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Info Nutrisi</Text>
          <View style={styles.nutritionRow}>
            {[
              { label: 'Kalori',  value: `${item.calories}`, unit: 'kal' },
              { label: 'Protein', value: '18',               unit: 'g'   },
              { label: 'Karbo',   value: '45',               unit: 'g'   },
              { label: 'Lemak',   value: '12',               unit: 'g'   },
            ].map((n) => (
              <View key={n.label} style={styles.nutriItem}>
                <Text style={styles.nutriValue}>{n.value}</Text>
                <Text style={styles.nutriUnit}>{n.unit}</Text>
                <Text style={styles.nutriLabel}>{n.label}</Text>
              </View>
            ))}
          </View>

          {cartItem && (
            <TouchableOpacity
              style={styles.cartInfo}
              onPress={() => router.push('/cart')}
              activeOpacity={0.8}
            >
              <Ionicons name="cart" size={14} color={Colors.primary} />
              <Text style={styles.cartInfoText}>
                {cartItem.qty}x sudah di keranjang — Lihat →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom Bar ─────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.qtySelector}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
            <Ionicons name="remove" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{qty}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => q + 1)}>
            <Ionicons name="add" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <Button
          title={`Tambah — ${formatPrice(item.price * qty)}`}
          onPress={handleAddToCart}
          style={styles.addBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  imageContainer: { width, aspectRatio: 1.3, backgroundColor: Colors.border },
  image:          { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute', left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  cartBtn: {
    position: 'absolute', right: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  cartDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  heroBadge: { position: 'absolute', bottom: 16, left: 16 },

  infoCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -20, padding: 24, paddingBottom: 120,
  },
  nameRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 10,
  },
  name: {
    flex: 1, fontSize: 22, fontWeight: '900',
    color: Colors.secondary, lineHeight: 28, marginRight: 12,
  },
  metaRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 14, flexWrap: 'wrap', gap: 4,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaValue: { fontSize: 13, fontWeight: '600', color: Colors.secondary },
  metaLabel: { fontSize: 12, color: Colors.textGray },
  metaDot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textLight, marginHorizontal: 4 },
  price:       { fontSize: 26, fontWeight: '900', color: Colors.primary, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.secondary, marginBottom: 8 },
  description: { fontSize: 14, color: Colors.textGray, lineHeight: 22, marginBottom: 16 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag:     { backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  tagText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  nutritionRow: {
    flexDirection: 'row', backgroundColor: Colors.background,
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  nutriItem:  { flex: 1, alignItems: 'center' },
  nutriValue: { fontSize: 18, fontWeight: '800', color: Colors.secondary },
  nutriUnit:  { fontSize: 10, color: Colors.textGray },
  nutriLabel: { fontSize: 11, color: Colors.textGray, marginTop: 2, fontWeight: '500' },

  cartInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryLight, borderRadius: 10, padding: 10,
  },
  cartInfoText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20, paddingTop: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 10,
  },
  qtySelector: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background, borderRadius: 12, padding: 6, gap: 12,
  },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyValue: { fontSize: 16, fontWeight: '800', color: Colors.secondary, minWidth: 20, textAlign: 'center' },
  addBtn:   { flex: 1 },

  notFound:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  notFoundIcon: { fontSize: 52, marginBottom: 12 },
  notFoundText: { fontSize: 17, color: Colors.secondary, fontWeight: '600', marginBottom: 16 },
  backLinkWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backLink:     { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
