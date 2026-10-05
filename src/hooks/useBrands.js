import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/apiClient';

function useApiResource(path) {
  const [retryKey, setRetryKey] = useState(0);
  const [result, setResult] = useState({
    requestKey: null,
    data: null,
    error: null,
  });
  const requestKey = `${path}:${retryKey}`;

  useEffect(() => {
    let cancelled = false;
    api.get(path)
      .then((data) => {
        if (!cancelled) setResult({ requestKey, data, error: null });
      })
      .catch((requestError) => {
        if (!cancelled) {
          setResult({ requestKey, data: null, error: requestError });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [path, requestKey]);

  const refetch = useCallback(() => setRetryKey((value) => value + 1), []);
  if (result.requestKey !== requestKey) {
    return { data: null, loading: true, error: null, refetch };
  }
  return {
    data: result.data,
    loading: false,
    error: result.error,
    refetch,
  };
}

export function useBrands() {
  const result = useApiResource('/brands');
  return { brands: result.data || [], ...result };
}

export function useBrandProducts(slug) {
  const result = useApiResource(`/brands/${encodeURIComponent(slug || '')}/products`);
  return {
    brand: result.data?.brand || null,
    products: result.data?.products || [],
    ...result,
  };
}
