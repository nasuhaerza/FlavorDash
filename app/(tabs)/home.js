/**
 * app/(tabs)/home.js
 * Halaman Beranda FlavorDash
 *
 * Perbaikan keyboard:
 * - Search bar dengan returnKeyType "search"
 * - keyboardDismissMode="on-drag" di ScrollView → geser scroll = dismiss keyboard
 * - keyboardShouldPersistTaps="handled" → tap pada item tetap berfungsi
 * - Keyboard.dismiss saat clear search
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
    Image,
    Keyboard,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FoodCard from '../../components/cards/FoodCard';
import FoodCardFeatured from '../../components/cards/FoodCardFeatured';
import Colors from '../../constants/Colors';
import { FOOD_ITEMS } from '../../constants/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

// Banner promo data — route menentukan halaman tujuan tombol
const BANNERS = [
  {
    id: '1',
    title: 'Gratis Ongkir',
    subtitle: 'Untuk pesanan pertama Anda',
    color: '#FF6B35',
    emoji: '🛵',
    route: '/(tabs)/catalog',
    btnLabel: 'Pesan Sekarang',
  },
  {
    id: '2',
    title: 'Diskon 20%',
    subtitle: 'Menu pilihan setiap hari',
    color: '#8B5CF6',
    emoji: '🎉',
    route: '/(tabs)/catalog',
    btnLabel: 'Lihat Menu',
  },
  {
    id: '3',
    title: 'New Arrivals',
    subtitle: 'Menu baru sudah tersedia!',
    color: '#059669',
    emoji: '✨',
    route: '/(tabs)/catalog',
    btnLabel: 'Coba Sekarang',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { addToCart, cartCount } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeBanner, setActiveBanner] = useState(0);
  // Ref untuk kontrol fokus search input
  const searchRef = useRef(null);

  // Filter item berdasarkan search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return FOOD_ITEMS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const featured = FOOD_ITEMS.filter((f) => f.badge === 'popular').slice(0, 5);
  const popular = FOOD_ITEMS.slice(0, 6);

  const paddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : insets.top + 8;

  return (
    <View style={styles.root}>
      {/* ── Top Bar ──────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop }]}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingHi}>Halo, 👋</Text>
          <Text style={styles.greetingName} numberOfLines={1}>
            {user?.name?.split(' ')[0] ?? 'Foodie'}!
          </Text>
        </View>

        {/* Avatar + Cart */}
        <View style={styles.topActions}>
          {/* Cart icon */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/cart')}
          >
            <Ionicons name="cart-outline" size={24} color={Colors.secondary} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Avatar */}
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Image
              source={{ uri: user?.avatar ?? 'https://i.pravatar.cc/150?img=8' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Menggeser scroll ke bawah otomatis menutup keyboard
        keyboardDismissMode="on-drag"
      >
        {/* ── Search Bar ───────────────────────────── */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox]}>
            <Ionicons name="search-outline" size={18} color={Colors.textGray} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Cari makanan favoritmu..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              // Tekan Search di keyboard → dismiss keyboard
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit={true}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  Keyboard.dismiss();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color={Colors.textGray} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Search Results ───────────────────────── */}
        {searchQuery.trim().length > 0 && (
          <View style={styles.searchResultsSection}>
            <Text style={styles.sectionTitle}>
              {searchResults.length > 0
                ? `Hasil pencarian (${searchResults.length})`
                : 'Tidak ditemukan 😕'}
            </Text>
            {searchResults.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                onPress={(f) => router.push(`/food/${f.id}`)}
                onAddToCart={(f) => addToCart(f)}
              />
            ))}
          </View>
        )}

        {/* ── Banner Promo ─────────────────────────── */}
        {!searchQuery.trim() && (
          <>
            <View style={styles.bannerSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / (styles.banner.width ?? 300));
                  setActiveBanner(idx);
                }}
              >
                {BANNERS.map((banner) => (
                  <View
                    key={banner.id}
                    style={[styles.banner, { backgroundColor: banner.color }]}
                  >
                    <View style={styles.bannerText}>
                      <Text style={styles.bannerTitle}>{banner.title}</Text>
                      <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                      {/* ✅ Setiap banner punya route tujuan sendiri */}
                      <TouchableOpacity
                        style={styles.bannerBtn}
                        onPress={() => router.push(banner.route)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.bannerBtnText}>{banner.btnLabel}</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.bannerEmoji}>{banner.emoji}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Dot indicator */}
              <View style={styles.dots}>
                {BANNERS.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === activeBanner && styles.dotActive]}
                  />
                ))}
              </View>
            </View>

            {/* ── Rekomendasi (Featured) ────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🔥 Rekomendasi</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/catalog')}>
                  <Text style={styles.seeAll}>Lihat semua</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
              >
                {featured.map((item) => (
                  <FoodCardFeatured
                    key={item.id}
                    item={item}
                    onPress={(f) => router.push(`/food/${f.id}`)}
                    onAddToCart={(f) => addToCart(f)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* ── Makanan Populer (List) ─────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⭐ Populer Hari Ini</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/catalog')}>
                  <Text style={styles.seeAll}>Lihat semua</Text>
                </TouchableOpacity>
              </View>
              {popular.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onPress={(f) => router.push(`/food/${f.id}`)}
                  onAddToCart={(f) => addToCart(f)}
                />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: {
    flex: 1,
  },
  greetingHi: {
    fontSize: 13,
    color: Colors.textGray,
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  scroll: {
    flex: 1,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.secondary,
  },

  // Search results
  searchResultsSection: {
    paddingBottom: 12,
  },

  // Banners
  bannerSection: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  banner: {
    width: 340,
    height: 140,
    borderRadius: 20,
    marginRight: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
  },
  bannerBtn: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  bannerEmoji: {
    fontSize: 52,
    marginLeft: 8,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 18,
  },

  // Sections
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.secondary,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  featuredList: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
});
