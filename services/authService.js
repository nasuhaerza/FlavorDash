/**
 * services/authService.js
 * Mock Authentication Service — Simulasi REST API login/register
 *
 * Pada produksi, ganti fungsi-fungsi ini dengan panggilan fetch() ke backend nyata.
 * Saat ini menggunakan data statis dari mockData.js sebagai "database".
 */

import { MOCK_USERS } from '../constants/mockData';
import { generateToken } from '../utils/jwtHelper';

// Simulasi network delay (ms)
const FAKE_DELAY = 800;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -------------------------------------------------------
// Login
// @param {string} email
// @param {string} password
// @returns {Promise<{token: string, user: Object}>}
// -------------------------------------------------------
export async function loginUser(email, password) {
  await delay(FAKE_DELAY);

  const user = MOCK_USERS.find(
    (u) => u.email === email.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    throw new Error('Email atau password salah. Silakan coba lagi.');
  }

  // Buat payload token (jangan sertakan password!)
  const tokenPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };

  // Token berlaku 2 jam (7200 detik)
  const token = generateToken(tokenPayload, 7200);

  // Kembalikan token + data user (tanpa password)
  const { password: _pw, ...safeUser } = user;
  return { token, user: safeUser };
}

// -------------------------------------------------------
// Get current user dari token (simulasi /me endpoint)
// @param {string} token
// @returns {Promise<Object>} user object
// -------------------------------------------------------
export async function getCurrentUser(token) {
  await delay(300);

  // Decode token dan cari user
  const { decodeToken } = await import('../utils/jwtHelper');
  const payload = decodeToken(token);
  if (!payload) throw new Error('Token tidak valid.');

  const user = MOCK_USERS.find((u) => u.id === payload.sub);
  if (!user) throw new Error('User tidak ditemukan.');

  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

// -------------------------------------------------------
// Logout (di sisi client cukup hapus token)
// -------------------------------------------------------
export async function logoutUser() {
  await delay(200);
  return true;
}
