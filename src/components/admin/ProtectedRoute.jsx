import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { hasRole, homePathFor } from '../../lib/roles';

export default function ProtectedRoute({ roles }) {
  const { session, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (roles && !hasRole(session, roles)) return <Navigate to={homePathFor(session)} replace />;
  return <Outlet />;
}
