import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  LogOut,
  X,
  FolderTree,
  Megaphone,
  BadgePercent,
  Star,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../ui/BrandLogo';
import { PRODUCT_ROLES, ROLE_LABELS, STAFF_ROLES, TEAM_ROLES, hasRole } from '../../lib/roles';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true, roles: STAFF_ROLES },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories', roles: STAFF_ROLES },
  { to: '/admin/products', icon: Package, label: 'Products', roles: PRODUCT_ROLES },
  { to: '/admin/ads', icon: Megaphone, label: 'Ads', roles: STAFF_ROLES },
  { to: '/admin/inquiries', icon: MessageSquare, label: 'Inquiries', roles: STAFF_ROLES },
  { to: '/admin/marketers', icon: BadgePercent, label: 'Marketers', roles: STAFF_ROLES },
  { to: '/admin/feedback', icon: Star, label: 'Feedback', roles: STAFF_ROLES },
  { to: '/admin/team', icon: Users, label: 'Team', roles: TEAM_ROLES },
];

export default function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { logout, session } = useAuth();
  const visibleLinks = links.filter((link) => hasRole(session, link.roles));

  async function handleLogout() {
    await logout();
    toast.success('Logged out');
    navigate('/admin/login');
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <Link to="/" aria-label="Abron Shop home" className="block no-underline">
            <BrandLogo className="h-9 w-auto" />
          </Link>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Admin Panel
          </p>
          {session?.user && (
            <p className="mt-0.5 text-[11px] text-gray-400 truncate max-w-[180px]" title={session.user.email}>
              {session.user.email} · {ROLE_LABELS[session.user.role] || session.user.role}
            </p>
          )}
        </div>
        <button
          className="lg:hidden p-1 rounded hover:bg-gray-100"
          onClick={onClose}
          aria-label="Close admin navigation"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={linkClass}
            onClick={onClose}
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
