import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/apiClient';

// Public hook — fetches ads for a specific placement, honoring
// is_active + the starts_at/ends_at time window, and (for 'category_top')
// an optional category filter.
export function useAds({ placement, categoryId } = {}) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!placement) {
      setAds([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ placement });
        if (categoryId) params.set('categoryId', categoryId);
        const data = await api.get(`/advertisements?${params}`);
        if (!cancelled) setAds(data || []);
      } catch {
        if (!cancelled) setAds([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [placement, categoryId]);

  return { ads, loading };
}

// Admin hook — fetches every ad regardless of status + exposes a refetch.
export function useAdminAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      setAds((await api.get('/admin/advertisements')) || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ads, loading, refetch: fetchAll };
}
