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

  const { data, error } = await supabase.auth.signInWithPassword({
    email:    email.trim().toLowerCase(),
    password,
  });
  if (error) {
    const msg = error.message?.toLowerCase() ?? '';
    if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('email not confirmed'))
      throw new Error('Email atau password salah, atau akun belum dikonfirmasi.');
    if (msg.includes('email not confirmed'))
      throw new Error('Email belum dikonfirmasi. Cek inbox Anda.');
    throw new Error(error.message);
  }

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
    const demoUser = MOCK_USERS[0];
    const { password: _pw, ...safeUser } = demoUser;
    const token = generateToken({ sub: demoUser.id, name: demoUser.name, email: demoUser.email, avatar: demoUser.avatar }, 7200);
    return { token, user: { ...safeUser, name, email } };
  }

  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email:    cleanEmail,
    password,
    options:  { data: { name } },
  });

  if (error) {
    // Terjemahkan pesan error Supabase ke Bahasa Indonesia
    const msg = error.message?.toLowerCase() ?? '';
    if (msg.includes('invalid email') || msg.includes('email'))
      throw new Error('Format email tidak valid. Pastikan email Anda benar.');
    if (msg.includes('password'))
      throw new Error('Password terlalu lemah. Gunakan minimal 6 karakter.');
    if (msg.includes('already registered') || msg.includes('already been registered'))
      throw new Error('Email sudah terdaftar. Silakan login atau gunakan email lain.');
    throw new Error(error.message);
  }

  // Jika ada session langsung (email confirmation dinonaktifkan di Supabase)
  if (data.session) {
    return signIn(cleanEmail, password);
  }

  // Jika user ada tapi tidak ada session → email confirmation diperlukan
  if (data.user) {
    throw new Error(
      'Registrasi berhasil! Silakan cek email Anda untuk konfirmasi akun sebelum login.\n\n' +
      'Tip: Cek folder Spam jika tidak menemukan email.'
    );
  }

  throw new Error('Registrasi gagal. Silakan coba lagi.');
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

// ── Update user metadata ─────────────────────────────
export async function updateProfile({ name, phone, address, avatarUrl }) {
  if (!isConfigured()) return;

  const updates = {};
  if (name)      updates.name        = name;
  if (phone)     updates.phone       = phone;
  if (address)   updates.address     = address;
  if (avatarUrl) updates.avatar_url  = avatarUrl;

  const { error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error) throw new Error(error.message);
}

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
