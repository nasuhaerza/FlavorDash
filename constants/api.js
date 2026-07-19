/**
 * constants/api.js
 * Konfigurasi endpoint dan konstanta API
 *
 * Ubah BASE_URL ke endpoint produksi saat deploy.
 */

export const API_CONFIG = {
  BASE_URL:    'https://jsonplaceholder.typicode.com',
  TIMEOUT:     10000,  // 10 detik
  RETRY_COUNT: 2,
};

export const ENDPOINTS = {
  LOGIN:   '/auth/login',
  LOGOUT:  '/auth/logout',
  PROFILE: '/auth/me',
  FOODS:   '/foods',
  ORDERS:  '/orders',
};

export const TOKEN_KEY     = '@flavordash_token';
export const CACHE_TTL_MS  = 5 * 60 * 1000; // 5 menit
