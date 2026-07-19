/**
 * utils/polyfills.js
 * Polyfill yang dibutuhkan untuk React Native:
 * - Buffer  : untuk JWT encoding
 * - URL     : untuk Supabase client (react-native-url-polyfill)
 */

// URL polyfill — HARUS diimport sebelum Supabase client
import 'react-native-url-polyfill/auto';

import { Buffer } from 'buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
