/**
 * hooks/useOrders.js
 * Fetch daftar pesanan dari Supabase (dengan fallback ke mockData)
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchOrders } from '../services/supabaseFoodService';

export function useOrders() {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);
  const [source,     setSource]     = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const result = await fetchOrders();
      setData(result.data);
      setSource(result.source);
    } catch (err) {
      setError('Gagal memuat pesanan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, loading, refreshing, error, source, refresh };
}
