import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/apiClient';

// opts:
//   categoryIds: array of UUIDs — filter to products whose category_id ∈ set
//   search:      free-text query — matched across name, brand/model, and description
//   limit:       optional row limit
export function useProducts(opts = {}) {
  const { categoryIds, search, limit } = opts;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  // Stable key so array identity changes don't re-run unnecessarily.
  const key = Array.isArray(categoryIds)
    ? categoryIds.slice().sort().join(',')
    : '';
  const q = (search || '').trim();

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (Array.isArray(categoryIds) && categoryIds.length) params.set('categoryIds', categoryIds.join(','));
        if (q) params.set('search', q);
        if (limit) params.set('limit', String(limit));
        const data = await api.get(`/products?${params}`);
        if (!cancelled) setProducts(data || []);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, q, limit, retryKey]);

  const refetch = useCallback(() => setRetryKey((value) => value + 1), []);
  return { products, loading, error, refetch };
}

export function useProduct(identifier) {
  const [retryKey, setRetryKey] = useState(0);
  const [result, setResult] = useState({
    requestKey: null,
    product: null,
    error: null,
  });
  const requestKey = `${identifier ?? ''}:${retryKey}`;

  useEffect(() => {
    if (!identifier) return;
    let cancelled = false;
    api.get(`/products/${encodeURIComponent(identifier)}`)
      .then((data) => {
        if (!cancelled) setResult({ requestKey, product: data, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ requestKey, product: null, error: err });
        }
      });
    return () => { cancelled = true; };
  }, [identifier, requestKey]);

  const refetch = useCallback(() => setRetryKey((value) => value + 1), []);
  if (result.requestKey !== requestKey) {
    return { product: null, loading: true, error: null, refetch };
  }
  return {
    product: result.product,
    loading: false,
    error: result.error,
    refetch,
  };
}

export function useRelatedProducts(identifier, limit = 8) {
  const [result, setResult] = useState({
    identifier: null,
    products: [],
    error: null,
  });

  useEffect(() => {
    if (!identifier) return;
    let cancelled = false;
    const params = new URLSearchParams({ limit: String(limit) });
    api.get(`/products/${encodeURIComponent(identifier)}/related?${params}`)
      .then((data) => {
        if (!cancelled) {
          setResult({ identifier, products: data || [], error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ identifier, products: [], error: err.message });
        }
      });
    return () => { cancelled = true; };
  }, [identifier, limit]);

  if (result.identifier !== identifier) {
    return { products: [], loading: true, error: null };
  }
  return { products: result.products, loading: false, error: result.error };
}

export function useProductVariants(identifier) {
  const [result, setResult] = useState({
    identifier: null,
    products: [],
    error: null,
  });

  useEffect(() => {
    if (!identifier) return;
    let cancelled = false;
    api.get(`/products/${encodeURIComponent(identifier)}/variants`)
      .then((data) => {
        if (!cancelled) {
          setResult({ identifier, products: data || [], error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ identifier, products: [], error: err.message });
        }
      });
    return () => { cancelled = true; };
  }, [identifier]);

  if (result.identifier !== identifier) {
    return { products: [], loading: true, error: null };
  }
  return { products: result.products, loading: false, error: result.error };
}
