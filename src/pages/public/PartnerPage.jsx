import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Send, ShieldCheck, AlertTriangle, ChevronDown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '../../lib/apiClient';
import { formatMoney } from '../../lib/currency';
import Seo from '../../components/seo/Seo';
import BrandLogo from '../../components/ui/BrandLogo';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const etb = (v) => formatMoney(v ?? 0, 'ETB');
const day = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

const STATUS = {
  new: { label: 'New', cls: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Being contacted', cls: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Sold', cls: 'bg-emerald-100 text-emerald-700' },
  delivered: { label: 'Delivered', cls: 'bg-green-200 text-green-800' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700' },
  closed: { label: 'Closed', cls: 'bg-gray-100 text-gray-600' },
};

const COMMISSION = {
  pending: 'Pending',
  approved: 'Ready to pay',
  paid: 'Paid',
  void: 'Not earned',
};

const HISTORY_LABELS = {
  'inquiry.created': 'New inquiry',
  'inquiry.contacted': 'Customer contacted',
  'inquiry.confirmed': 'Sale confirmed',
  'inquiry.sale_amount_changed': 'Sale amount changed',
  'inquiry.delivered': 'Delivered',
  'inquiry.cancelled': 'Inquiry cancelled',
  'inquiry.reopened': 'Inquiry reopened',
  'inquiry.attributed_by_phone': 'Returning customer credited to you',
  'inquiry.customer_confirmed': 'Customer confirmed they did not buy',
  'inquiry.customer_disputed': 'Customer says they bought it',
  'inquiry.confirmed_by_dispute': 'Sale confirmed through dispute',
  'commission.created': 'Commission recorded',
  'commission.updated': 'Commission updated',
  'commission.restored': 'Commission restored',
  'commission.voided': 'Commission cancelled',
  'commission.approved': 'Commission ready to pay',
  'commission.penalty_applied': 'Dispute compensation applied',
  'payout.paid': 'Payout sent',
  'dispute.opened': 'Dispute opened',
  'dispute.accepted': 'Dispute accepted',
  'dispute.rejected': 'Dispute rejected',
  'promo_code.created': 'Code created',
  'promo_code.updated': 'Code changed',
  'marketer.created': 'Partner account created',
  'marketer.updated': 'Account details updated',
  'marketer.telegram_connected': 'Telegram connected',
  'marketer.portal_link_regenerated': 'New private link created',
};

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied');
  } catch {
    toast.error('Copy failed — long-press to copy');
  }
}

function Tile({ label, value, tone = '' }) {
  return (
    <div className={`bg-white border border-gray-200 p-3 ${tone}`}>
      <p className="text-lg font-bold leading-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function DisputeForm({ token, inquiry, onDone }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await api.post(`/partner/${token}/disputes`, { inquiry_id: inquiry.id, note: note.trim() || null });
      toast.success('Dispute sent. The shop must respond.');
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-3 text-xs font-semibold text-red-700 underline">
        I believe this was sold
      </button>
    );
  }
  return (
    <div className="mt-3 border border-red-200 bg-red-50 p-3 space-y-2">
      <p className="text-xs text-red-900">
        Tell us why. If the sale is proven, you are paid the commission and the same amount again as compensation.
      </p>
      <textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={2000}
        placeholder="e.g. The customer told me they received the shoes on…"
        className="w-full border border-gray-300 px-2 py-1.5 text-sm"
      />
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy} className="bg-red-700 text-white px-3 py-1.5 text-xs font-bold uppercase disabled:opacity-50">
          {busy ? 'Sending…' : 'Open dispute'}
        </button>
        <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-xs">Cancel</button>
      </div>
    </div>
  );
}

function InquiryCard({ token, inquiry, multiplier, onChanged }) {
  const status = STATUS[inquiry.status] || STATUS.new;
  const currency = inquiry.currency || 'ETB';
  const c = inquiry.commission;
  return (
    <div className="bg-white border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm">{inquiry.product_name}{inquiry.quantity > 1 && ` × ${inquiry.quantity}`}</p>
          <p className="text-xs text-gray-500">
            {inquiry.customer} · {inquiry.phone} · {day(inquiry.created_at)}
          </p>
          <p className="text-xs text-gray-500">
            {inquiry.attribution === 'phone' ? `Returning customer (first came with ${inquiry.code})` : `Code ${inquiry.code}`}
          </p>
        </div>
        <span className={`shrink-0 px-2 py-0.5 text-[11px] font-semibold rounded-full ${status.cls}`}>{status.label}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {inquiry.quoted_price != null && (
          <p><span className="text-gray-500">Quoted:</span> {formatMoney(inquiry.quoted_price, currency)}</p>
        )}
        {inquiry.final_amount != null && (
          <p><span className="text-gray-500">Sold for:</span> {formatMoney(inquiry.final_amount, currency)}</p>
        )}
        {c && (
          <p className="col-span-2">
            <span className="text-gray-500">Your commission:</span>{' '}
            <b className={c.status === 'void' ? 'line-through text-gray-400' : ''}>{etb(c.amount)}</b> · {COMMISSION[c.status]}
            {c.is_penalty && ` (includes ×${multiplier} dispute compensation)`}
            {c.status === 'pending' && c.eligible_at && ` — payable from ${day(c.eligible_at)}`}
            {c.status === 'pending' && !c.eligible_at && ' — payable after delivery'}
          </p>
        )}
      </div>

      {inquiry.status === 'cancelled' && (
        <div className="mt-3 text-xs bg-gray-50 p-2">
          <p><span className="text-gray-500">Reason:</span> {inquiry.cancel_reason}{inquiry.cancel_note && ` — ${inquiry.cancel_note}`}</p>
          {inquiry.customer_confirmation === 'confirmed' && (
            <p className="text-emerald-700 mt-1 inline-flex items-center gap-1"><ShieldCheck size={12} /> The customer confirmed on Telegram that they did not buy.</p>
          )}
          {inquiry.customer_confirmation === 'disputed' && (
            <p className="text-red-700 mt-1 inline-flex items-center gap-1"><AlertTriangle size={12} /> The customer says they bought it — under review.</p>
          )}
          {!inquiry.customer_confirmation && inquiry.customer_on_telegram && (
            <p className="text-gray-500 mt-1">Waiting for the customer to confirm on Telegram.</p>
          )}
        </div>
      )}

      {inquiry.disputes.map((d) => (
        <div key={d.id} className="mt-3 text-xs border-l-2 border-red-300 pl-2">
          <p>
            <b>Dispute</b> ({d.source === 'customer' ? 'by the customer' : 'by you'}) · {day(d.created_at)} ·{' '}
            <span className={d.status === 'accepted' ? 'text-emerald-700' : d.status === 'rejected' ? 'text-gray-600' : 'text-red-700'}>
              {d.status === 'open' ? 'waiting for the shop' : d.status}
            </span>
          </p>
          {d.note && <p className="text-gray-600">“{d.note}”</p>}
          {d.admin_response && <p className="text-gray-800">Shop: {d.admin_response}</p>}
        </div>
      ))}

      {inquiry.can_dispute && <DisputeForm token={token} inquiry={inquiry} onDone={onChanged} />}
    </div>
  );
}

export default function PartnerPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showHistory, setShowHistory] = useState(false);

  const load = useCallback(
    () =>
      api
        .get(`/partner/${encodeURIComponent(token)}`)
        .then((result) => {
          setData(result);
          setError(null);
        })
        .catch(setError),
    [token]
  );

  useEffect(() => {
    load();
  }, [load]);

  const page = (body) => (
    <div className="min-h-screen bg-gray-50">
      <Seo title="Partner" description="Abron Shop partner page." canonical={false} noindex />
      <Toaster position="top-center" />
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <BrandLogo className="h-8 w-auto" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Partner</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">{body}</main>
    </div>
  );

  if (error) {
    return page(
      <div className="text-center py-20">
        <p className="font-semibold">This partner link is not valid.</p>
        <p className="text-sm text-gray-500 mt-1">It may have been replaced. Ask Abron Shop for your current link.</p>
      </div>
    );
  }
  if (!data) return page(<LoadingSpinner />);

  const { marketer, terms, codes, stats, commissions, inquiries, payouts, history } = data;
  const filtered = inquiries.filter((i) =>
    filter === 'all' ? true : filter === 'sold' ? ['confirmed', 'delivered'].includes(i.status) : filter === 'cancelled' ? i.status === 'cancelled' : ['new', 'contacted', 'closed'].includes(i.status)
  );

  return page(
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-bold">Hello, {marketer.name}</h1>
        {!marketer.is_active && <p className="text-sm text-red-600 mt-1">Your partner account is paused.</p>}
        {!marketer.telegram_connected && marketer.telegram_connect_url && (
          <a
            href={marketer.telegram_connect_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 bg-[#229ED9] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider"
          >
            <Send size={13} /> Get instant alerts on Telegram
          </a>
        )}
        {marketer.telegram_connected && (
          <p className="text-xs text-sky-700 mt-2 inline-flex items-center gap-1"><Send size={11} /> Telegram alerts are on</p>
        )}
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Tile label="Link visits" value={stats.visits} />
        <Tile label="Inquiries" value={stats.inquiries} />
        <Tile label="Sold" value={stats.sold} />
        <Tile label="Cancelled" value={stats.cancelled} />
        <Tile label="Pending" value={etb(commissions.pending)} />
        <Tile label="Ready to pay" value={etb(commissions.approved)} tone="border-emerald-300" />
        <Tile label="Paid to you" value={etb(commissions.paid)} />
        <Tile label="In progress" value={stats.open} />
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-2">Your codes</h2>
        <div className="space-y-2">
          {codes.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 p-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`font-mono font-bold text-lg ${c.is_active ? '' : 'line-through text-gray-400'}`}>{c.code}</span>
                {!c.is_active && <span className="text-xs text-red-600">paused</span>}
                <span className="text-sm">Customers get <b>{c.discount_label}</b></span>
                <span className="text-sm">You earn <b>{etb(c.commission_amount)}</b> per item</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {c.visits} link visits · {c.uses} inquiries
                {c.ends_at && ` · valid until ${day(c.ends_at)}`}
              </p>
              <div className="mt-2 flex gap-2">
                <input readOnly value={c.share_url} className="flex-1 border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-mono" onFocus={(e) => e.target.select()} />
                <button onClick={() => copy(c.share_url)} className="inline-flex items-center gap-1 border border-gray-300 px-2 text-xs"><Copy size={12} /> Copy</button>
              </div>
            </div>
          ))}
          {codes.length === 0 && <p className="text-sm text-gray-500">No codes yet.</p>}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2 gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider">Your customers</h2>
          <div className="flex gap-1 overflow-x-auto">
            {[['all', 'All'], ['open', 'In progress'], ['sold', 'Sold'], ['cancelled', 'Cancelled']].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)} className={`px-2.5 py-1 text-xs whitespace-nowrap ${filter === id ? 'bg-ink text-white' : 'bg-white border border-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map((inquiry) => (
            <InquiryCard key={inquiry.id} token={token} inquiry={inquiry} multiplier={terms.dispute_multiplier} onChanged={load} />
          ))}
          {filtered.length === 0 && <p className="text-sm text-gray-500 py-6 text-center">Nothing here yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-2">Payouts</h2>
        {payouts.length === 0 ? (
          <p className="text-sm text-gray-500">No payouts yet.</p>
        ) : (
          <div className="bg-white border border-gray-200 divide-y divide-gray-100">
            {payouts.map((p) => (
              <div key={p.id} className="p-3 text-sm flex flex-wrap gap-x-4 gap-y-1">
                <b>{etb(p.amount)}</b>
                <span>{day(p.paid_at)}</span>
                <span className="text-gray-600">{p.method} · ref <span className="font-mono">{p.transaction_ref}</span></span>
                {p.receipt_url && (
                  <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">View receipt</a>
                )}
                {p.note && <span className="w-full text-xs text-gray-500">{p.note}</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 p-4 text-sm space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider">How it works</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>When a customer uses your code, you are notified and the inquiry appears here.</li>
          <li>Every inquiry ends as <b>Sold</b> or <b>Cancelled with a reason</b>. Nothing is deleted.</li>
          <li>If the same customer (same phone number) buys within <b>{terms.attribution_days} days</b> — even without the code — the sale is credited to you.</li>
          <li>Your commission is fixed per item and becomes payable <b>{terms.hold_days} days after delivery</b> (in case of returns).</li>
          <li>Cancelled customers who use our Telegram bot are asked to confirm they did not buy.</li>
          <li>If you believe a cancelled inquiry was actually sold, open a dispute. If it is proven, we pay <b>your commission × {terms.dispute_multiplier}</b>.</li>
          <li>Every payout shows the transaction reference so you can check it against your account.</li>
        </ul>
      </section>

      <section>
        <button onClick={() => setShowHistory((v) => !v)} className="text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1">
          Full activity log <ChevronDown size={14} className={showHistory ? 'rotate-180' : ''} />
        </button>
        {showHistory && (
          <ol className="mt-3 space-y-2 border-l border-gray-200 pl-4">
            {history.map((h) => (
              <li key={h.id} className="text-xs">
                <p className="font-medium text-sm">{HISTORY_LABELS[`${h.entity}.${h.action}`] || `${h.entity} ${h.action}`}</p>
                <p className="text-gray-500">
                  {new Date(h.created_at).toLocaleString()} · by {h.by}
                </p>
                <HistoryDetail detail={h.detail} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

const DETAIL_KEYS = ['product', 'code', 'amount', 'previous_amount', 'final_amount', 'quantity', 'reason', 'note', 'method', 'transaction_ref', 'multiplier', 'response'];

function HistoryDetail({ detail }) {
  const parts = DETAIL_KEYS.filter((k) => detail?.[k] !== undefined && detail[k] !== null && detail[k] !== '').map(
    (k) => `${k.replace(/_/g, ' ')}: ${detail[k]}`
  );
  if (detail?.commission_amount?.from !== undefined) parts.push(`commission: ${detail.commission_amount.from} → ${detail.commission_amount.to}`);
  if (detail?.discount?.from !== undefined) parts.push(`discount: ${detail.discount.from} → ${detail.discount.to}`);
  return parts.length ? <p className="text-gray-600">{parts.join(' · ')}</p> : null;
}
