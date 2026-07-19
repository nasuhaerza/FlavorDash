/**
 * app/(tabs)/home.js
 * Halaman Beranda FlavorDash
 *
 * Update:
 * - Data diambil via useFoodCatalog (Axios + fallback lokal)
 * - Pull-to-refresh pada banner + section
 * - Search dengan dismiss keyboard
 * - Loading indicator saat fetching
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  RefreshControl,
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
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFoodCatalog } from '../../hooks/useFoodCatalog';

const { width } = Dimensions.get('window');

const BANNERS = [
  { id: '1', title: 'Gratis Ongkir',  subtitle: 'Untuk pesanan pertama Anda', color: '#FF6B35', emoji: '🛵', route: '/(tabs)/catalog', btnLabel: 'Pesan Sekarang' },
  { id: '2', title: 'Diskon 20%',     subtitle: 'Menu pilihan setiap hari',   color: '#8B5CF6', emoji: '🎉', route: '/(tabs)/catalog', btnLabel: 'Lihat Menu'     },
  { id: '3', title: 'New Arrivals',   subtitle: 'Menu baru sudah tersedia!',  color: '#059669', emoji: '✨', route: '/(tabs)/catalog', btnLabel: 'Coba Sekarang' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { addToCart, cartCount } = useCart();

  // ── Data via Axios ───────────────────────────────────
  const { data, loading, refreshing, error, source, refresh } = useFoodCatalog();

  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeBanner, setActiveBanner] = useState(0);
  const searchRef = useRef(null);

  const featured = useMemo(() => data.filter((f) => f.badge === 'popular').slice(0, 5), [data]);
  const popular  = useMemo(() => data.slice(0, 6), [data]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return data.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [searchQuery, data]);

  const paddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : insets.top + 8;
  // Lebar banner responsif
  const bannerWidth = width - 32;

  return (
    <View style={styles.root}>
      {/* ── Top Bar ──────────────────────────── */}
      <View style={[styles.topBar, { paddingTop }]}>
        <View style={styles.greeting}>
          <Text style={styles.greetingHi}>Halo, 👋</Text>
          <Text style={styles.greetingName} numberOfLines={1}>
            {user?.name?.split(' ')[0] ?? 'Foodie'}!
          </Text>
        </View>
        <View style={styles.topActions}>
          {loading && !refreshing && (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 8 }} />
          )}
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={24} color={Colors.secondary} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Image
              source={{ uri: user?.avatar ?? 'https://i.pravatar.cc/150?img=8' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Offline banner ───────────────────── */}
      {source === 'local' && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={13} color={Colors.warning} />
          <Text style={styles.offlineText}>Mode offline — menampilkan data lokal</Text>
        </View>
      )}
      {error && (
        <View style={[styles.offlineBanner, { backgroundColor: Colors.danger + '15' }]}>
          <Ionicons name="alert-circle-outline" size={13} color={Colors.danger} />
          <Text style={[styles.offlineText, { color: Colors.danger }]}>{error}</Text>
          <TouchableOpacity onPress={refresh}><Text style={styles.retryText}>Coba lagi</Text></TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
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
      >
        {/* ── Search Bar ───────────────────── */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={Colors.textGray} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Cari makanan favoritmu..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => { setSearchQuery(''); Keyboard.dismiss(); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color={Colors.textGray} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Search Results ───────────────── */}
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

        {/* ── Konten utama (sembunyikan saat search) ── */}
        {!searchQuery.trim() && (
          <>
            {/* Banner Promo */}
            <View style={styles.bannerSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                decelerationRate="fast"
                snapToInterval={bannerWidth + 12}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / (bannerWidth + 12));
                  setActiveBanner(Math.min(idx, BANNERS.length - 1));
                }}
              >
                {BANNERS.map((banner) => (
                  <View
                    key={banner.id}
                    style={[styles.banner, { backgroundColor: banner.color, width: bannerWidth }]}
                  >
                    <View style={styles.bannerText}>
                      <Text style={styles.bannerTitle}>{banner.title}</Text>
                      <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
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
              <View style={styles.dots}>
                {BANNERS.map((_, i) => (
                  <View key={i} style={[styles.dot, i === activeBanner && styles.dotActive]} />
                ))}
              </View>
            </View>

            {/* Loading skeleton */}
            {loading && data.length === 0 && (
              <View style={styles.loadingSection}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Memuat katalog...</Text>
              </View>
            )}

            {/* Rekomendasi */}
            {featured.length > 0 && (
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
            )}

            {/* Populer */}
            {popular.length > 0 && (
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
            )}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  greeting:     { flex: 1 },
  greetingHi:   { fontSize: 13, color: Colors.textGray },
  greetingName: { fontSize: 20, fontWeight: '800', color: Colors.secondary },
  topActions:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn:      { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: Colors.danger, borderRadius: 8,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 2, borderColor: Colors.primary,
  },

  // Offline / error banner
  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  offlineText: { flex: 1, fontSize: 12, color: Colors.warning, fontWeight: '500' },
  retryText:   { fontSize: 12, color: Colors.primary, fontWeight: '700' },

  scroll: { flex: 1 },

  searchContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1.5, borderColor: Colors.border, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.secondary },

  searchResultsSection: { paddingBottom: 12 },

  bannerSection:  { marginHorizontal: 16, marginBottom: 8 },
  banner: {
    height: 140, borderRadius: 20, marginRight: 12,
    padding: 20, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  bannerText:     { flex: 1 },
  bannerTitle:    { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 4 },
  bannerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  bannerBtn: {
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start',
  },
  bannerBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  bannerEmoji:   { fontSize: 52, marginLeft: 8 },
  dots:          { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
  dot:           { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive:     { backgroundColor: Colors.primary, width: 18 },

  loadingSection: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText:    { fontSize: 14, color: Colors.textGray },

  section:       { marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 12, marginTop: 16,
  },
  sectionTitle: {
    fontSize: 17, fontWeight: '800', color: Colors.secondary,
    paddingHorizontal: 16, marginTop: 16, marginBottom: 4,
  },
  seeAll:       { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  featuredList: { paddingHorizontal: 16, paddingBottom: 4 },
});
