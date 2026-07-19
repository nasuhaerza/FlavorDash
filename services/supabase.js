/**
 * services/supabase.js
 * Supabase client terpusat untuk FlavorDash
 *
 * Konfigurasi diambil dari environment variables (EXPO_PUBLIC_ prefix).
 * Jika variabel belum diisi, semua service otomatis fallback ke mockData.
 *
 * URL    : https://jtgkqknuxcedihvefoyc.supabase.co
 * Project: FlavorDash
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL  = process.env.EXPO_PUBLIC_SUPABASE_URL  ?? '';
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// ── Buat client hanya jika URL tersedia ───────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage:            AsyncStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});

// ── Cek koneksi (health check sederhana) ─────────────
export async function checkSupabaseConnection() {
  if (!SUPABASE_URL || !SUPABASE_ANON) return false;
  try {
    const { error } = await supabase.from('foods').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export default supabase;
