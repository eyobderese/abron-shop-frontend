import { useState } from 'react';
import { Eye, History, AlertTriangle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/apiClient';
import { formatMoney } from '../../lib/currency';
import ProductDetailModal from './ProductDetailModal';
import { CancelModal, ConfirmSaleModal, HistoryModal, CANCEL_REASONS } from './InquiryActionModals';

export const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-emerald-100 text-emerald-700',
  delivered: 'bg-green-200 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  closed: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  confirmed: 'Sold',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  closed: 'Closed (old)',
};

const reasonLabel = (v) => CANCEL_REASONS.find((r) => r.v === v)?.l || v;

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const btn =
  'px-2 py-1 text-[11px] font-semibold uppercase tracking-wide border whitespace-nowrap transition-colors';

export default function InquiryTable({ inquiries, onChanged }) {
  const [expandedId, setExpandedId] = useState(null);
  const [viewProductId, setViewProductId] = useState(null);
  const [modal, setModal] = useState(null); // { type, inquiry }
  const [busyId, setBusyId] = useState(null);

  async function quick(inquiry, path, body, message) {
    setBusyId(inquiry.id);
    try {
      if (path === 'contacted') {
        await api.patch(`/admin/inquiries/${inquiry.id}/status`, { status: 'contacted' });
      } else {
        await api.post(`/admin/inquiries/${inquiry.id}/${path}`, body);
      }
      toast.success(message);
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  function actions(inq) {
    const busy = busyId === inq.id;
    const open = (type) => setModal({ type, inquiry: inq });
    const sell = (
      <button key="sell" className={`${btn} border-emerald-600 text-emerald-700 hover:bg-emerald-50`} onClick={() => open('confirm')}>
        Sold
      </button>
    );
    const cancel = (
      <button key="cancel" className={`${btn} border-red-300 text-red-600 hover:bg-red-50`} onClick={() => open('cancel')}>
        Cancel
      </button>
    );
    switch (inq.status) {
      case 'new':
        return [
          <button key="c" disabled={busy} className={`${btn} border-gray-300 hover:bg-gray-100`} onClick={() => quick(inq, 'contacted', undefined, 'Marked as contacted')}>
            Contacted
          </button>,
          sell,
          cancel,
        ];
      case 'contacted':
      case 'closed':
        return [sell, cancel];
      case 'confirmed':
        return [
          <button key="d" disabled={busy} className={`${btn} border-green-700 text-green-800 hover:bg-green-50`} onClick={() => quick(inq, 'deliver', undefined, 'Marked as delivered')}>
            Delivered
          </button>,
          <button key="e" className={`${btn} border-gray-300 hover:bg-gray-100`} onClick={() => open('confirm')}>
            Edit
          </button>,
          cancel,
        ];
      case 'delivered':
        return [cancel];
      case 'cancelled':
        return [
          <button key="r" disabled={busy} className={`${btn} border-gray-300 hover:bg-gray-100`} onClick={() => quick(inq, 'reopen', undefined, 'Inquiry reopened')}>
            Reopen
          </button>,
        ];
      default:
        return [];
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="py-3 px-3 font-medium text-gray-500">Date</th>
              <th className="py-3 px-3 font-medium text-gray-500">Product</th>
              <th className="py-3 px-3 font-medium text-gray-500">Customer</th>
              <th className="py-3 px-3 font-medium text-gray-500">Promo</th>
              <th className="py-3 px-3 font-medium text-gray-500">Message</th>
              <th className="py-3 px-3 font-medium text-gray-500">Status</th>
              <th className="py-3 px-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => {
              const currency = inq.currency || 'ETB';
              return (
                <tr key={inq.id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                  <td className="py-3 px-3 whitespace-nowrap text-xs text-gray-600">
                    {formatDate(inq.created_at)}
                    {inq.source === 'admin' && (
                      <span className="block mt-1 text-[10px] uppercase tracking-wide text-gray-400">
                        Phone order
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 min-w-[160px]">
                    {inq.product_id ? (
                      <button
                        onClick={() => setViewProductId(inq.product_id)}
                        className="text-primary hover:underline inline-flex items-center gap-1 text-left"
                      >
                        {inq.product_name}
                        <Eye size={14} className="shrink-0" />
                      </button>
                    ) : (
                      <span className="text-gray-500">{inq.product_name}</span>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[
                        inq.selected_size && `Size ${inq.selected_size}`,
                        inq.selected_color,
                        inq.quantity > 1 && `× ${inq.quantity}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <p>{inq.full_name}</p>
                    <p className="text-xs text-gray-500">{inq.phone}</p>
                    {inq.telegram && <p className="text-xs text-gray-500">{inq.telegram}</p>}
                    {inq.customer_on_telegram && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-sky-700">
                        <Send size={10} /> on bot
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-xs">
                    {inq.promo_code ? (
                      <>
                        <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5">
                          {inq.promo_code}
                        </span>
                        {inq.marketer && <p className="text-gray-600 mt-1">{inq.marketer.name}</p>}
                        {inq.attribution_source === 'phone' ? (
                          <p className="text-gray-500">returning customer</p>
                        ) : inq.quoted_price != null ? (
                          <p className="text-gray-700">
                            Quote {formatMoney(inq.quoted_price, currency)}
                          </p>
                        ) : (
                          <p className="text-gray-500">discount in quote</p>
                        )}
                        {inq.commission && (
                          <p className="text-gray-500">
                            Comm. {formatMoney(inq.commission.amount, 'ETB')} · {inq.commission.status}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-300">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3 px-3 max-w-[200px]">
                    {inq.message ? (
                      <div>
                        <p className={expandedId === inq.id ? '' : 'truncate'}>{inq.message}</p>
                        {inq.message.length > 50 && (
                          <button
                            className="text-primary text-xs hover:underline"
                            onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                          >
                            {expandedId === inq.id ? 'Less' : 'More'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[inq.status]}`}>
                      {STATUS_LABELS[inq.status] || inq.status}
                    </span>
                    {inq.final_amount != null && (
                      <p className="text-xs text-gray-700 mt-1">
                        {formatMoney(inq.final_amount, currency)}
                      </p>
                    )}
                    {inq.status === 'cancelled' && (
                      <p className="text-xs text-gray-500 mt-1 max-w-[180px] whitespace-normal">
                        {reasonLabel(inq.cancel_reason)}
                        {inq.cancel_note && ` — ${inq.cancel_note}`}
                      </p>
                    )}
                    {inq.customer_confirmation === 'confirmed' && (
                      <p className="text-[11px] text-emerald-700 mt-1">Customer confirmed</p>
                    )}
                    {(inq.customer_confirmation === 'disputed' || inq.open_disputes > 0) && (
                      <p className="text-[11px] text-red-600 mt-1 inline-flex items-center gap-1">
                        <AlertTriangle size={11} /> Disputed
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1.5 min-w-[150px]">
                      {actions(inq)}
                      <button
                        className={`${btn} border-transparent text-gray-500 hover:text-ink`}
                        onClick={() => setModal({ type: 'history', inquiry: inq })}
                        title="History"
                        aria-label="History"
                      >
                        <History size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {viewProductId && (
        <ProductDetailModal productId={viewProductId} onClose={() => setViewProductId(null)} />
      )}
      {modal?.type === 'confirm' && (
        <ConfirmSaleModal inquiry={modal.inquiry} onClose={() => setModal(null)} onDone={() => onChanged?.()} />
      )}
      {modal?.type === 'cancel' && (
        <CancelModal inquiry={modal.inquiry} onClose={() => setModal(null)} onDone={() => onChanged?.()} />
      )}
      {modal?.type === 'history' && (
        <HistoryModal inquiry={modal.inquiry} onClose={() => setModal(null)} />
      )}
    </>
  );
}
