import { useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useInquiries } from '../../hooks/useInquiries';
import { useProducts } from '../../hooks/useProducts';
import { api } from '../../lib/apiClient';
import AdminSidebar from '../../components/admin/AdminSidebar';
import InquiryTable from '../../components/admin/InquiryTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Modal, inputClass, labelClass } from '../../components/admin/InquiryActionModals';

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'confirmed', label: 'Sold' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'closed', label: 'Closed (old)' },
  { id: 'promo', label: 'With promo' },
];

function matches(inquiry, filter) {
  if (filter === 'all') return true;
  if (filter === 'promo') return Boolean(inquiry.promo_code);
  return inquiry.status === filter;
}

function PhoneOrderModal({ onClose, onDone }) {
  const { products, loading } = useProducts();
  const [form, setForm] = useState({
    product_id: '',
    full_name: '',
    phone: '',
    telegram: '',
    selected_size: '',
    quantity: 1,
    promo_code: '',
    message: '',
  });
  const [busy, setBusy] = useState(false);
  const product = products.find((p) => p.id === form.product_id);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/admin/inquiries', {
        product_id: form.product_id,
        full_name: form.full_name,
        phone: form.phone,
        telegram: form.telegram || null,
        selected_size: form.selected_size || null,
        quantity: Number(form.quantity) || 1,
        promo_code: form.promo_code || null,
        message: form.message || null,
      });
      toast.success('Order recorded');
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Record phone order" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-gray-500">
          For orders taken by phone or in person. Recording every sale here means a marketer whose
          customer comes back within the attribution window is credited automatically.
        </p>
        <div>
          <label className={labelClass}>Product *</label>
          <select required value={form.product_id} onChange={set('product_id')} className={inputClass}>
            <option value="">{loading ? 'Loading…' : 'Select a product'}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand ? `${p.brand} — ` : ''}
                {p.name}
                {p.color_name ? ` (${p.color_name})` : ''}
              </option>
            ))}
          </select>
        </div>
        {product?.sizes?.length > 0 && (
          <div>
            <label className={labelClass}>Size *</label>
            <select required value={form.selected_size} onChange={set('selected_size')} className={inputClass}>
              <option value="">Select size</option>
              {product.sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Customer name *</label>
            <input required value={form.full_name} onChange={set('full_name')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone *</label>
            <input required value={form.phone} onChange={set('phone')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telegram</label>
            <input value={form.telegram} onChange={set('telegram')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Quantity</label>
            <input type="number" min={1} value={form.quantity} onChange={set('quantity')} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Promo code (if the customer gave one)</label>
          <input
            value={form.promo_code}
            onChange={(e) => setForm((f) => ({ ...f, promo_code: e.target.value.toUpperCase() }))}
            className={`${inputClass} uppercase`}
          />
        </div>
        <div>
          <label className={labelClass}>Note</label>
          <textarea rows={2} value={form.message} onChange={set('message')} className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-ink text-white py-2.5 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Record order'}
        </button>
      </form>
    </Modal>
  );
}

export default function AdminInquiriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [phoneOrderOpen, setPhoneOrderOpen] = useState(false);
  const { inquiries, loading, refresh } = useInquiries();

  const filtered = inquiries.filter((i) => matches(i, filter));
  const visibleFilters = statusFilters.filter(
    (sf) => sf.id !== 'closed' || inquiries.some((i) => i.status === 'closed')
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:px-8">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold flex-1">Inquiries</h1>
          <button
            onClick={() => setPhoneOrderOpen(true)}
            className="inline-flex items-center gap-1.5 bg-ink text-white px-3 py-2 text-xs font-bold uppercase tracking-wider"
          >
            <Plus size={14} /> Phone order
          </button>
        </header>

        <div className="p-4 lg:p-8">
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {visibleFilters.map((sf) => (
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
                    ({inquiries.filter((i) => matches(i, sf.id)).length})
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
              <InquiryTable inquiries={filtered} onChanged={refresh} />
            </div>
          )}
        </div>
      </div>

      {phoneOrderOpen && (
        <PhoneOrderModal onClose={() => setPhoneOrderOpen(false)} onDone={refresh} />
      )}
    </div>
  );
}
