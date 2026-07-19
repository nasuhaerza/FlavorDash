/**
 * services/apiService.js
 * Axios instance terpusat dengan interceptor JWT
 *
 * Konfigurasi diambil dari constants/api.js agar mudah diubah.
 * Request otomatis menyertakan Authorization header jika token ada.
 * Response 401 otomatis hapus token lokal.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG, TOKEN_KEY } from '../constants/api';

// ── Instance Axios ────────────────────────────────────────
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor: tambahkan JWT token ─────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // AsyncStorage error — lanjutkan tanpa token
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
      // Token expired — bersihkan storage
      try { await AsyncStorage.removeItem(TOKEN_KEY); } catch {}
    }
    // Standarisasi pesan error
    const message =
      error.response?.data?.message ??
      error.message ??
      'Terjadi kesalahan jaringan.';
    return Promise.reject(new Error(message));
  }
);

export { API_CONFIG };
export default api;
