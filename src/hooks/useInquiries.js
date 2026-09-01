import { useEffect, useState } from 'react';
import { api } from '../lib/apiClient';

export function useInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      setInquiries((await api.get('/admin/inquiries')) ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function updateStatus(id, status) {
    await api.patch(`/admin/inquiries/${encodeURIComponent(id)}/status`, { status });
    await refresh();
  }

  return { inquiries, loading, updateStatus, refresh };
}
