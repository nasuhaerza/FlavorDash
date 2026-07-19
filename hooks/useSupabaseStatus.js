/**
 * hooks/useSupabaseStatus.js
 * Cek status koneksi Supabase secara realtime
 *
 * Mengembalikan: connected (bool), checking (bool), source ('supabase'|'local'|'checking')
 */

import { useCallback, useEffect, useState } from 'react';
import { checkSupabaseConnection } from '../services/supabase';

export function useSupabaseStatus() {
  const [connected, setConnected] = useState(null); // null = belum dicek
  const [checking,  setChecking]  = useState(true);

  const check = useCallback(async () => {
    setChecking(true);
    const ok = await checkSupabaseConnection();
    setConnected(ok);
    setChecking(false);
  }, []);

  useEffect(() => {
    check();
    // Re-check setiap 30 detik
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [check]);

  const source =
    checking    ? 'checking'
    : connected ? 'supabase'
    :             'local';

  return { connected, checking, source, recheck: check };
}
