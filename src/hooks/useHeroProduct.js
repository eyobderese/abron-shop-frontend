import { useEffect, useState } from 'react';
import { api } from '../lib/apiClient';

/**
 * The product an admin ticked "Show in home hero" for.
 * `ready` turns true once we know (product or null); on any error it is null,
 * so the home page falls back to picking a shoe itself.
 */
export function useHeroProduct() {
  const [state, setState] = useState({ ready: false, product: null });

  useEffect(() => {
    let cancelled = false;
    api
      .get('/products/hero')
      .then((product) => {
        if (!cancelled) setState({ ready: true, product: product && product.id ? product : null });
      })
      .catch(() => {
        if (!cancelled) setState({ ready: true, product: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
