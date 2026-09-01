import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function ProtectedRoute() {
  const { session, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return session ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
