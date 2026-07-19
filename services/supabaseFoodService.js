/**
 * services/supabaseFoodService.js
 * Service layer untuk Foods & Orders menggunakan Supabase
 *
 * Strategi:
 * - Fetch data dari Supabase (database nyata)
 * - Jika Supabase belum dikonfigurasi / offline → fallback ke mockData
 * - Transform kolom snake_case dari DB ke camelCase untuk frontend
 */

import { FOOD_ITEMS, MOCK_ORDERS } from '../constants/mockData';
import supabase from './supabase';

// ── Helper: transform DB row ke format frontend ───────
function transformFood(row) {
  return {
    id:          row.id,
    name:        row.name,
    description: row.description,
    price:       row.price,
    category:    row.category,
    image:       row.image,
    rating:      parseFloat(row.rating),
    reviewCount: row.review_count,
    prepTime:    row.prep_time,
    calories:    row.calories,
    badge:       row.badge,
    tags:        row.tags ?? [],
    isFavorite:  row.is_favorite,
  };
}

function transformOrder(row) {
  return {
    id:          row.id,
    date:        row.date,
    status:      row.status,
    statusLabel: STATUS_LABELS[row.status] ?? row.status,
    address:     row.address,
    note:        row.note ?? '',
    deliveryFee: row.delivery_fee,
    restaurant:  row.restaurant,
    items:       (row.order_items ?? []).map((i) => ({
      foodId: i.food_id,
      name:   i.name,
      qty:    i.qty,
      price:  i.price,
    })),
  };
}

const STATUS_LABELS = {
  pending:    'Menunggu',
  processing: 'Diproses',
  delivered:  'Terkirim',
  cancelled:  'Dibatalkan',
};

// ── Cek apakah Supabase sudah dikonfigurasi ───────────
function isConfigured() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  return url.includes('.supabase.co') && !url.includes('your-project');
}

// ════════════════════════════════════════════════════════
// FOODS
// ════════════════════════════════════════════════════════

/**
 * Ambil semua makanan dari Supabase
 * Fallback ke mockData jika tidak terkonfigurasi
 */
export async function fetchFoods({ category, search, sortBy = 'rating' } = {}) {
  if (!isConfigured()) {
    console.log('[Supabase] Not configured — using mockData fallback');
    return { data: FOOD_ITEMS, source: 'local' };
  }

  try {
    let query = supabase
      .from('foods')
      .select('*');

    // Filter kategori
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Search
    if (search?.trim()) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Sort
    if (sortBy === 'rating')     query = query.order('rating',      { ascending: false });
    if (sortBy === 'price_asc')  query = query.order('price',       { ascending: true  });
    if (sortBy === 'price_desc') query = query.order('price',       { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return {
      data:   data.map(transformFood),
      source: 'supabase',
    };
  } catch (err) {
    console.warn('[Supabase] fetchFoods error:', err.message, '— fallback to local');
    return { data: FOOD_ITEMS, source: 'local' };
  }
}

/**
 * Ambil satu makanan by ID
 */
export async function fetchFoodById(id) {
  if (!isConfigured()) {
    const item = FOOD_ITEMS.find((f) => f.id === String(id));
    if (!item) throw new Error('Menu tidak ditemukan');
    return item;
  }

  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('id', String(id))
    .single();

  if (error) {
    // Fallback ke lokal
    const item = FOOD_ITEMS.find((f) => f.id === String(id));
    if (item) return item;
    throw new Error('Menu tidak ditemukan');
  }

  return transformFood(data);
}

// ════════════════════════════════════════════════════════
// ORDERS
// ════════════════════════════════════════════════════════

/**
 * Ambil semua pesanan milik user yang sedang login
 */
export async function fetchOrders() {
  if (!isConfigured()) {
    return { data: MOCK_ORDERS, source: 'local' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: MOCK_ORDERS, source: 'local' };

  try {
    const { data, error } = await supabase
      .from('orders_with_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data:   data.map((row) => transformOrder({ ...row, order_items: row.items ?? [] })),
      source: 'supabase',
    };
  } catch (err) {
    console.warn('[Supabase] fetchOrders error:', err.message);
    return { data: MOCK_ORDERS, source: 'local' };
  }
}

/**
 * Ambil satu pesanan by ID
 */
export async function fetchOrderById(id) {
  if (!isConfigured()) {
    const order = MOCK_ORDERS.find((o) => o.id === String(id));
    if (!order) throw new Error('Pesanan tidak ditemukan');
    return order;
  }

  const { data, error } = await supabase
    .from('orders_with_items')
    .select('*')
    .eq('id', String(id))
    .single();

  if (error) {
    const order = MOCK_ORDERS.find((o) => o.id === String(id));
    if (order) return order;
    throw new Error('Pesanan tidak ditemukan');
  }

  return transformOrder({ ...data, order_items: data.items ?? [] });
}

/**
 * Buat pesanan baru
 */
export async function createOrder({ items, address, note, deliveryFee, restaurant }) {
  if (!isConfigured()) {
    // Simulasi create — kembalikan order dummy
    const newOrder = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      statusLabel: 'Diproses',
      items, address, note: note ?? '',
      deliveryFee: deliveryFee ?? 5000,
      restaurant,
    };
    return newOrder;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Anda harus login untuk membuat pesanan');

  const orderId = `ORD-${Date.now()}`;

  // Insert order header
  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      id:           orderId,
      user_id:      user.id,
      status:       'processing',
      address,
      note:         note ?? '',
      delivery_fee: deliveryFee ?? 5000,
      restaurant,
    });

  if (orderError) throw orderError;

  // Insert order items
  const orderItems = items.map((item) => ({
    order_id: orderId,
    food_id:  item.foodId ?? item.id,
    name:     item.name,
    qty:      item.qty,
    price:    item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return fetchOrderById(orderId);
}
