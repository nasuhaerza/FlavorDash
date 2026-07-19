/**
 * app/(tabs)/catalog.js
 * Katalog Makanan — diambil via Axios (foodService) dengan FlatList
 *
 * Fitur:
 * - Fetch data via Axios + custom hook useFoodCatalog
 * - Pull-to-refresh
 * - Search dengan useDebounce (400ms delay, tidak re-filter tiap ketikan)
 * - Filter kategori + sort
 * - Skeleton loading saat data pertama kali dimuat
 * - EmptyState untuk hasil kosong / error
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FoodCard from '../../components/cards/FoodCard';
import CategoryFilter from '../../components/layout/CategoryFilter';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import Colors from '../../constants/Colors';
import { useCart } from '../../contexts/CartContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useFoodCatalog } from '../../hooks/useFoodCatalog';

const SORT_OPTIONS = [
  { key: 'rating',     label: '⭐ Rating'   },
  { key: 'price_asc',  label: '💰 Termurah' },
  { key: 'price_desc', label: '💎 Termahal' },
];

export default function CatalogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();

  // ── Data via Axios ──────────────────────────────────
  const { data, loading, refreshing, error, source, refresh } = useFoodCatalog();

  const [search,           setSearch]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy,           setSortBy]           = useState('rating');

  // Debounce search — filter tidak berjalan tiap keystroke
  const debouncedSearch = useDebounce(search, 400);

  // ── Filter + Sort dengan debouncedSearch ────────────
  const displayItems = useMemo(() => {
    let items = data;

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      items = items.filter((f) => f.category === selectedCategory);
    }

    return [...items].sort((a, b) => {
      if (sortBy === 'rating')     return b.rating - a.rating;
      if (sortBy === 'price_asc')  return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });
  }, [data, debouncedSearch, selectedCategory, sortBy]);

  const paddingTop =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + 8
      : insets.top + 8;

  // ── List Header ─────────────────────────────────────
  const ListHeader = (
    <View>
      {/* Search bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={Colors.textGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari makanan..."
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
          blurOnSubmit
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => { setSearch(''); Keyboard.dismiss(); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={Colors.textGray} />
          </TouchableOpacity>
        )}
      </View>

      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* Sort pills */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Urutkan:</Text>
        {SORT_OPTIONS.map((opt) => {
          const active = sortBy === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortChip, active && styles.sortChipActive]}
              onPress={() => setSortBy(opt.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Offline / API info */}
      {source === 'local' && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color={Colors.warning} />
          <Text style={styles.offlineText}>Mode offline — data dari cache lokal</Text>
        </View>
      )}

      {/* Jumlah hasil saat search aktif */}
      {debouncedSearch.trim().length > 0 && (
        <View style={styles.searchResultInfo}>
          <Text style={styles.searchResultText}>
            {displayItems.length > 0
              ? `${displayItems.length} hasil untuk "${debouncedSearch}"`
              : `Tidak ada hasil untuk "${debouncedSearch}"`}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      {/* ── Header ──────────────────────────── */}
      <View style={[styles.header, { paddingTop }]}>
        <View>
          <Text style={styles.title}>Katalog Makanan 🍽️</Text>
          <Text style={styles.subtitle}>{displayItems.length} menu tersedia</Text>
        </View>
        {loading && !refreshing && (
          <ActivityIndicator size="small" color={Colors.primary} />
        )}
      </View>

      {/* ── Error state ─────────────────────── */}
      {error && !loading && (
        <EmptyState
          icon="cloud-offline-outline"
          title="Gagal Memuat"
          message={error}
          actionLabel="Coba Lagi"
          onAction={refresh}
        />
      )}

      {/* ── Skeleton loading (pertama kali) ─── */}
      {loading && !refreshing && data.length === 0 && (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      )}

      {/* ── FlatList ────────────────────────── */}
      {(!loading || data.length > 0) && !error && (
        <FlatList
          data={displayItems}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          renderItem={({ item }) => (
            <FoodCard
              item={item}
              onPress={(f) => router.push(`/food/${f.id}`)}
              onAddToCart={(f) => addToCart(f)}
            />
          )}
          ListEmptyComponent={
            !loading && (
              <EmptyState
                emoji="🍽️"
                title="Tidak Ada Menu"
                message={
                  debouncedSearch
                    ? `Tidak ada menu untuk "${debouncedSearch}"`
                    : 'Tidak ada menu di kategori ini'
                }
                actionLabel={debouncedSearch ? 'Hapus Pencarian' : undefined}
                onAction={debouncedSearch ? () => setSearch('') : undefined}
              />
            )
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshing={refreshing}
          onRefresh={refresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title:    { fontSize: 22, fontWeight: '800', color: Colors.secondary },
  subtitle: { fontSize: 13, color: Colors.textGray, marginTop: 2 },

  // Search
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1.5, borderColor: Colors.border,
    marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.secondary },

  // Result info
  searchResultInfo: { paddingHorizontal: 16, paddingBottom: 4 },
  searchResultText: { fontSize: 12, color: Colors.textGray, fontStyle: 'italic' },

  // Sort
  sortRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 8, gap: 6, flexWrap: 'wrap',
  },
  sortLabel:          { fontSize: 12, color: Colors.textGray, fontWeight: '500', marginRight: 4 },
  sortChip:           { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  sortChipActive:     { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  sortChipText:       { fontSize: 12, color: Colors.textGray, fontWeight: '500' },
  sortChipTextActive: { color: Colors.primary, fontWeight: '700' },

  // Offline
  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.warning + '15',
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 10, padding: 10,
  },
  offlineText: { fontSize: 12, color: Colors.warning, fontWeight: '500' },

  // Skeleton
  skeletonContainer: { paddingTop: 8 },

  list: { paddingBottom: 24 },
});
