import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Users, UserCheck, UserX, Radio,
  Phone, Banknote, ChevronRight, Search, X, SlidersHorizontal,
  LayoutGrid, LayoutList, TrendingUp,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DriverForm from '../../components/drivers/DriverForm';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney } from '../../utils/formatters';
import { DRIVER_STATUSES } from '../../utils/constants';
import useDriverStore from '../../stores/driverStore';
import api from '../../services/api';

/* ── Avatar helpers ── */
const GRADIENTS = [
  'from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',  'from-orange-500 to-amber-600',
  'from-rose-500 to-pink-600',     'from-indigo-500 to-blue-600',
  'from-teal-500 to-green-600',    'from-fuchsia-500 to-purple-600',
];
const gradient  = (name = '') => GRADIENTS[(name.charCodeAt(0) || 0) % GRADIENTS.length];
const initials  = (name = '') => name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

/* ── Quick stat card ── */
const QuickStat = ({ label, value, icon: Icon, colorCls }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center gap-3 shadow-sm">
    <div className={['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', colorCls].join(' ')}>
      <Icon size={15} />
    </div>
    <div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mb-0.5">{label}</p>
      <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums leading-tight">{value}</p>
    </div>
  </div>
);

/* ── Skeleton rows ── */
const SkeletonRows = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
    {[...Array(6)].map((_, i) => (
      <div key={i} className={['h-[60px] skeleton-shimmer', i !== 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''].join(' ')} />
    ))}
  </div>
);

/* ── Skeleton cards ── */
const SkeletonCards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-40 skeleton-shimmer rounded-2xl border border-slate-200/80 dark:border-slate-800" />
    ))}
  </div>
);

/* ── Driver card for grid view ── */
const DriverCard = ({ driver, onClick }) => {
  const statusInfo = DRIVER_STATUSES.find((s) => s.value === driver.status);
  const grad       = gradient(driver.fullName);
  const ini        = initials(driver.fullName || driver.username);
  const balance    = parseFloat(driver.currentBalance) || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-150 cursor-pointer p-4 flex flex-col gap-3"
    >
      {/* Top: avatar + status */}
      <div className="flex items-start justify-between">
        <div className={['w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-sm', grad].join(' ')}>
          <span className="text-sm font-bold text-white leading-none">{ini}</span>
        </div>
        <Badge status={driver.status} label={statusInfo?.label} dot size="xs" />
      </div>

      {/* Name */}
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{driver.fullName}</p>
        <p className="text-xs text-slate-400 font-mono mt-0.5">@{driver.username}</p>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Banknote size={12} />
          {driver.paymentType === 'per_trip' ? `${driver.perTripRate}% ulush` : 'Oylik'}
        </div>
        <div className={[
          'text-xs font-bold tabular-nums',
          balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
        ].join(' ')}>
          <TrendingUp size={11} className="inline mr-0.5" />
          {formatMoney(balance, 'UZS', true)}
        </div>
      </div>

      {driver.phone && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 -mt-1">
          <Phone size={11} />
          {driver.phone}
        </div>
      )}
    </div>
  );
};

const STATUS_OPTIONS = [
  { value: 'free',    label: "Bo'sh",  activeCls: 'bg-emerald-600 border-emerald-600 text-white', dot: 'bg-emerald-400' },
  { value: 'busy',    label: 'Band',   activeCls: 'bg-amber-500 border-amber-500 text-white',     dot: 'bg-amber-400' },
  { value: 'offline', label: 'Offline',activeCls: 'bg-slate-500 border-slate-500 text-white',     dot: 'bg-slate-400' },
];
const INACTIVE_PILL = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300';

/* ── Main component ── */
const Drivers = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [allDrivers, setAllDrivers] = useState([]);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('driversView') || 'table');

  const { drivers, meta, loading, fetchDrivers } = useDriverStore();

  /* Load all for stat counts */
  useEffect(() => {
    api.get('/drivers', { params: { limit: 500 } })
      .then((r) => setAllDrivers(r.data || []))
      .catch(() => {});
  }, []);

  /* Re-fetch on filter change */
  useEffect(() => {
    const params = {};
    if (status) params.status = status;
    if (search) params.search = search;
    fetchDrivers(params);
  }, [status, search]);

  const reset = () => { setStatus(''); setSearch(''); };
  const hasFilters = status || search;

  const base        = allDrivers.length > 0 ? allDrivers : drivers;
  const freeCount   = base.filter((d) => d.status === 'free').length;
  const busyCount   = base.filter((d) => d.status === 'busy').length;
  const offlineCount = base.filter((d) => d.status === 'offline').length;

  const toggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('driversView', mode);
  };

  return (
    <div className="page-enter space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            Haydovchilar
            {meta?.total ? (
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg tabular-nums">
                {meta.total}
              </span>
            ) : null}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Barcha haydovchilar va ularning holati</p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm(true)} className="sm:self-start">
          Yangi haydovchi
        </Button>
      </div>

      {/* ── Quick stats ── */}
      {!loading && drivers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickStat label="Jami"    value={meta?.total || drivers.length} icon={Users}     colorCls="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" />
          <QuickStat label="Bo'sh"   value={freeCount}                     icon={UserCheck}  colorCls="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" />
          <QuickStat label="Band"    value={busyCount}                     icon={Radio}      colorCls="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" />
          <QuickStat label="Offline" value={offlineCount}                  icon={UserX}      colorCls="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" />
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
          <SlidersHorizontal size={13} className="text-slate-400 shrink-0" />

          {/* Status pills */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(status === opt.value ? '' : opt.value)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150',
                  status === opt.value ? opt.activeCls : INACTIVE_PILL,
                ].join(' ')}
              >
                <span className={['w-1.5 h-1.5 rounded-full', status === opt.value ? 'bg-white/80' : opt.dot].join(' ')} />
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, login..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 w-44"
            />
          </div>

          {hasFilters && (
            <button type="button" onClick={reset} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors">
              <X size={11} /> Tozalash
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => toggleView('table')}
              className={[
                'p-1.5 rounded-md transition-colors',
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
              ].join(' ')}
              title="Jadval ko'rinishi"
            >
              <LayoutList size={14} />
            </button>
            <button
              type="button"
              onClick={() => toggleView('card')}
              className={[
                'p-1.5 rounded-md transition-colors',
                viewMode === 'card'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
              ].join(' ')}
              title="Karta ko'rinishi"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        viewMode === 'card' ? <SkeletonCards /> : <SkeletonRows />
      ) : drivers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <EmptyState
            icon={Users}
            title="Haydovchilar topilmadi"
            description="Yangi haydovchi qo'shish uchun quyidagi tugmani bosing"
            action={() => setShowForm(true)}
            actionLabel="Yangi haydovchi"
          />
        </div>
      ) : viewMode === 'card' ? (
        /* ── Card grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {drivers.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onClick={() => navigate(`/dashboard/drivers/${driver.id}`)}
            />
          ))}
        </div>
      ) : (
        /* ── Table ── */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-10">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Haydovchi</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Telefon</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Balans</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ulush</th>
                  <th className="w-8 px-2" />
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver, idx) => {
                  const statusInfo = DRIVER_STATUSES.find((s) => s.value === driver.status);
                  const grad       = gradient(driver.fullName);
                  const ini        = initials(driver.fullName || driver.username);
                  const balance    = parseFloat(driver.currentBalance) || 0;

                  return (
                    <tr
                      key={driver.id}
                      onClick={() => navigate(`/dashboard/drivers/${driver.id}`)}
                      className="group border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-primary-50/40 dark:hover:bg-primary-900/10 cursor-pointer transition-colors duration-100"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 tabular-nums">{idx + 1}</td>

                      {/* Avatar + name + username */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={['w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-sm', grad].join(' ')}>
                            <span className="text-xs font-bold text-white leading-none">{ini}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight">{driver.fullName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">@{driver.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3">
                        {driver.phone ? (
                          <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            {driver.phone}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge status={driver.status} label={statusInfo?.label} dot size="xs" />
                      </td>

                      {/* Balance */}
                      <td className="px-4 py-3 text-right">
                        <span className={[
                          'text-xs font-bold tabular-nums',
                          balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                        ].join(' ')}>
                          {formatMoney(driver.currentBalance, 'UZS', true)}
                        </span>
                      </td>

                      {/* Payment type */}
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <Banknote size={12} className="text-slate-400" />
                          {driver.paymentType === 'per_trip' ? `${driver.perTripRate}%` : 'Oylik'}
                        </span>
                      </td>

                      {/* Arrow */}
                      <td className="px-2 py-3">
                        <ChevronRight size={15} className="text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors duration-100" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Form modal ── */}
      <DriverForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); fetchDrivers(); }}
      />
    </div>
  );
};

export default Drivers;
