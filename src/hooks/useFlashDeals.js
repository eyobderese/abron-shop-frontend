import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/apiClient';

/** Products whose flash deal is running now (soonest ending first). */
export function useFlashDeals() {
  const [deals, setDeals] = useState([]);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/products/flash-deals')
      .then((rows) => {
        if (!cancelled) setDeals(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        // Flash deals are a bonus section; if they fail to load, the page simply hides it.
        if (!cancelled) setDeals([]);
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const refetch = useCallback(() => setRetryKey((v) => v + 1), []);
  return { deals, refetch };
}
