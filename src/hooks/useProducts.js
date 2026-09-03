import { useEffect, useState } from 'react';
import { api } from '../lib/apiClient';

// opts:
//   categoryIds: array of UUIDs — filter to products whose category_id ∈ set
//   search:      free-text query — matched (AND across tokens) against name + description
//   limit:       optional row limit
export function useProducts(opts = {}) {
  const { categoryIds, search, limit } = opts;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stable key so array identity changes don't re-run unnecessarily.
  const key = Array.isArray(categoryIds)
    ? categoryIds.slice().sort().join(',')
    : '';
  const q = (search || '').trim();

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (Array.isArray(categoryIds) && categoryIds.length) params.set('categoryIds', categoryIds.join(','));
        if (q) params.set('search', q);
        if (limit) params.set('limit', String(limit));
        const data = await api.get(`/products?${params}`);
        if (!cancelled) setProducts(data || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, q, limit]);

  return { products, loading, error };
}

export function useProduct(identifier) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!identifier) return;
    let cancelled = false;
    api.get(`/products/${encodeURIComponent(identifier)}`)
      .then((data) => { if (!cancelled) setProduct(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [identifier]);

  return { product, loading, error };
}
