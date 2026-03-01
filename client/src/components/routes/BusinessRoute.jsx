import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { PageLoader } from '../ui/LoadingSpinner';

const BusinessRoute = ({ children }) => {
  const { role, isLoading } = useAuthStore();

  if (isLoading) return <PageLoader />;
  if (!role) return <Navigate to="/login" replace />;
  if (role !== 'business') {
    if (role === 'driver') return <Navigate to="/driver" replace />;
    if (role === 'super_admin') return <Navigate to="/super-admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default BusinessRoute;
