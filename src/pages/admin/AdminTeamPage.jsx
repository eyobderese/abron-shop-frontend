import { useCallback, useEffect, useState } from 'react';
import { Menu, Plus, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../lib/roles';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Modal, inputClass, labelClass } from '../../components/admin/InquiryActionModals';

const ROLE_HELP = {
  PRODUCT_EDITOR: 'Can add and edit products (and upload product photos). Cannot delete products or see inquiries, customers, marketers, ads or settings.',
  ADMIN: 'Full access, including this Team page.',
};

function UserFormModal({ user, onClose, onSaved }) {
  const isNew = !user;
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('PRODUCT_EDITOR');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (password.length < 10) {
      toast.error('Password must be at least 10 characters');
      return;
    }
    setBusy(true);
    try {
      if (isNew) {
        await api.post('/admin/users', { email, password, role });
        toast.success('Account created — share the email and password with them privately');
      } else {
        await api.patch(`/admin/users/${user.id}`, { password });
        toast.success('Password changed — they have been signed out everywhere');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={isNew ? 'Add team member' : `New password for ${user.email}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {isNew && (
          <>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="off" />
            </div>
            <div>
              <label className={labelClass}>Role *</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
                <option value="PRODUCT_EDITOR">Product editor</option>
                <option value="ADMIN">Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">{ROLE_HELP[role]}</p>
            </div>
          </>
        )}
        <div>
          <label className={labelClass}>{isNew ? 'Password *' : 'New password *'}</label>
          <input
            type="text"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} font-mono`}
            autoComplete="new-password"
            placeholder="At least 10 characters"
          />
        </div>
        <button type="submit" disabled={busy} className="w-full bg-ink text-white py-2.5 text-sm font-bold uppercase tracking-wider disabled:opacity-50">
          {busy ? 'Saving…' : isNew ? 'Create account' : 'Change password'}
        </button>
      </form>
    </Modal>
  );
}

export default function AdminTeamPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const { session } = useAuth();

  const refresh = useCallback(
    () =>
      api
        .get('/admin/users')
        .then((rows) => setUsers(rows || []))
        .catch((err) => toast.error(err.message))
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function update(user, data, message) {
    try {
      await api.patch(`/admin/users/${user.id}`, data);
      toast.success(message);
      refresh();
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
          <h1 className="text-lg font-semibold flex-1">Team</h1>
          <button onClick={() => setModal({})} className="inline-flex items-center gap-1.5 bg-ink text-white px-3 py-2 text-xs font-bold uppercase tracking-wider">
            <Plus size={14} /> Team member
          </button>
        </header>

        <div className="p-4 lg:p-8 space-y-4">
          <p className="text-sm text-gray-600">
            Give someone a <b>Product editor</b> account to let them add and edit products without seeing
            customers, inquiries or marketers.
          </p>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="bg-white border border-gray-200 divide-y divide-gray-100">
              {users.map((user) => {
                const isSelf = user.id === session?.user?.id;
                return (
                  <div key={user.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${user.is_active ? '' : 'opacity-60'}`}>
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-medium">
                        {user.email} {isSelf && <span className="text-xs text-gray-400">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ROLE_LABELS[user.role] || user.role}
                        {!user.is_active && ' · deactivated'}
                        {' · '}
                        {user.last_login_at ? `last login ${new Date(user.last_login_at).toLocaleDateString()}` : 'never logged in'}
                      </p>
                    </div>
                    {!isSelf && (
                      <div className="flex flex-wrap gap-1.5">
                        {user.role !== 'ADMIN' && user.role !== 'PRODUCT_EDITOR' ? null : (
                          <select
                            value={user.role}
                            onChange={(e) => {
                              const role = e.target.value;
                              if (window.confirm(`Change ${user.email} to ${ROLE_LABELS[role]}?`)) {
                                update(user, { role }, 'Role updated');
                              }
                            }}
                            className="border border-gray-300 px-2 py-1 text-xs"
                          >
                            <option value="PRODUCT_EDITOR">Product editor</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        )}
                        <button
                          onClick={() => setModal({ user })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide border border-gray-300 hover:bg-gray-100"
                        >
                          <KeyRound size={12} /> Password
                        </button>
                        <button
                          onClick={() => {
                            if (!user.is_active || window.confirm(`Deactivate ${user.email}? They will be signed out immediately.`)) {
                              update(user, { is_active: !user.is_active }, user.is_active ? 'Account deactivated' : 'Account reactivated');
                            }
                          }}
                          className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide border ${user.is_active ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'}`}
                        >
                          {user.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {modal && <UserFormModal user={modal.user} onClose={() => setModal(null)} onSaved={refresh} />}
    </div>
  );
}
