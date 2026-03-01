import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { PageLoader } from '../ui/LoadingSpinner';

const SuperAdminRoute = ({ children }) => {
  const { role, isLoading } = useAuthStore();

  if (isLoading) return <PageLoader />;
  if (!role) return <Navigate to="/login" replace />;
  if (role !== 'super_admin') return <Navigate to="/dashboard" replace />;

  return children;
};

export default SuperAdminRoute;
