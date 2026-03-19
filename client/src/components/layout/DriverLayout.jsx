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

import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import ToastContainer from '../ui/Toast';
import useAuthStore from '../../stores/authStore';
import useSocket from '../../hooks/useSocket';

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
      <main className="flex-1 overflow-y-auto">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  );
};

export default DriverLayout;
