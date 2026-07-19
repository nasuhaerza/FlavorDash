/**
 * services/supabaseAuthService.js
 * Autentikasi via Supabase Auth
 *
 * Strategi:
 * - Jika Supabase dikonfigurasi → pakai Supabase Auth (email/password)
 * - Jika tidak dikonfigurasi → fallback ke mock JWT (authService lama)
 */

import { MOCK_USERS } from '../constants/mockData';
import { generateToken } from '../utils/jwtHelper';
import supabase from './supabase';

function isConfigured() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  return url.includes('.supabase.co') && !url.includes('your-project');
}

// ── Login ────────────────────────────────────────────
export async function signIn(email, password) {
  if (!isConfigured()) {
    // Fallback: mock login
    const user = MOCK_USERS.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Email atau password salah.');
    const { password: _pw, ...safeUser } = user;
    const token = generateToken({ sub: user.id, name: user.name, email: user.email, avatar: user.avatar }, 7200);
    return { token, user: safeUser };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(error.message);

  const sbUser = data.user;
  const meta   = sbUser.user_metadata ?? {};
  const token  = data.session.access_token;

  return {
    token,
    user: {
      id:          sbUser.id,
      email:       sbUser.email,
      name:        meta.name        ?? sbUser.email.split('@')[0],
      avatar:      meta.avatar_url  ?? `https://i.pravatar.cc/150?u=${sbUser.id}`,
      phone:       meta.phone       ?? '',
      address:     meta.address     ?? '',
      memberSince: sbUser.created_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    },
  };
}

// ── Register ─────────────────────────────────────────
export async function signUp(email, password, name) {
  if (!isConfigured()) {
    // Fallback: simulasi register → langsung login dengan akun demo
    const demoUser = MOCK_USERS[0];
    const { password: _pw, ...safeUser } = demoUser;
    const token = generateToken({ sub: demoUser.id, name: demoUser.name, email: demoUser.email, avatar: demoUser.avatar }, 7200);
    return { token, user: { ...safeUser, name, email } };
  }

  const { data, error } = await supabase.auth.signUp({
    email:    email.trim(),
    password,
    options:  { data: { name } },
  });

  if (error) throw new Error(error.message);

  // Supabase mengirim email konfirmasi — kembalikan session jika langsung aktif
  if (data.session) {
    return signIn(email, password);
  }

  // Email konfirmasi diperlukan
  throw new Error('Registrasi berhasil! Silakan cek email Anda untuk konfirmasi.');
}

// ── Logout ───────────────────────────────────────────
export async function signOut() {
  if (!isConfigured()) return;
  await supabase.auth.signOut();
}

// ── Get current session ──────────────────────────────
export async function getSession() {
  if (!isConfigured()) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Get current user ─────────────────────────────────
export async function getCurrentUser() {
  if (!isConfigured()) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const meta = user.user_metadata ?? {};
  return {
    id:          user.id,
    email:       user.email,
    name:        meta.name       ?? user.email.split('@')[0],
    avatar:      meta.avatar_url ?? `https://i.pravatar.cc/150?u=${user.id}`,
    phone:       meta.phone      ?? '',
    address:     meta.address    ?? '',
    memberSince: user.created_at?.split('T')[0] ?? '',
  };
}
