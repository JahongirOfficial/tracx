import { NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard, Plane, Users, Truck, BarChart3,
  Wallet, ChevronLeft, ChevronRight, AlertTriangle, UserCog,
} from 'lucide-react';
import useUiStore from '../../stores/uiStore';
import useBalanceStore from '../../stores/balanceStore';
import usePermission from '../../hooks/usePermission';
import { formatMoney } from '../../utils/formatters';

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, t } = useUiStore();
  const { info, fetchBalance } = useBalanceStore();
  const { can, isOwner } = usePermission();

  useEffect(() => { if (isOwner) fetchBalance(); }, [isOwner]);

  const isLow  = (info?.daysLeft ?? 99) <= 5;
  const isWarn = (info?.daysLeft ?? 99) <= 14 && !isLow;

  const navItems = [
    { to: '/dashboard',           icon: LayoutDashboard, labelKey: 'nav.dashboard', end: true, show: true },
    { to: '/dashboard/flights',   icon: Plane,           labelKey: 'nav.flights',   show: can('flights.view') },
    { to: '/dashboard/drivers',   icon: Users,           labelKey: 'nav.drivers',   show: can('drivers.view') },
    { to: '/dashboard/vehicles',  icon: Truck,           labelKey: 'nav.vehicles',  show: can('vehicles.view') },
    { to: '/dashboard/employees', icon: UserCog,         labelKey: 'nav.employees', show: isOwner || can('employees.view') },
    { to: '/dashboard/reports',   icon: BarChart3,       labelKey: 'nav.reports',   show: can('finance.view_reports') },
  ];

  return (
    <aside
      className={[
        'hidden lg:flex flex-col shrink-0',
        'h-screen sticky top-0 overflow-hidden',
        'transition-[width] duration-300 ease-in-out',
        'bg-white dark:bg-[#0d1420]',
        'border-r border-slate-200 dark:border-white/[0.06]',
        sidebarOpen ? 'w-[240px]' : 'w-[68px]',
      ].join(' ')}
    >
      {/* ── Logo ── */}
      <div className="flex items-center h-16 shrink-0 px-3.5 gap-3 border-b border-slate-200 dark:border-white/[0.06]">
        <img src="/icon.png" alt="Avtojon" className="w-9 h-9 object-contain shrink-0" />
        <div className={['overflow-hidden transition-[opacity] duration-200', sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'].join(' ')}>
          <p className="text-slate-900 dark:text-white font-bold text-[15px] leading-none whitespace-nowrap">Avtojon</p>
          <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5 whitespace-nowrap">Transport tizimi</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden">
        {navItems.filter(item => item.show).map(({ to, icon: Icon, labelKey, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={!sidebarOpen ? t(labelKey) : undefined}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-md px-3 py-[9px] mb-0.5',
                'text-[13.5px] font-medium transition-all duration-150',
                'whitespace-nowrap overflow-hidden',
                isActive
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/[0.06]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className="shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className={['transition-[opacity] duration-200', sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none w-0'].join(' ')}>
                  {t(labelKey)}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* ── Balance nav item (special with badge, owner only) ── */}
        {isOwner && <NavLink
          to="/dashboard/balance"
          title={!sidebarOpen ? t('nav.balance') : undefined}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 rounded-xl px-3 py-[9px] mb-0.5 mt-1',
              'text-[13.5px] font-medium transition-all duration-150',
              'whitespace-nowrap overflow-hidden',
              isActive
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                : isLow
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10'
                : isWarn
                ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/[0.06]',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              {isLow && !isActive
                ? <AlertTriangle size={18} className="shrink-0" strokeWidth={2} />
                : <Wallet size={18} className="shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
              }
              <span className={['transition-[opacity] duration-200 flex items-center justify-between w-full', sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none w-0'].join(' ')}>
                <span>{t('nav.balance')}</span>
              </span>
            </>
          )}
        </NavLink>}
      </nav>


      {/* ── Collapse toggle ── */}
      <div className="shrink-0 px-2 pb-4 pt-3 border-t border-slate-200 dark:border-white/[0.06]">
        <button
          onClick={toggleSidebar}
          title={sidebarOpen ? "Yig'ish" : 'Kengaytirish'}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all duration-150"
        >
          <span className="shrink-0">{sidebarOpen ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}</span>
          <span className={['whitespace-nowrap text-[13px] transition-[opacity] duration-200', sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none w-0'].join(' ')}>
            Yig'ish
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
