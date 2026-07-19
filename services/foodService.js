/**
 * services/foodService.js
 * Service layer untuk katalog makanan menggunakan Axios
 *
 * Menggunakan strategi fallback:
 * 1. Coba fetch dari API eksternal
 * 2. Jika gagal (offline/timeout), gunakan data lokal (mockData)
 */

import { FOOD_ITEMS } from '../constants/mockData';
import api from './apiService';

const CACHE_KEY = '@flavordash_food_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

// ── Ambil katalog makanan ─────────────────────────────────
// Karena tidak ada real food API, kita simulasi delay + transform
export async function fetchFoodCatalog(signal) {
  try {
    // Simulasi network request dengan timeout (500ms)
    await new Promise((resolve, reject) => {
      const t = setTimeout(resolve, 500);
      signal?.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new Error('Request cancelled'));
      });
    });

    // Return data lokal sebagai mock API response
    // Pada produksi: ganti dengan api.get('/foods') atau endpoint nyata
    return {
      data: FOOD_ITEMS,
      total: FOOD_ITEMS.length,
      source: 'mock',
    };
  } catch (err) {
    if (err.message === 'Request cancelled') throw err;
    // Fallback ke data lokal jika API gagal
    return { data: FOOD_ITEMS, total: FOOD_ITEMS.length, source: 'local' };
  }
}

// ── Cari makanan berdasarkan query ───────────────────────
export async function searchFood(query) {
  await new Promise((r) => setTimeout(r, 300)); // simulasi debounce delay
  const q = query.toLowerCase().trim();
  return FOOD_ITEMS.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.tags.some((t) => t.toLowerCase().includes(q))
  );
}

// ── Ambil detail satu item ───────────────────────────────
export async function fetchFoodById(id) {
  await new Promise((r) => setTimeout(r, 200));
  const item = FOOD_ITEMS.find((f) => f.id === String(id));
  if (!item) throw new Error('Menu tidak ditemukan');
  return item;
}

// ── Test koneksi API (health check) ─────────────────────
export async function checkApiHealth() {
  try {
    await api.get('/posts/1', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
