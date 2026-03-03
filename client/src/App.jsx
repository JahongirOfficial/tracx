import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import useUiStore from './stores/uiStore';

// Layouts
import DashboardLayout   from './components/layout/DashboardLayout';
import DriverLayout      from './components/layout/DriverLayout';
import SuperAdminLayout  from './components/layout/SuperAdminLayout';

// Route Guards
import BusinessRoute    from './components/routes/BusinessRoute';
import DriverRoute      from './components/routes/DriverRoute';
import SuperAdminRoute  from './components/routes/SuperAdminRoute';

// UI
import ToastContainer from './components/ui/Toast';
import { PageLoader } from './components/ui/LoadingSpinner';

// Public pages
import Landing    from './pages/Landing';
import Login      from './pages/Login';
import NotFound   from './pages/NotFound';
import Payment    from './pages/Payment';

// Dashboard pages (Businessman)
import Dashboard     from './pages/dashboard/Dashboard';
import Flights       from './pages/dashboard/Flights';
import FlightDetail  from './pages/dashboard/FlightDetail';
import Drivers       from './pages/dashboard/Drivers';
import DriverDetail  from './pages/dashboard/DriverDetail';
import Vehicles      from './pages/dashboard/Vehicles';
import VehicleDetail from './pages/dashboard/VehicleDetail';
import Reports       from './pages/dashboard/Reports';
import Balance       from './pages/dashboard/Balance';
import Employees     from './pages/dashboard/Employees';

// Driver pages
import DriverHome    from './pages/driver/DriverHome';
import DriverFlight  from './pages/driver/DriverFlight';
import DriverExpense from './pages/driver/DriverExpense';

// SuperAdmin pages
import SuperAdminDashboard         from './pages/superAdmin/SuperAdminDashboard';
import SuperAdminBusinessmen       from './pages/superAdmin/SuperAdminBusinessmen';
import SuperAdminBusinessmanDetail from './pages/superAdmin/SuperAdminBusinessmanDetail';

const App = () => {
  const { initAuth, loading } = useAuthStore();
  const { theme } = useUiStore();

  useEffect(() => { initAuth(); }, [initAuth]);

  useEffect(() => {
    const html = document.documentElement;
    theme === 'dark' ? html.classList.add('dark') : html.classList.remove('dark');
  }, [theme]);

  if (loading) return <PageLoader />;

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public */}
        <Route path="/"        element={<Landing />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/payment" element={<Payment />} />

        {/* Businessman Dashboard */}
        <Route
          path="/dashboard"
          element={
            <BusinessRoute>
              <DashboardLayout />
            </BusinessRoute>
          }
        >
          <Route index               element={<Dashboard />} />
          <Route path="flights"      element={<Flights />} />
          <Route path="flights/:id"  element={<FlightDetail />} />
          <Route path="drivers"      element={<Drivers />} />
          <Route path="drivers/:id"  element={<DriverDetail />} />
          <Route path="vehicles"     element={<Vehicles />} />
          <Route path="vehicles/:id" element={<VehicleDetail />} />
          <Route path="reports"      element={<Reports />} />
          <Route path="balance"      element={<Balance />} />
          <Route path="employees"    element={<Employees />} />
        </Route>

        {/* Driver Panel */}
        <Route
          path="/driver"
          element={
            <DriverRoute>
              <DriverLayout />
            </DriverRoute>
          }
        >
          <Route index               element={<DriverHome />} />
          <Route path="flight/:id"  element={<DriverFlight />} />
          <Route path="expense"     element={<DriverExpense />} />
        </Route>

        {/* SuperAdmin Panel — nested routes with dedicated layout + sidebar */}
        <Route
          path="/super-admin"
          element={
            <SuperAdminRoute>
              <SuperAdminLayout />
            </SuperAdminRoute>
          }
        >
          <Route index                  element={<SuperAdminDashboard />} />
          <Route path="businessmen"     element={<SuperAdminBusinessmen />} />
          <Route path="businessmen/:id" element={<SuperAdminBusinessmanDetail />} />
        </Route>

        {/* Role-based redirect */}
        <Route path="/redirect" element={<RoleRedirect />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const RoleRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'super_admin') return <Navigate to="/super-admin" replace />;
  if (user.role === 'business')    return <Navigate to="/dashboard" replace />;
  if (user.role === 'driver')      return <Navigate to="/driver" replace />;
  return <Navigate to="/login" replace />;
};

export default App;
