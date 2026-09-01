import { useState } from 'react';
import { Menu, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/apiClient';
import { useAdminAds } from '../../hooks/useAds';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdFormModal from '../../components/admin/AdFormModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PLACEMENT_LABEL = {
  home_hero: 'Home — hero strip',
  home_strip: 'Home — between rows',
  category_top: 'Category top',
};

export default function AdminAdsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalAd, setModalAd] = useState(undefined); // undefined=closed, null=new
  const { ads, loading, refetch } = useAdminAds();

  async function handleDelete(ad) {
    if (!window.confirm(`Delete ad "${ad.title}"? This cannot be undone.`))
      return;
    try {
      await api.delete(`/admin/advertisements/${encodeURIComponent(ad.id)}`);
      toast.success('Ad deleted');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to delete ad');
    }
  }

  async function toggleActive(ad) {
    try {
      await api.patch(`/admin/advertisements/${encodeURIComponent(ad.id)}`, {
        is_active: !ad.is_active,
      });
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base font-bold uppercase tracking-wider">
              Advertisements
            </h1>
          </div>
          <button
            onClick={() => setModalAd(null)}
            className="bg-ink text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black flex items-center gap-2"
          >
            <Plus size={14} /> New Ad
          </button>
        </header>

        <div className="p-4 lg:p-8">
          {loading ? (
            <LoadingSpinner />
          ) : ads.length === 0 ? (
            <div className="text-center py-20 text-ink-muted">
              <p className="text-sm">
                No ads yet. Click <strong>New Ad</strong> to upload one.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Preview
                      </th>
                      <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Title
                      </th>
                      <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Placement
                      </th>
                      <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Type
                      </th>
                      <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Sort
                      </th>
                      <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Status
                      </th>
                      <th className="py-2.5 px-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {ads.map((ad) => (
                      <tr
                        key={ad.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="w-20 h-12 overflow-hidden bg-gray-100 relative">
                            {ad.media_type === 'video' ? (
                              <video
                                src={ad.media_url}
                                poster={ad.poster_url || undefined}
                                muted
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={ad.media_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">{ad.title}</td>
                        <td className="py-3 px-4 text-xs">
                          {PLACEMENT_LABEL[ad.placement] || ad.placement}
                        </td>
                        <td className="py-3 px-4 text-xs uppercase">
                          {ad.media_type}
                        </td>
                        <td className="py-3 px-4 text-xs">{ad.sort_order}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleActive(ad)}
                            className={`text-xs font-bold uppercase tracking-wider ${
                              ad.is_active
                                ? 'text-emerald-600'
                                : 'text-ink-muted'
                            }`}
                          >
                            {ad.is_active ? 'Active' : 'Paused'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setModalAd(ad)}
                              className="p-1.5 text-ink-muted hover:bg-gray-100 hover:text-ink"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(ad)}
                              className="p-1.5 text-ink-muted hover:bg-red-50 hover:text-sale"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalAd !== undefined && (
        <AdFormModal
          ad={modalAd}
          onClose={() => setModalAd(undefined)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
