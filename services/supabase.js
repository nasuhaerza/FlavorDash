/**
 * services/supabase.js
 * Supabase client terpusat
 *
 * SETUP:
 * 1. Buat project di https://supabase.com
 * 2. Buat file .env di root project:
 *      EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *      EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
 * 3. Jalankan SQL schema di bawah di Supabase SQL Editor
 *
 * SQL SCHEMA:
 * ───────────────────────────────────────────────────────
 * -- Tabel produk makanan
 * create table if not exists foods (
 *   id          text primary key,
 *   name        text not null,
 *   description text,
 *   price       integer not null,
 *   category    text,
 *   image       text,
 *   rating      numeric(3,1) default 0,
 *   review_count integer default 0,
 *   prep_time   text,
 *   calories    integer,
 *   badge       text,
 *   tags        text[],
 *   is_favorite boolean default false,
 *   created_at  timestamptz default now()
 * );
 *
 * -- Tabel pesanan
 * create table if not exists orders (
 *   id           text primary key,
 *   user_id      uuid references auth.users(id),
 *   status       text default 'pending',
 *   address      text,
 *   note         text,
 *   delivery_fee integer default 0,
 *   date         date default current_date,
 *   restaurant   jsonb,
 *   created_at   timestamptz default now()
 * );
 *
 * -- Tabel item pesanan
 * create table if not exists order_items (
 *   id       serial primary key,
 *   order_id text references orders(id) on delete cascade,
 *   food_id  text,
 *   name     text,
 *   qty      integer,
 *   price    integer
 * );
 *
 * -- RLS (Row Level Security)
 * alter table foods  enable row level security;
 * alter table orders enable row level security;
 * alter table order_items enable row level security;
 *
 * -- Policy: semua bisa baca foods
 * create policy "public read foods"
 *   on foods for select using (true);
 *
 * -- Policy: user hanya bisa baca pesanannya sendiri
 * create policy "user read own orders"
 *   on orders for select
 *   using (auth.uid() = user_id);
 * ───────────────────────────────────────────────────────
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// ── Ambil dari environment variables (Expo) ───────────
// Ganti nilai di bawah dengan URL dan Key project Anda,
// atau gunakan .env dengan prefix EXPO_PUBLIC_
const SUPABASE_URL  = process.env.EXPO_PUBLIC_SUPABASE_URL  ?? 'https://your-project.supabase.co';
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'your-anon-key';

// ── Buat Supabase client ──────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    // Simpan sesi di AsyncStorage (persisten)
    storage:          AsyncStorage,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});

// ── Helper: cek koneksi ───────────────────────────────
export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from('foods').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export default supabase;
