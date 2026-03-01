/**
 * DashboardLayout — top-level shell for admin/manager routes.
 *
 * Desktop: sidebar (260 / 72px) on left + full-height main content on right.
 * Mobile:  no sidebar; fixed bottom navigation bar with 5 icons instead.
 *
 * Topbar (64px):
 *   Left   — hamburger toggle (mobile only)
 *   Center — page title (flex-1 spacer)
 *   Right  — lang pill (UZ/RU), theme toggle, notification bell, user avatar + name, logout
 *
 * Mobile bottom nav:
 *   5 items, 64px height + safe-bottom padding.
 *   Active item: primary-colored icon + small filled dot indicator below.
 *
 * Subscription: if expired, renders <SubscriptionBlocker> instead of <Outlet>.
 * Socket: useSocket() is mounted here so it stays alive for the entire session.
 */

import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Globe,
  LogOut,
  User,
  Bell,
  LayoutDashboard,
  Plane,
  Users,
  Truck,
  BarChart3,
  Wallet,
  ChevronDown,
} from 'lucide-react';
import Sidebar from './Sidebar';
import ToastContainer from '../ui/Toast';
import useUiStore from '../../stores/uiStore';
import useAuthStore from '../../stores/authStore';
import useSubscription from '../../hooks/useSubscription';
import SubscriptionBlocker from '../subscription/SubscriptionBlocker';
import useSocket from '../../hooks/useSocket';

/* Mobile bottom-nav items — 5 items */
const mobileNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', end: true },
  { to: '/dashboard/flights', icon: Plane, labelKey: 'nav.flights' },
  { to: '/dashboard/drivers', icon: Users, labelKey: 'nav.drivers' },
  { to: '/dashboard/vehicles', icon: Truck, labelKey: 'nav.vehicles' },
  { to: '/dashboard/reports', icon: BarChart3, labelKey: 'nav.reports' },
  { to: '/dashboard/balance', icon: Wallet,   labelKey: 'nav.balance' },
];

/* ── User dropdown ── */
const UserDropdown = ({ user, onLogout, t }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* Close when clicking outside */
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* First letters of the user's name for the avatar */
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl',
          'hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150',
          open ? 'bg-slate-100 dark:bg-slate-800' : '',
        ].join(' ')}
      >
        {/* Avatar circle */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-xs font-bold text-white leading-none">{initials}</span>
        </div>

        {/* Name + company — only on sm+ */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
            {user?.username}
          </p>
          {(user?.companyName || user?.fullName) && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[120px]">
              {user?.companyName || user?.fullName}
            </p>
          )}
        </div>

        <ChevronDown
          size={14}
          className={[
            'hidden sm:block text-slate-400 transition-transform duration-150',
            open ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={[
            'absolute right-0 top-full mt-2 w-52 z-50',
            'bg-white dark:bg-slate-900',
            'rounded-2xl border border-slate-200/80 dark:border-slate-800',
            'shadow-[0_8px_32px_-4px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.45)]',
            'overflow-hidden',
            'fade-in',
          ].join(' ')}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.username}</p>
            {(user?.companyName || user?.fullName) && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {user?.companyName || user?.fullName}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className={[
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm',
                'text-danger-600 dark:text-danger-400',
                'hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors duration-150',
              ].join(' ')}
            >
              <LogOut size={15} />
              {t('auth.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Page title resolver — returns a human-readable title for the topbar ── */
const getPageTitle = (pathname) => {
  if (pathname === '/dashboard') return null; // Dashboard shows its own welcome message
  if (pathname.startsWith('/dashboard/flights/')) return 'Reys tafsiloti';
  if (pathname.startsWith('/dashboard/flights')) return 'Reyslar';
  if (pathname.startsWith('/dashboard/drivers/')) return 'Haydovchi tafsiloti';
  if (pathname.startsWith('/dashboard/drivers')) return 'Haydovchilar';
  if (pathname.startsWith('/dashboard/vehicles/')) return 'Mashina tafsiloti';
  if (pathname.startsWith('/dashboard/vehicles')) return 'Mashinalar';
  if (pathname.startsWith('/dashboard/reports')) return 'Hisobotlar';
  if (pathname.startsWith('/dashboard/balance')) return 'Balans';
  return null;
};

/* ── Main layout ── */
const DashboardLayout = () => {
  const { sidebarOpen, toggleSidebar, theme, toggleTheme, lang, setLang, t } = useUiStore();
  const { user, logout } = useAuthStore();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  /* Activate real-time socket connection for the entire admin session */
  useSocket();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    /* Root wrapper — applies dark class at top so all descendants inherit */
    <div className={`flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 ${theme === 'dark' ? 'dark' : ''}`}>

      {/* ── Desktop sidebar ── */}
      <Sidebar />

      {/* ── Right column: topbar + content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Topbar ── */}
        <header
          className={[
            'h-16 shrink-0 flex items-center gap-2 px-4',
            'bg-white dark:bg-slate-900',
            'border-b border-slate-200/80 dark:border-slate-800',
            'shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]',
          ].join(' ')}
        >
          {/* Mobile hamburger — hidden on desktop (sidebar already visible) */}
          <button
            onClick={toggleSidebar}
            className={[
              'lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400',
              'hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150',
            ].join(' ')}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>

          {/* Page title (center-left) — derived from current route */}
          <div className="flex-1 flex items-center">
            {pageTitle && (
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">
                {pageTitle}
              </h2>
            )}
          </div>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-1">

            {/* Language toggle pill */}
            <button
              onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl',
                'text-xs font-semibold text-slate-600 dark:text-slate-300',
                'border border-slate-200 dark:border-slate-700',
                'hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150',
              ].join(' ')}
              title="Tilni almashtirish"
            >
              <Globe size={14} />
              {lang.toUpperCase()}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={[
                'p-2 rounded-xl text-slate-500 dark:text-slate-400',
                'hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150',
              ].join(' ')}
              title={theme === 'dark' ? "Yorug' rejim" : "Qorong'u rejim"}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification bell */}
            <button
              className={[
                'relative p-2 rounded-xl text-slate-500 dark:text-slate-400',
                'hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150',
              ].join(' ')}
              title="Bildirishnomalar"
            >
              <Bell size={18} />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* User dropdown */}
            <UserDropdown user={user} onLogout={handleLogout} t={t} />
          </div>
        </header>

        {/* ── Main content ── */}
        <main
          className={[
            'flex-1 overflow-y-auto',
            /* Extra bottom padding on mobile to clear the bottom nav bar */
            'pb-20 lg:pb-0',
            'p-4 lg:p-6',
          ].join(' ')}
        >
          <div className="page-enter">
            {subscription?.isExpired ? <SubscriptionBlocker /> : <Outlet />}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom navigation bar (5 items) ── */}
      <nav
        className={[
          'lg:hidden fixed bottom-0 inset-x-0 z-40',
          'bg-white dark:bg-slate-900',
          'border-t border-slate-200/80 dark:border-slate-800',
          'safe-bottom',
          /* Soft elevation */
          'shadow-[0_-4px_16px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_16px_-2px_rgba(0,0,0,0.35)]',
        ].join(' ')}
      >
        <div className="flex h-16">
          {mobileNavItems.map(({ to, icon: Icon, labelKey, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 relative',
                  'text-xs font-medium transition-colors duration-150',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="leading-none">{t(labelKey)}</span>
                  {/* Active indicator dot */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary-600 dark:bg-primary-400"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
