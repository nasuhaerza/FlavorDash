/**
 * hooks/useDebounce.js
 * Delay eksekusi nilai sampai user berhenti mengetik
 *
 * Penggunaan:
 *   const debouncedSearch = useDebounce(searchQuery, 400);
 *   // debouncedSearch hanya berubah 400ms setelah searchQuery terakhir berubah
 */

import { useEffect, useState } from 'react';

export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: batalkan timer jika value berubah sebelum delay habis
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
