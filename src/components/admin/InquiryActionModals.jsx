import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/apiClient';
import { formatMoney } from '../../lib/currency';

export const CANCEL_REASONS = [
  { v: 'no_answer', l: 'Customer did not answer' },
  { v: 'changed_mind', l: 'Customer changed their mind' },
  { v: 'price', l: 'Customer found the price too high' },
  { v: 'out_of_stock', l: 'Product not available' },
  { v: 'duplicate', l: 'Duplicate inquiry' },
  { v: 'returned', l: 'Returned after purchase' },
  { v: 'other', l: 'Other (describe)' },
];

export const inputClass =
  'w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink';
export const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-1';

export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`relative bg-white w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto shadow-xl`}
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold uppercase tracking-wider">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function suggestedAmount(inquiry, quantity) {
  const unit = inquiry.quoted_price ?? inquiry.list_price;
  return unit != null ? String(unit * quantity) : '';
}

export function ConfirmSaleModal({ inquiry, onClose, onDone }) {
  const editing = inquiry.status === 'confirmed';
  const [quantity, setQuantity] = useState(inquiry.quantity || 1);
  const [amount, setAmount] = useState(
    editing && inquiry.final_amount != null
      ? String(inquiry.final_amount)
      : suggestedAmount(inquiry, inquiry.quantity || 1)
  );
  const [busy, setBusy] = useState(false);
  const currency = inquiry.currency || 'ETB';

  async function submit(e) {
    e.preventDefault();
    const finalAmount = Number(amount);
    if (!Number.isFinite(finalAmount) || finalAmount < 0) {
      toast.error('Enter the amount the customer paid');
      return;
    }
    setBusy(true);
    try {
      await api.post(`/admin/inquiries/${inquiry.id}/confirm`, {
        final_amount: finalAmount,
        quantity: Number(quantity) || 1,
      });
      toast.success(editing ? 'Sale updated' : 'Sale confirmed');
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={editing ? 'Edit sale' : 'Confirm sale'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-ink">{inquiry.product_name}</span> for{' '}
          {inquiry.full_name}
        </p>
        {inquiry.promo_code && (
          <div className="bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
            Promo <b>{inquiry.promo_code}</b>
            {inquiry.marketer && <> ({inquiry.marketer.name})</>}
            {inquiry.attribution_source === 'phone'
              ? ' — returning customer, no discount promised.'
              : inquiry.quoted_price != null
                ? ` — customer was quoted ${formatMoney(inquiry.quoted_price, currency)} per item.`
                : ' — apply the promised discount in the price.'}
            <br />
            The marketer is notified and their commission is recorded automatically.
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                if (!editing) setAmount(suggestedAmount(inquiry, Number(e.target.value) || 1));
              }}
              className={inputClass}
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Total paid ({currency}) *</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-ink text-white py-2.5 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
        >
          {busy ? 'Saving…' : editing ? 'Save' : 'Confirm sale'}
        </button>
      </form>
    </Modal>
  );
}

export function CancelModal({ inquiry, onClose, onDone }) {
  const afterSale = inquiry.status === 'confirmed' || inquiry.status === 'delivered';
  const [reason, setReason] = useState(afterSale ? 'returned' : 'no_answer');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (reason === 'other' && !note.trim()) {
      toast.error('Please describe the reason');
      return;
    }
    setBusy(true);
    try {
      await api.post(`/admin/inquiries/${inquiry.id}/cancel`, {
        reason,
        note: note.trim() || null,
      });
      toast.success('Inquiry cancelled');
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Cancel inquiry" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-ink">{inquiry.product_name}</span> for{' '}
          {inquiry.full_name}
        </p>
        {inquiry.marketer && (
          <div className="bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
            This inquiry came through <b>{inquiry.marketer.name}</b> ({inquiry.promo_code}). They will
            see this reason immediately
            {inquiry.customer_on_telegram && ', and the customer will be asked on Telegram to confirm it'}
            .
          </div>
        )}
        <div>
          <label className={labelClass}>Reason *</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass}>
            {CANCEL_REASONS.map((r) => (
              <option key={r.v} value={r.v}>
                {r.l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Note {reason === 'other' && '*'}</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputClass}
            placeholder="What did the customer say?"
            maxLength={1000}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-sale text-white py-2.5 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Cancel inquiry'}
        </button>
      </form>
    </Modal>
  );
}

const ACTION_LABELS = {
  created: 'Inquiry received',
  contacted: 'Marked as contacted',
  marked_new: 'Moved back to new',
  confirmed: 'Sale confirmed',
  sale_amount_changed: 'Sale amount changed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  reopened: 'Reopened',
  attributed_by_phone: 'Credited to marketer (same customer phone)',
  customer_confirmed: 'Customer confirmed they did not buy',
  customer_disputed: 'Customer says they bought it',
  confirmed_by_dispute: 'Sale confirmed through dispute',
};

export function HistoryModal({ inquiry, onClose }) {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    api
      .get(`/admin/inquiries/${inquiry.id}/history`)
      .then(setEvents)
      .catch((err) => {
        toast.error(err.message);
        setEvents([]);
      });
  }, [inquiry.id]);

  return (
    <Modal title="History" onClose={onClose}>
      <p className="text-sm font-semibold mb-3">{inquiry.product_name}</p>
      {events === null ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400">No history recorded (created before history tracking).</p>
      ) : (
        <ol className="space-y-3 border-l border-gray-200 pl-4">
          {events.map((e) => (
            <li key={e.id} className="text-sm">
              <p className="font-medium">{ACTION_LABELS[e.action] || e.action}</p>
              <p className="text-xs text-gray-500">
                {new Date(e.created_at).toLocaleString()} · {e.actor.replace(/^admin:/, '')}
              </p>
              <DetailLine detail={e.detail} />
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
}

export function DetailLine({ detail }) {
  const entries = Object.entries(detail || {}).filter(
    ([, v]) => v !== null && v !== undefined && v !== '' && typeof v !== 'object'
  );
  if (!entries.length) return null;
  return (
    <p className="text-xs text-gray-600 mt-0.5">
      {entries.map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' · ')}
    </p>
  );
}
