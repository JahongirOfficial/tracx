import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { PageLoader } from '../ui/LoadingSpinner';

const DriverRoute = ({ children }) => {
  const { role, isLoading } = useAuthStore();

  if (isLoading) return <PageLoader />;
  if (!role) return <Navigate to="/login" replace />;
  if (role !== 'driver') return <Navigate to="/dashboard" replace />;

  return children;
};

export default DriverRoute;
