import { useEffect, useState } from 'react';
import { Menu, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/apiClient';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function Stars({ value }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
      ))}
    </span>
  );
}

export default function AdminFeedbackPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api
      .get('/admin/feedback')
      .then((data) => setRows(data || []))
      .catch((err) => {
        toast.error(err.message);
        setRows([]);
      });
  }, []);

  const list = (rows || []).filter((r) =>
    filter === 'all' ? true : filter === 'low' ? r.rating <= 3 : filter === 'public' ? r.allow_public : true
  );
  const average = rows?.length ? rows.reduce((sum, r) => sum + r.rating, 0) / rows.length : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:px-8">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold">Customer feedback</h1>
        </header>

        <div className="p-4 lg:p-8 space-y-4">
          {rows === null ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-white border border-gray-200 px-4 py-3">
                  <p className="text-2xl font-bold">{average ? average.toFixed(1) : '—'}</p>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">Average of {rows.length}</p>
                </div>
                <div className="flex gap-2">
                  {[
                    ['all', 'All'],
                    ['low', '3 stars or less'],
                    ['public', 'OK to show publicly'],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setFilter(id)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${filter === id ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {list.length === 0 ? (
                <p className="text-center py-16 text-gray-400">No feedback yet.</p>
              ) : (
                <div className="bg-white border border-gray-200 divide-y divide-gray-100">
                  {list.map((r) => (
                    <div key={r.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <Stars value={r.rating} />
                        <span className="text-sm font-medium">{r.inquiry.customer}</span>
                        <span className="text-xs text-gray-500">{r.inquiry.phone}</span>
                        <span className="text-xs text-gray-500">· {r.inquiry.product_name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{new Date(r.created_at).toLocaleString()}</span>
                      </div>
                      {r.comment && <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{r.comment}</p>}
                      <p className="text-[11px] mt-1 text-gray-500">
                        {r.allow_public ? '✓ Customer allows showing this publicly' : 'Private — do not publish'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
