/**
 * hooks/useOrderDetail.js
 * Fetch detail satu pesanan berdasarkan ID dari Supabase
 * (fallback ke mockData jika tidak terkonfigurasi)
 */

import { useEffect, useState } from 'react';
import { fetchOrderById } from '../services/supabaseFoodService';

export function useOrderDetail(id) {
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchOrderById(id)
      .then((data) => { if (!cancelled) setOrder(data); })
      .catch((err)  => { if (!cancelled) setError(err.message); })
      .finally(()   => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  return { order, loading, error };
}
