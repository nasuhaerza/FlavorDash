/**
 * hooks/useRealtimeOrders.js
 * Subscribe ke perubahan orders via Supabase Realtime
 *
 * Saat status pesanan berubah di database → UI update otomatis tanpa refresh manual
 */

import { useEffect, useRef, useState } from 'react';
import supabase from '../services/supabase';
import { fetchOrders } from '../services/supabaseFoodService';

function isConfigured() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  return url.includes('.supabase.co') && !url.includes('your-project');
}

export function useRealtimeOrders(userId) {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const channelRef = useRef(null);

  // ── Initial fetch ─────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    fetchOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  // ── Realtime subscription ─────────────────────────
  useEffect(() => {
    if (!userId || !isConfigured()) return;

    const channel = supabase
      .channel(`orders:${userId}`)
      .on(
        'postgres_changes',
        {
          event:  '*',           // INSERT, UPDATE, DELETE
          schema: 'public',
          table:  'orders',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Ada perubahan → refetch semua orders
          const { data } = await fetchOrders();
          setOrders(data);
          setLastUpdate(new Date());

          // Log event untuk debugging
          console.log('[Realtime] Order change:', payload.eventType, payload.new?.id);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { orders, loading, lastUpdate };
}
