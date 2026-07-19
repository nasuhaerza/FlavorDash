/**
 * hooks/useFoodCatalog.js
 * Custom hook untuk fetching katalog makanan
 *
 * Menangani: loading, error, refresh, search, dan cancel request
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchFoodCatalog } from '../services/foodService';

export function useFoodCatalog() {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);
  const [source,     setSource]     = useState(null); // 'mock' | 'local'

  const abortRef = useRef(null);

  const load = useCallback(async (isRefresh = false) => {
    // Batalkan request sebelumnya
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await fetchFoodCatalog(controller.signal);
      setData(result.data);
      setSource(result.source);
    } catch (err) {
      if (err.message !== 'Request cancelled') {
        setError('Gagal memuat data. Periksa koneksi Anda.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load saat pertama mount
  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, loading, refreshing, error, source, refresh };
}
