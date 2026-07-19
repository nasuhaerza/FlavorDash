/**
 * utils/polyfills.js
 * Polyfill Buffer untuk React Native (dibutuhkan jwtHelper.js)
 * Import file ini di entry point sebelum menggunakan jwtHelper
 */

import { Buffer } from 'buffer';

// Expose Buffer ke global scope
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
