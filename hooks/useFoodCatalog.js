/**
 * hooks/useFoodCatalog.js
 * Fetch katalog dari Supabase (dengan fallback ke mockData)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchFoods } from '../services/supabaseFoodService';

export function useFoodCatalog({ category, search, sortBy } = {}) {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);
  const [source,     setSource]     = useState(null);

  const abortRef = useRef(null);

  const load = useCallback(async (isRefresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const result = await fetchFoods({ category, search, sortBy });
      if (!controller.signal.aborted) {
        setData(result.data);
        setSource(result.source);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError('Gagal memuat data. Periksa koneksi Anda.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [category, search, sortBy]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, loading, refreshing, error, source, refresh };
}
