/**
 * hooks/useLocation.js
 * Custom hook untuk mendapatkan lokasi GPS pengguna
 * menggunakan expo-location
 *
 * Menangani: permission request, fetching koordinat, error
 */

import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export function useLocation({ autoFetch = false } = {}) {
  const [location,    setLocation]    = useState(null);  // { latitude, longitude, accuracy }
  const [permission,  setPermission]  = useState(null);  // 'granted' | 'denied' | 'undetermined'
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  // ── Request permission ──────────────────────────────
  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermission(status);
    return status === 'granted';
  }, []);

  // ── Cek permission saat mount ───────────────────────
  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setPermission(status);
    });
  }, []);

  // ── Ambil lokasi ────────────────────────────────────
  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pastikan permission sudah ada
      let granted = permission === 'granted';
      if (!granted) {
        granted = await requestPermission();
      }
      if (!granted) {
        setError('Izin lokasi diperlukan untuk fitur ini.');
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude:  loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy:  loc.coords.accuracy,
      };
      setLocation(coords);
      return coords;
    } catch (err) {
      setError('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [permission, requestPermission]);

  // ── Auto-fetch jika diminta ─────────────────────────
  useEffect(() => {
    if (autoFetch && permission === 'granted') {
      fetchLocation();
    }
  }, [autoFetch, permission, fetchLocation]);

  return {
    location,
    permission,
    loading,
    error,
    fetchLocation,
    requestPermission,
    isGranted: permission === 'granted',
  };
}
