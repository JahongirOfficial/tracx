import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Sun, Moon, Globe, LogOut, LayoutDashboard,
  Plane, Users, Truck, BarChart3, Wallet,
  MoreHorizontal, X, ChevronDown, AlertTriangle,
  Bell, Zap,
} from 'lucide-react';
import Sidebar from './Sidebar';
import ToastContainer from '../ui/Toast';
import useUiStore from '../../stores/uiStore';
import useAuthStore from '../../stores/authStore';
import useBalanceStore from '../../stores/balanceStore';
import useSubscription from '../../hooks/useSubscription';
import SubscriptionBlocker from '../subscription/SubscriptionBlocker';
import useSocket from '../../hooks/useSocket';
import { formatMoney } from '../../utils/formatters';

/* ── Nav items split: 4 pinned + rest in "More" sheet ── */
const pinnedNav = [
  { to: '/dashboard',          icon: LayoutDashboard, labelKey: 'nav.dashboard', end: true },
  { to: '/dashboard/flights',  icon: Plane,           labelKey: 'nav.flights' },
  { to: '/dashboard/drivers',  icon: Users,           labelKey: 'nav.drivers' },
  { to: '/dashboard/vehicles', icon: Truck,           labelKey: 'nav.vehicles' },
];
const moreNav = [
  { to: '/dashboard/reports', icon: BarChart3, labelKey: 'nav.reports' },
  { to: '/dashboard/balance', icon: Wallet,   labelKey: 'nav.balance', isBalance: true },
];

/* ── Page title ── */
const getPageTitle = (pathname) => {
  if (pathname === '/dashboard') return null;
  if (pathname.startsWith('/dashboard/flights/'))  return 'Reys tafsiloti';
  if (pathname.startsWith('/dashboard/flights'))   return 'Reyslar';
  if (pathname.startsWith('/dashboard/drivers/'))  return 'Haydovchi tafsiloti';
  if (pathname.startsWith('/dashboard/drivers'))   return 'Haydovchilar';
  if (pathname.startsWith('/dashboard/vehicles/')) return 'Mashina tafsiloti';
  if (pathname.startsWith('/dashboard/vehicles'))  return 'Mashinalar';
  if (pathname.startsWith('/dashboard/reports'))   return 'Hisobotlar';
  if (pathname.startsWith('/dashboard/balance'))   return 'Balans';
  return null;
};

/* ── User dropdown (desktop) ── */
const UserDropdown = ({ user, onLogout, t }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const initials = user?.fullName
    ? user.fullName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-colors duration-150',
          'hover:bg-slate-100 dark:hover:bg-slate-800',
          open ? 'bg-slate-100 dark:bg-slate-800' : '',
        ].join(' ')}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-xs font-bold text-white leading-none">{initials}</span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user?.username}</p>
          {(user?.companyName || user?.fullName) && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[120px]">
              {user?.companyName || user?.fullName}
            </p>
          )}
        </div>
        <ChevronDown size={14} className={['hidden sm:block text-slate-400 transition-transform duration-150', open ? 'rotate-180' : ''].join(' ')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.45)] overflow-hidden fade-in">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.username}</p>
            {(user?.companyName || user?.fullName) && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{user?.companyName || user?.fullName}</p>
            )}
          </div>
          <div className="p-1.5">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors duration-150"
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

/* ── Main layout ── */
const DashboardLayout = () => {
  const { theme, toggleTheme, lang, setLang, t } = useUiStore();
  const { user, logout } = useAuthStore();
  const { info } = useBalanceStore();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const pageTitle = getPageTitle(location.pathname);

  useSocket();

  /* Close "more" sheet when route changes */
  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    setMoreOpen(false);
    await logout();
    navigate('/login');
  };

  /* Is any "more" item currently active? */
  const moreActive = moreNav.some(({ to }) => location.pathname.startsWith(to));

  const isLow  = !info?.isTrial && (info?.daysLeft ?? 99) <= 5;
  const isWarn = !info?.isTrial && (info?.daysLeft ?? 99) <= 14 && !isLow;

  const initials = user?.fullName
    ? user.fullName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <div className={`flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 ${theme === 'dark' ? 'dark' : ''}`}>

      {/* ── Desktop sidebar ── */}
      <Sidebar />

      {/* ── Right column ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ══════════════════════════════════════════
            TOPBAR
        ══════════════════════════════════════════ */}
        <header className="h-14 lg:h-16 shrink-0 flex items-center gap-2 px-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]">

          {/* Mobile: Logo mark (desktop sidebar handles logo) */}
          <div className="lg:hidden flex items-center gap-2.5 mr-1">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm shadow-primary-500/30">
              <Truck size={15} className="text-white" />
            </div>
            {!pageTitle && (
              <span className="text-[15px] font-bold text-slate-900 dark:text-white">Tracx</span>
            )}
          </div>

          {/* Page title */}
          <div className="flex-1 flex items-center">
            {pageTitle && (
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 lg:ml-1">
                {pageTitle}
              </h2>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">

            {/* Language — hidden on mobile (available in More sheet) */}
            <button
              onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
              title="Tilni almashtirish"
            >
              <Globe size={14} />
              {lang.toUpperCase()}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
              title={theme === 'dark' ? "Yorug' rejim" : "Qorong'u rejim"}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Bell — hidden on mobile */}
            <button className="hidden sm:flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150">
              <Bell size={18} />
            </button>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Desktop: full user dropdown */}
            <div className="hidden sm:block">
              <UserDropdown user={user} onLogout={handleLogout} t={t} />
            </div>

            {/* Mobile: avatar only — opens More sheet */}
            <button
              onClick={() => setMoreOpen(true)}
              className="sm:hidden w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm ml-1"
            >
              <span className="text-xs font-bold text-white leading-none">{initials}</span>
            </button>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 p-4 lg:p-6">
          <div className="page-enter">
            {subscription?.isExpired ? <SubscriptionBlocker /> : <Outlet />}
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION
      ══════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.10)] dark:shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.40)]">
        <div className="flex h-[60px] safe-bottom">

          {/* 4 pinned items */}
          {pinnedNav.map(({ to, icon: Icon, labelKey, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex-1 flex flex-col items-center justify-center gap-[3px] relative',
                  'text-[10px] font-semibold transition-colors duration-150',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-400 dark:text-slate-500',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active pill background */}
                  {isActive && (
                    <span className="absolute top-2 w-10 h-7 rounded-full bg-primary-50 dark:bg-primary-900/30" />
                  )}
                  <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} className="relative z-10" />
                  <span className="relative z-10 leading-none">{t(labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* "More" button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-[3px] relative',
              'text-[10px] font-semibold transition-colors duration-150',
              moreActive || moreOpen
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-slate-400 dark:text-slate-500',
            ].join(' ')}
          >
            {(moreActive || moreOpen) && (
              <span className="absolute top-2 w-10 h-7 rounded-full bg-primary-50 dark:bg-primary-900/30" />
            )}
            <MoreHorizontal size={20} strokeWidth={moreActive || moreOpen ? 2.3 : 1.8} className="relative z-10" />
            <span className="relative z-10 leading-none">Yana</span>
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          "MORE" BOTTOM SHEET (mobile)
      ══════════════════════════════════════════ */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl animate-slide-up">

            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Close button */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Menyu</p>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* User info card */}
            <div className="mx-4 mt-4 mb-1 px-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm shrink-0">
                <span className="text-sm font-bold text-white leading-none">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.username}</p>
                {(user?.companyName || user?.fullName) && (
                  <p className="text-xs text-slate-500 truncate">{user?.companyName || user?.fullName}</p>
                )}
              </div>
            </div>

            {/* Balance strip (if available) */}
            {info && !info.isTrial && (
              <div className={[
                'mx-4 mt-2 px-4 py-2.5 rounded-xl flex items-center justify-between',
                isLow
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : isWarn
                  ? 'bg-amber-50 dark:bg-amber-900/20'
                  : 'bg-emerald-50 dark:bg-emerald-900/15',
              ].join(' ')}>
                <div className="flex items-center gap-2">
                  {isLow
                    ? <AlertTriangle size={14} className="text-red-500" />
                    : <Zap size={14} className={isWarn ? 'text-amber-500' : 'text-emerald-500'} />
                  }
                  <span className={[
                    'text-xs font-semibold',
                    isLow ? 'text-red-600 dark:text-red-400' : isWarn ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400',
                  ].join(' ')}>
                    {formatMoney(info.balance, 'UZS', true)}
                  </span>
                </div>
                <span className={[
                  'text-[11px] font-medium',
                  isLow ? 'text-red-500' : isWarn ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400',
                ].join(' ')}>
                  ~{info.daysLeft} kun
                </span>
              </div>
            )}

            {/* More nav items */}
            <div className="px-4 mt-3 space-y-1">
              {moreNav.map(({ to, icon: Icon, labelKey, isBalance }) => {
                const isActive = location.pathname.startsWith(to);
                const isBalanceLow = isBalance && isLow;
                const isBalanceWarn = isBalance && isWarn;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMoreOpen(false)}
                    className={[
                      'flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-150',
                      isActive
                        ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                        : isBalanceLow
                        ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400'
                        : isBalanceWarn
                        ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                    ].join(' ')}
                  >
                    {isBalance && isBalanceLow && !isActive
                      ? <AlertTriangle size={20} strokeWidth={2} />
                      : <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                    }
                    <span className="text-[15px] font-semibold">{t(labelKey)}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
                  </NavLink>
                );
              })}
            </div>

            {/* Settings row */}
            <div className="px-4 mt-3 flex gap-2">
              {/* Language */}
              <button
                onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
              >
                <Globe size={16} />
                {lang === 'uz' ? "O'zbek" : 'Русский'}
              </button>

              {/* Theme */}
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? "Yorug'" : 'Tungi'}
              </button>
            </div>

            {/* Logout */}
            <div className="px-4 mt-2 mb-6 pb-safe">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/15 border border-danger-100 dark:border-danger-800/30 transition-colors"
              >
                <LogOut size={16} />
                Chiqish
              </button>
            </div>
          </div>
        </>
      )}

      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
