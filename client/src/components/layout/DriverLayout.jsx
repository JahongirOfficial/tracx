/**
 * DriverLayout — mobile-first driver panel shell.
 *
 * Layout:
 *   Header  — gradient primary-600→700 bar, driver name + status badge, logout button.
 *   Content — flex-1 scrollable area with pb-20 to clear bottom nav.
 *   Bottom nav — 2 items only (Home + Flights), larger icons, active state with colored dot.
 *
 * Max-width: max-w-lg mx-auto → phone-sized centering on larger screens.
 * Dark mode: full support throughout.
 */

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Plane, LogOut } from 'lucide-react';
import ToastContainer from '../ui/Toast';
import useAuthStore from '../../stores/authStore';
import useSocket from '../../hooks/useSocket';

/* Bottom nav definitions for drivers */
const driverNavItems = [
  { to: '/driver', icon: Home, label: 'Bosh sahifa', end: true },
  { to: '/driver/flights', icon: Plane, label: 'Reyslar' },
];

/* Status badge colors */
const statusConfig = {
  free: {
    label: "Bo'sh",
    className: 'bg-emerald-400/20 text-emerald-100 border border-emerald-400/30',
  },
  busy: {
    label: 'Band',
    className: 'bg-amber-400/20 text-amber-100 border border-amber-400/30',
  },
  offline: {
    label: 'Offline',
    className: 'bg-slate-400/20 text-slate-200 border border-slate-400/30',
  },
};

const DriverLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  /* Real-time socket for driver events (leg assignments, etc.) */
  useSocket();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  /* Driver name initials for the avatar bubble */
  const name = user?.fullName || user?.username || '';
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'D';

  const statusInfo = statusConfig[user?.status] || statusConfig.offline;

  return (
    /* Centered phone-width container */
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 max-w-lg mx-auto">

      {/* ── Header ── */}
      <header
        className={[
          'bg-gradient-to-r from-primary-600 to-primary-700',
          'dark:from-primary-700 dark:to-primary-800',
          'text-white safe-top shrink-0',
          /* Subtle shadow for depth */
          'shadow-[0_4px_20px_-4px_rgba(37,99,235,0.5)]',
        ].join(' ')}
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          {/* Avatar bubble */}
          <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-sm font-bold text-white leading-none">{initials}</span>
          </div>

          {/* Name + status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-semibold text-white leading-tight truncate">
                {name}
              </p>
              <span
                className={[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  statusInfo.className,
                ].join(' ')}
              >
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-white/70 mt-0.5 leading-tight">Avtojon Haydovchi</p>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={[
              'p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30',
              'transition-colors duration-150',
              'text-white',
            ].join(' ')}
            aria-label="Chiqish"
            title="Chiqish"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      {/* ── Bottom navigation (2 items) ── */}
      <nav
        className={[
          'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40',
          'bg-white dark:bg-slate-900',
          'border-t border-slate-200/80 dark:border-slate-800',
          'safe-bottom',
          'shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.4)]',
        ].join(' ')}
      >
        <div className="flex h-16">
          {driverNavItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex-1 flex flex-col items-center justify-center gap-1 pt-2 pb-1.5 relative',
                  'text-xs font-medium transition-colors duration-150',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-400 dark:text-slate-500',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {/* Larger icons for driver nav */}
                  <Icon size={26} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="leading-none">{label}</span>
                  {/* Active dot indicator */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <ToastContainer />
    </div>
  );
};

export default DriverLayout;
