/**
 * app/(tabs)/catalog.js
 * Halaman Katalog Makanan — daftar lengkap dengan filter kategori
 *
 * Perbaikan keyboard:
 * - FlatList: keyboardShouldPersistTaps="handled" agar tap pada kartu
 *   tetap berfungsi meski keyboard sedang terbuka
 * - FlatList: keyboardDismissMode="on-drag" agar scroll menutup keyboard
 * - Sort chips: pakai TouchableOpacity (bukan Text onPress) — lebih
 *   reliable untuk tap area dan tidak ada konflik dengan keyboard
 */

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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

import FoodCard from '../../components/cards/FoodCard';
import CategoryFilter from '../../components/layout/CategoryFilter';
import Colors from '../../constants/Colors';
import { FOOD_ITEMS } from '../../constants/mockData';
import { useCart } from '../../contexts/CartContext';

const SORT_OPTIONS = [
  { key: 'rating',     label: '⭐ Rating' },
  { key: 'price_asc',  label: '💰 Termurah' },
  { key: 'price_desc', label: '💎 Termahal' },
];

export default function CatalogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const displayItems = useMemo(() => {
    let items =
      selectedCategory === 'all'
        ? FOOD_ITEMS
        : FOOD_ITEMS.filter((f) => f.category === selectedCategory);

    return [...items].sort((a, b) => {
      if (sortBy === 'rating')     return b.rating - a.rating;
      if (sortBy === 'price_asc')  return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });
  }, [selectedCategory, sortBy]);

  const paddingTop =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + 8
      : insets.top + 8;

  // Header: kategori chips + sort chips
  const ListHeader = (
    <View>
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Urutkan:</Text>
        {SORT_OPTIONS.map((opt) => {
          const active = sortBy === opt.key;
          return (
            // TouchableOpacity — respons tap lebih baik daripada Text onPress
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortChip, active && styles.sortChipActive]}
              onPress={() => setSortBy(opt.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.sortChipText, active && styles.sortChipTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* ── Header ───────────────────────────────── */}
      <View style={[styles.header, { paddingTop }]}>
        <Text style={styles.title}>Katalog Makanan 🍽️</Text>
        <Text style={styles.subtitle}>{displayItems.length} menu tersedia</Text>
      </View>

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
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>Tidak ada menu di kategori ini</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        // Tap pada item kartu tetap berfungsi saat keyboard terbuka
        keyboardShouldPersistTaps="handled"
        // Scroll ke bawah otomatis menutup keyboard
        keyboardDismissMode="on-drag"
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
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  sortLabel: {
    fontSize: 12,
    color: Colors.textGray,
    fontWeight: '500',
    marginRight: 4,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  sortChipText: {
    fontSize: 12,
    color: Colors.textGray,
    fontWeight: '500',
  },
  sortChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  list: {
    paddingBottom: 24,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textGray,
  },
});
