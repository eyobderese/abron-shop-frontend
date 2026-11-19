import { useCallback, useEffect, useState } from 'react';
import {
  Menu,
  Plus,
  Copy,
  Link2,
  Pencil,
  Wallet,
  ListChecks,
  Send,
  AlertTriangle,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/apiClient';
import { formatMoney } from '../../lib/currency';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Modal, inputClass, labelClass } from '../../components/admin/InquiryActionModals';

const etb = (v) => formatMoney(v ?? 0, 'ETB');

async function copy(text, label = 'Copied') {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch {
    toast.error('Could not copy — select and copy it manually');
  }
}

const smallBtn =
  'inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide border border-gray-300 hover:bg-gray-100';

// ───────────────────────── modals ─────────────────────────

function PortalLinkModal({ url, name, onClose }) {
  return (
    <Modal title="Private partner link" onClose={onClose}>
      <p className="text-sm text-gray-700 mb-3">
        Send this link privately to <b>{name}</b>. Anyone with it can see their partner page, so it
        is shown <b>only once</b>. If it is lost or leaked, create a new one (the old link stops
        working).
      </p>
      <div className="flex gap-2">
        <input readOnly value={url} className={`${inputClass} font-mono text-xs`} onFocus={(e) => e.target.select()} />
        <button className={smallBtn} onClick={() => copy(url, 'Link copied')}>
          <Copy size={12} /> Copy
        </button>
      </div>
    </Modal>
  );
}

function MarketerFormModal({ marketer, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: marketer?.name || '',
    phone: marketer?.phone || '',
    telegram: marketer?.telegram || '',
    payout_method: marketer?.payout_method || 'Telebirr',
    payout_account: marketer?.payout_account || '',
    notes: marketer?.notes || '',
    is_active: marketer?.is_active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, telegram: form.telegram || null, payout_account: form.payout_account || null, notes: form.notes || null };
      const result = marketer
        ? await api.patch(`/admin/marketers/${marketer.id}`, payload)
        : await api.post('/admin/marketers', payload);
      toast.success(marketer ? 'Marketer updated' : 'Marketer created');
      onSaved(result);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={marketer ? 'Edit marketer' : 'New marketer'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className={labelClass}>Name *</label>
          <input required value={form.name} onChange={set('name')} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Phone *</label>
            <input required value={form.phone} onChange={set('phone')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telegram</label>
            <input value={form.telegram} onChange={set('telegram')} className={inputClass} placeholder="@username" />
          </div>
          <div>
            <label className={labelClass}>Payout method</label>
            <input value={form.payout_method} onChange={set('payout_method')} className={inputClass} placeholder="Telebirr / CBE" />
          </div>
          <div>
            <label className={labelClass}>Account / number</label>
            <input value={form.payout_account} onChange={set('payout_account')} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Internal notes</label>
          <textarea rows={2} value={form.notes} onChange={set('notes')} className={inputClass} />
        </div>
        {marketer && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={set('is_active')} />
            Active (inactive marketers' codes stop working)
          </label>
        )}
        <p className="text-xs text-gray-500">
          The marketer's phone is blocked from using their own codes.
        </p>
        <button type="submit" disabled={busy} className="w-full bg-ink text-white py-2.5 text-sm font-bold uppercase tracking-wider disabled:opacity-50">
          {busy ? 'Saving…' : 'Save'}
        </button>
      </form>
    </Modal>
  );
}

function CodeFormModal({ marketer, code, onClose, onSaved }) {
  const [form, setForm] = useState({
    code: code?.code || '',
    discount_type: code?.discount_type || 'PERCENT',
    discount_value: code?.discount_value ?? 10,
    commission_amount: code?.commission_amount ?? 200,
    starts_at: code?.starts_at ? code.starts_at.slice(0, 10) : '',
    ends_at: code?.ends_at ? code.ends_at.slice(0, 10) : '',
    max_uses: code?.max_uses ?? '',
    is_active: code?.is_active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        commission_amount: Number(form.commission_amount),
        starts_at: form.starts_at ? new Date(`${form.starts_at}T00:00:00`).toISOString() : null,
        ends_at: form.ends_at ? new Date(`${form.ends_at}T23:59:59`).toISOString() : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        is_active: form.is_active,
      };
      if (code) await api.patch(`/admin/promo-codes/${code.id}`, payload);
      else await api.post('/admin/promo-codes', { ...payload, code: form.code.trim(), marketer_id: marketer.id });
      toast.success(code ? 'Code updated' : 'Code created');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={code ? `Edit ${code.code}` : `New code for ${marketer.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {!code && (
          <div>
            <label className={labelClass}>Code *</label>
            <input
              required
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
              className={`${inputClass} uppercase font-mono`}
              placeholder="SELAM10"
              pattern="[A-Za-z0-9_\-]{3,30}"
            />
            <p className="text-xs text-gray-500 mt-1">3–30 letters, numbers, - or _. Cannot be changed later.</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Customer discount</label>
            <select value={form.discount_type} onChange={set('discount_type')} className={inputClass}>
              <option value="PERCENT">Percent (%)</option>
              <option value="FIXED">Fixed (ETB)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Value *</label>
            <input required type="number" min={0} step="0.01" max={form.discount_type === 'PERCENT' ? 100 : undefined} value={form.discount_value} onChange={set('discount_value')} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Marketer commission per item (ETB) *</label>
          <input required type="number" min={0} step="0.01" value={form.commission_amount} onChange={set('commission_amount')} className={inputClass} />
          {code && (
            <p className="text-xs text-gray-500 mt-1">
              Changes apply to new inquiries only. Existing inquiries keep the commission they were
              created with.
            </p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Starts</label>
            <input type="date" value={form.starts_at} onChange={set('starts_at')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Ends</label>
            <input type="date" value={form.ends_at} onChange={set('ends_at')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Max uses</label>
            <input type="number" min={1} value={form.max_uses} onChange={set('max_uses')} className={inputClass} placeholder="∞" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_active} onChange={set('is_active')} /> Active
        </label>
        <button type="submit" disabled={busy} className="w-full bg-ink text-white py-2.5 text-sm font-bold uppercase tracking-wider disabled:opacity-50">
          {busy ? 'Saving…' : 'Save'}
        </button>
      </form>
    </Modal>
  );
}

function PayoutModal({ marketer, onClose, onSaved }) {
  const [form, setForm] = useState({
    method: marketer.payout_method || 'Telebirr',
    transaction_ref: '',
    note: '',
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      let receiptUrl = null;
      if (file) receiptUrl = (await api.upload('/admin/media?folder=payouts', file)).url;
      const payout = await api.post(`/admin/marketers/${marketer.id}/payouts`, {
        ...form,
        note: form.note || null,
        receipt_url: receiptUrl,
      });
      toast.success(`Payout of ${etb(payout.amount)} recorded`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`Pay ${marketer.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="bg-emerald-50 border border-emerald-200 p-3 text-sm">
          Approved and unpaid: <b>{etb(marketer.commissions.approved)}</b>
          {marketer.payout_account && (
            <p className="text-xs text-gray-600 mt-1">
              Send to: {marketer.payout_method} {marketer.payout_account}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Send the money first, then record it here. The marketer sees this payout, its reference
          and the receipt on their partner page.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Method *</label>
            <input required value={form.method} onChange={set('method')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Transaction ref *</label>
            <input required value={form.transaction_ref} onChange={set('transaction_ref')} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Receipt screenshot</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
        </div>
        <div>
          <label className={labelClass}>Note</label>
          <input value={form.note} onChange={set('note')} className={inputClass} />
        </div>
        <button type="submit" disabled={busy} className="w-full bg-ink text-white py-2.5 text-sm font-bold uppercase tracking-wider disabled:opacity-50">
          {busy ? 'Saving…' : `Record payout of ${etb(marketer.commissions.approved)}`}
        </button>
      </form>
    </Modal>
  );
}

function LedgerModal({ marketer, onClose }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get(`/admin/marketers/${marketer.id}`).then(setData).catch((err) => toast.error(err.message));
  }, [marketer.id]);

  return (
    <Modal title={`${marketer.name} — commissions`} onClose={onClose} wide>
      {!data ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-2 font-medium">Date</th>
                <th className="py-2 pr-2 font-medium">Product</th>
                <th className="py-2 pr-2 font-medium">Customer</th>
                <th className="py-2 pr-2 font-medium">Amount</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.commissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">No commissions yet.</td>
                </tr>
              )}
              {data.commissions.map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="py-2 pr-2 text-xs whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="py-2 pr-2">{c.product_name}{c.quantity > 1 && ` × ${c.quantity}`}</td>
                  <td className="py-2 pr-2">{c.customer}</td>
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {etb(c.amount)}
                    {c.is_penalty && <span className="block text-[10px] text-red-600">dispute ×{c.amount / c.base_amount}</span>}
                  </td>
                  <td className="py-2 text-xs">
                    {c.status}
                    {c.status === 'pending' && c.eligible_at && (
                      <span className="block text-gray-500">payable {new Date(c.eligible_at).toLocaleDateString()}</span>
                    )}
                    {c.void_reason && <span className="block text-gray-500">{c.void_reason}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Payouts</h3>
            {data.payouts.length === 0 ? (
              <p className="text-sm text-gray-400">No payouts yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.payouts.map((p) => (
                  <li key={p.id} className="flex flex-wrap gap-x-3 border-b border-gray-100 pb-2">
                    <span className="font-semibold">{etb(p.amount)}</span>
                    <span>{new Date(p.paid_at).toLocaleDateString()}</span>
                    <span>{p.method} · ref {p.transaction_ref}</span>
                    {p.receipt_url && (
                      <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        receipt
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ───────────────────────── disputes ─────────────────────────

function DisputeCard({ dispute, settings, onResolved }) {
  const [response, setResponse] = useState('');
  const [amount, setAmount] = useState(dispute.inquiry.quoted_price ?? '');
  const [busy, setBusy] = useState(false);
  const open = dispute.status === 'open';

  async function resolve(decision) {
    if (response.trim().length < 3) {
      toast.error('Write a response — the marketer will see it');
      return;
    }
    if (decision === 'accept' && !window.confirm(`Accept and pay ${etb(dispute.penalty_amount)} (commission × ${settings?.dispute_multiplier ?? 2})?`)) return;
    setBusy(true);
    try {
      await api.post(`/admin/disputes/${dispute.id}/resolve`, {
        decision,
        admin_response: response.trim(),
        ...(decision === 'accept' && amount !== '' && { final_amount: Number(amount) }),
      });
      toast.success(decision === 'accept' ? 'Dispute accepted' : 'Dispute rejected');
      onResolved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`bg-white border p-4 ${open ? 'border-red-200' : 'border-gray-200 opacity-80'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{dispute.inquiry.product_name}</p>
          <p className="text-xs text-gray-500">
            {dispute.marketer_name} · code {dispute.inquiry.code} · opened by {dispute.source} on{' '}
            {new Date(dispute.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className={`text-xs font-bold uppercase px-2 py-0.5 ${open ? 'bg-red-100 text-red-700' : dispute.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
          {dispute.status}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 text-sm mt-3">
        <p><span className="text-gray-500">Customer:</span> {dispute.inquiry.customer} · {dispute.inquiry.phone}</p>
        <p><span className="text-gray-500">Cancel reason:</span> {dispute.inquiry.cancel_reason || '—'}{dispute.inquiry.cancel_note && ` — ${dispute.inquiry.cancel_note}`}</p>
        {dispute.note && <p className="sm:col-span-2"><span className="text-gray-500">Their note:</span> {dispute.note}</p>}
        {dispute.inquiry.customer_confirmation && (
          <p className="sm:col-span-2">
            <span className="text-gray-500">Customer on Telegram:</span>{' '}
            {dispute.inquiry.customer_confirmation === 'disputed' ? 'says they bought it' : 'confirmed they did not buy'}
          </p>
        )}
      </div>
      {open ? (
        <div className="mt-4 space-y-2">
          <textarea rows={2} value={response} onChange={(e) => setResponse(e.target.value)} className={inputClass} placeholder="Your response (visible to the marketer)" />
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-gray-500">Sale amount if accepted</label>
            <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className={`${inputClass} w-32`} />
            <div className="flex-1" />
            <button disabled={busy} onClick={() => resolve('reject')} className={smallBtn}>Reject</button>
            <button disabled={busy} onClick={() => resolve('accept')} className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide bg-emerald-700 text-white disabled:opacity-50">
              <Check size={12} /> Accept · pay {etb(dispute.penalty_amount)}
            </button>
          </div>
        </div>
      ) : (
        dispute.admin_response && <p className="text-sm mt-3"><span className="text-gray-500">Response:</span> {dispute.admin_response}</p>
      )}
    </div>
  );
}

// ───────────────────────── page ─────────────────────────

export default function AdminMarketersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState('marketers');
  const [marketers, setMarketers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [m, d, s] = await Promise.all([
        api.get('/admin/marketers'),
        api.get('/admin/disputes'),
        api.get('/admin/promo/settings'),
      ]);
      setMarketers(m || []);
      setDisputes(d || []);
      setSettings(s);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openDisputes = disputes.filter((d) => d.status === 'open').length;
  const close = () => setModal(null);

  async function newPortalLink(m) {
    if (!window.confirm(`Create a new private link for ${m.name}? The old link will stop working.`)) return;
    try {
      const { portal_url } = await api.post(`/admin/marketers/${m.id}/portal-link`);
      setModal({ type: 'link', url: portal_url, name: m.name });
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:px-8">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold flex-1">Marketers & promo codes</h1>
          <button onClick={() => setModal({ type: 'marketer' })} className="inline-flex items-center gap-1.5 bg-ink text-white px-3 py-2 text-xs font-bold uppercase tracking-wider">
            <Plus size={14} /> Marketer
          </button>
        </header>

        <div className="p-4 lg:p-8 space-y-6">
          {settings && (
            <p className="text-xs text-gray-500">
              Rules: a returning customer is credited to the marketer for <b>{settings.attribution_days} days</b> ·
              commission becomes payable <b>{settings.hold_days} days</b> after delivery · a proven hidden sale pays{' '}
              <b>commission × {settings.dispute_multiplier}</b>. (Change with PROMO_* server settings.)
            </p>
          )}
          <div className="flex gap-2">
            {[
              { id: 'marketers', label: `Marketers (${marketers.length})` },
              { id: 'disputes', label: `Disputes${openDisputes ? ` · ${openDisputes} open` : ''}` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.id ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'} ${t.id === 'disputes' && openDisputes ? 'ring-1 ring-red-300' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : tab === 'disputes' ? (
            disputes.length === 0 ? (
              <p className="text-center py-16 text-gray-400">No disputes. 🎉</p>
            ) : (
              <div className="space-y-3">
                {disputes.map((d) => (
                  <DisputeCard key={d.id} dispute={d} settings={settings} onResolved={refresh} />
                ))}
              </div>
            )
          ) : marketers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>No marketers yet.</p>
              <button onClick={() => setModal({ type: 'marketer' })} className="mt-3 text-primary underline text-sm">
                Add the first marketer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {marketers.map((m) => (
                <div key={m.id} className={`bg-white border border-gray-200 p-4 lg:p-5 ${m.is_active ? '' : 'opacity-60'}`}>
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-semibold text-base">
                        {m.name}
                        {!m.is_active && <span className="ml-2 text-xs text-red-600 uppercase">inactive</span>}
                        {m.open_disputes > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-600">
                            <AlertTriangle size={12} /> {m.open_disputes} open dispute(s)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {m.phone}
                        {m.telegram && ` · ${m.telegram}`}
                        {m.payout_method && ` · ${m.payout_method} ${m.payout_account || ''}`}
                      </p>
                      <p className={`text-xs mt-1 inline-flex items-center gap-1 ${m.telegram_connected ? 'text-sky-700' : 'text-gray-400'}`}>
                        <Send size={11} /> {m.telegram_connected ? 'Telegram alerts connected' : 'Telegram alerts not connected'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button className={smallBtn} onClick={() => setModal({ type: 'marketer', marketer: m })}><Pencil size={12} /> Edit</button>
                      <button className={smallBtn} onClick={() => newPortalLink(m)}><Link2 size={12} /> New private link</button>
                      <button className={smallBtn} onClick={() => setModal({ type: 'ledger', marketer: m })}><ListChecks size={12} /> Ledger</button>
                      <button
                        className={`${smallBtn} ${m.commissions.approved > 0 ? 'border-emerald-600 text-emerald-700' : ''}`}
                        disabled={!(m.commissions.approved > 0)}
                        onClick={() => setModal({ type: 'payout', marketer: m })}
                      >
                        <Wallet size={12} /> Pay {m.commissions.approved > 0 && etb(m.commissions.approved)}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mt-4 text-center">
                    {[
                      ['Link visits', m.stats.visits],
                      ['Inquiries', m.stats.inquiries],
                      ['Sold', m.stats.sold],
                      ['Cancelled', m.stats.cancelled],
                      ['Pending', etb(m.commissions.pending)],
                      ['To pay', etb(m.commissions.approved)],
                      ['Paid', etb(m.commissions.paid)],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-gray-50 py-2">
                        <p className="text-sm font-semibold">{value}</p>
                        <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider">Codes</p>
                      <button className="text-xs text-primary inline-flex items-center gap-1" onClick={() => setModal({ type: 'code', marketer: m })}>
                        <Plus size={12} /> New code
                      </button>
                    </div>
                    {m.codes.length === 0 ? (
                      <p className="text-sm text-gray-400">No codes yet.</p>
                    ) : (
                      <div className="divide-y divide-gray-100 border border-gray-100">
                        {m.codes.map((c) => (
                          <div key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-sm">
                            <span className={`font-mono font-bold ${c.is_active ? '' : 'line-through text-gray-400'}`}>{c.code}</span>
                            <span className="text-gray-600">{c.discount_label}</span>
                            <span className="text-gray-600">commission {etb(c.commission_amount)}/item</span>
                            {c.ends_at && <span className="text-xs text-gray-500">until {new Date(c.ends_at).toLocaleDateString()}</span>}
                            {c.max_uses && <span className="text-xs text-gray-500">max {c.max_uses} uses</span>}
                            <span className="text-xs text-gray-500">{c.visits} visits</span>
                            <div className="flex-1" />
                            <button className="text-xs text-primary inline-flex items-center gap-1" onClick={() => copy(c.share_url, 'Share link copied')}>
                              <Copy size={11} /> share link
                            </button>
                            <button className="text-xs text-gray-600 hover:text-ink" onClick={() => setModal({ type: 'code', marketer: m, code: c })}>
                              edit
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal?.type === 'marketer' && (
        <MarketerFormModal
          marketer={modal.marketer}
          onClose={close}
          onSaved={(result) => {
            refresh();
            if (result?.portal_url) setTimeout(() => setModal({ type: 'link', url: result.portal_url, name: result.name }), 0);
          }}
        />
      )}
      {modal?.type === 'link' && <PortalLinkModal url={modal.url} name={modal.name} onClose={close} />}
      {modal?.type === 'code' && <CodeFormModal marketer={modal.marketer} code={modal.code} onClose={close} onSaved={refresh} />}
      {modal?.type === 'payout' && <PayoutModal marketer={modal.marketer} onClose={close} onSaved={refresh} />}
      {modal?.type === 'ledger' && <LedgerModal marketer={modal.marketer} onClose={close} />}
    </div>
  );
}
