/**
 * services/apiService.js
 * Axios instance terpusat dengan interceptor JWT
 *
 * Semua request otomatis menyertakan Authorization header jika token ada.
 * Response error 401 otomatis trigger logout (token expired).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL Mock API — ganti dengan URL backend nyata saat produksi
// Menggunakan JSONPlaceholder + data lokal sebagai fallback
export const BASE_URL = 'https://jsonplaceholder.typicode.com';
const TOKEN_KEY = '@flavordash_token';

// ── Buat instance Axios ───────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor: tambahkan JWT token ─────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle error global ────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — hapus token lokal
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export default api;
