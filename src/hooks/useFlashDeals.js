import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/apiClient';
import { useRetryWhenFailed } from '../lib/retry';

/** Products whose flash deal is running now (soonest ending first). */
export function useFlashDeals() {
  const [deals, setDeals] = useState([]);
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/products/flash-deals')
      .then((rows) => {
        if (!cancelled) {
          setDeals(Array.isArray(rows) ? rows : []);
          setFailed(false);
        }
      })
      .catch(() => {
        // Flash deals are a bonus section; if they fail to load, the page simply hides it.
        if (!cancelled) {
          setDeals([]);
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const refetch = useCallback(() => setRetryKey((v) => v + 1), []);
  useRetryWhenFailed(failed, refetch);
  return { deals, refetch };
}
