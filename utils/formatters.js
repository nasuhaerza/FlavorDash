/**
 * utils/formatters.js
 * Fungsi-fungsi pemformatan umum yang dipakai di seluruh aplikasi
 */

// Format harga ke format Rupiah Indonesia
// Contoh: 25000 → "Rp 25.000"
export function formatPrice(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format tanggal ke format Indonesia
// Contoh: "2024-07-01" → "1 Juli 2024"
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Hitung total harga pesanan
export function calcOrderTotal(items = [], deliveryFee = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return subtotal + deliveryFee;
}

// Truncate teks panjang
export function truncate(text, maxLength = 60) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Render bintang rating sebagai string emoji
export function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}
