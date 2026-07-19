/**
 * utils/jwtHelper.js
 * Helper untuk membuat dan memvalidasi JWT secara stateless di sisi client.
 *
 * Catatan: Ini adalah implementasi JWT "mock" untuk keperluan demonstrasi.
 * Pada produksi nyata, validasi JWT wajib dilakukan di sisi server.
 *
 * Format JWT: header.payload.signature (base64url encoded)
 */

import { Buffer } from 'buffer';

// Secret key sederhana untuk signing (hanya untuk mock)
const SECRET_KEY = 'flavordash-secret-2024';

// -------------------------------------------------------
// Encode base64url (URL-safe base64 tanpa padding)
// -------------------------------------------------------
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// -------------------------------------------------------
// Decode base64url
// -------------------------------------------------------
function base64UrlDecode(str) {
  // Tambahkan padding yang hilang
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

// -------------------------------------------------------
// Buat mock signature sederhana (XOR hash)
// Pada produksi: gunakan HMAC-SHA256 dari server
// -------------------------------------------------------
function createMockSignature(header, payload) {
  const data = `${header}.${payload}.${SECRET_KEY}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return base64UrlEncode(String(Math.abs(hash)));
}

// -------------------------------------------------------
// Generate JWT token dengan expiry
// @param {Object} payload - data user yang akan disimpan
// @param {number} expiresInSeconds - durasi token aktif
// @returns {string} JWT token string
// -------------------------------------------------------
export function generateToken(payload, expiresInSeconds = 3600) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: now,                        // issued at
    exp: now + expiresInSeconds,     // expiration
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(claims));
  const signature = createMockSignature(header, encodedPayload);

  return `${header}.${encodedPayload}.${signature}`;
}

// -------------------------------------------------------
// Decode JWT token tanpa verifikasi signature
// @param {string} token
// @returns {Object|null} decoded payload atau null jika invalid
// -------------------------------------------------------
export function decodeToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

// -------------------------------------------------------
// Verifikasi apakah token valid dan belum expired
// @param {string} token
// @returns {boolean}
// -------------------------------------------------------
export function isTokenValid(token) {
  const payload = decodeToken(token);
  if (!payload) return false;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) return false; // token expired

  return true;
}

// -------------------------------------------------------
// Ambil sisa waktu token (dalam detik)
// @param {string} token
// @returns {number} sisa detik, 0 jika expired
// -------------------------------------------------------
export function getTokenRemainingTime(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return 0;

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}
