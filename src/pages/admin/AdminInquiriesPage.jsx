import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useInquiries } from '../../hooks/useInquiries';
import AdminSidebar from '../../components/admin/AdminSidebar';
import InquiryTable from '../../components/admin/InquiryTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'closed', label: 'Closed' },
];

export default function AdminInquiriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const { inquiries, loading, updateStatus } = useInquiries();

  const filtered =
    filter === 'all'
      ? inquiries
      : inquiries.filter((i) => i.status === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:px-8">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold">Inquiries</h1>
        </header>

        <div className="p-4 lg:p-8">
          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {statusFilters.map((sf) => (
              <button
                key={sf.id}
                onClick={() => setFilter(sf.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === sf.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {sf.label}
                {sf.id !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({inquiries.filter((i) => i.status === sf.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No inquiries found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6">
              <InquiryTable
                inquiries={filtered}
                onStatusChange={updateStatus}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
