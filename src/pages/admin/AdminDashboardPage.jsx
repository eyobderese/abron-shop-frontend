import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, MessageSquare, AlertCircle, Menu } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useInquiries } from '../../hooks/useInquiries';
import AdminSidebar from '../../components/admin/AdminSidebar';
import InquiryTable from '../../components/admin/InquiryTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { products, loading: productsLoading } = useProducts();
  const { inquiries, loading: inquiriesLoading, updateStatus } = useInquiries();

  const newInquiries = inquiries.filter((i) => i.status === 'new');
  const recentInquiries = inquiries.slice(0, 5);
  const loading = productsLoading || inquiriesLoading;

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      link: '/admin/products',
    },
    {
      label: 'Total Inquiries',
      value: inquiries.length,
      icon: MessageSquare,
      color: 'bg-green-50 text-green-600',
      link: '/admin/inquiries',
    },
    {
      label: 'New Inquiries',
      value: newInquiries.length,
      icon: AlertCircle,
      color: 'bg-orange-50 text-orange-600',
      link: '/admin/inquiries',
    },
  ];

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
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>

        <div className="p-4 lg:p-8">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {stats.map((stat) => (
                  <Link
                    key={stat.label}
                    to={stat.link}
                    className={`p-6 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow no-underline`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <stat.icon size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Recent Inquiries */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Inquiries</h2>
                  <Link
                    to="/admin/inquiries"
                    className="text-primary text-sm font-medium hover:underline no-underline"
                  >
                    View All
                  </Link>
                </div>
                {recentInquiries.length > 0 ? (
                  <InquiryTable
                    inquiries={recentInquiries}
                    onStatusChange={updateStatus}
                  />
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    No inquiries yet.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
