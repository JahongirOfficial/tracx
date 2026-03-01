import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Plane, User, Clock, CheckCircle, AlertCircle,
  ChevronRight, SlidersHorizontal, X,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import FlightForm from '../../components/flights/FlightForm';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney, formatDate } from '../../utils/formatters';
import { FLIGHT_STATUSES, PAYMENT_STATUSES } from '../../utils/constants';
import useFlightStore from '../../stores/flightStore';
import api from '../../services/api';

/* ── Compact top-stat card ───────────────────────────────────────── */
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

/* ── Status pill toggle ──────────────────────────────────────────── */
const STATUS_OPTIONS = [
  { value: 'active',    label: 'Faol',           activeCls: 'bg-blue-600 border-blue-600 text-white' },
  { value: 'completed', label: 'Yakunlangan',    activeCls: 'bg-emerald-600 border-emerald-600 text-white' },
  { value: 'cancelled', label: 'Bekor qilingan', activeCls: 'bg-red-600 border-red-600 text-white' },
];

const INACTIVE_PILL =
  'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300';

/* ── Skeleton loading rows ───────────────────────────────────────── */
const SkeletonRows = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
    {[...Array(7)].map((_, i) => (
      <div
        key={i}
        className={[
          'h-[52px] skeleton-shimmer',
          i !== 0 ? 'border-t border-slate-100 dark:border-slate-800' : '',
        ].join(' ')}
      />
    ))}
  </div>
);

/* ── Main component ──────────────────────────────────────────────── */
const Flights = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    status: '', driverId: '', vehicleId: '', dateFrom: '', dateTo: '',
  });
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const { flights, meta, loading, fetchFlights } = useFlightStore();

  /* Load driver + vehicle options for filter dropdowns */
  useEffect(() => {
    api.get('/drivers',  { params: { limit: 100 } }).then((r) => setDrivers(r.data  || []));
    api.get('/vehicles', { params: { limit: 100 } }).then((r) => setVehicles(r.data || []));
  }, []);

  /* Re-fetch whenever filters change */
  useEffect(() => {
    const p = {};
    if (filters.status)    p.status    = filters.status;
    if (filters.driverId)  p.driverId  = filters.driverId;
    if (filters.vehicleId) p.vehicleId = filters.vehicleId;
    if (filters.dateFrom)  p.dateFrom  = filters.dateFrom;
    if (filters.dateTo)    p.dateTo    = filters.dateTo;
    fetchFlights(p);
  }, [filters]);

  const set   = (k, v) => setFilters((prev) => ({ ...prev, [k]: v }));
  const reset = () => setFilters({ status: '', driverId: '', vehicleId: '', dateFrom: '', dateTo: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  /* Derived counts */
  const activeCount    = flights.filter((f) => f.status === 'active').length;
  const completedCount = flights.filter((f) => f.status === 'completed').length;
  const unpaidCount    = flights.filter((f) => f.paymentStatus === 'pending').length;

  return (
    <div className="page-enter space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            Reyslar
            {meta?.total ? (
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg tabular-nums">
                {meta.total}
              </span>
            ) : null}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Barcha reyslar va ularning holati
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm(true)} className="sm:self-start">
          Yangi reys
        </Button>
      </div>

      {/* ── Quick stats ── */}
      {!loading && flights.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickStat label="Jami reyslar"  value={meta?.total || flights.length} icon={Plane}        colorCls="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" />
          <QuickStat label="Faol"           value={activeCount}                   icon={Clock}        colorCls="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" />
          <QuickStat label="Yakunlangan"    value={completedCount}                icon={CheckCircle}  colorCls="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" />
          <QuickStat label="To'lanmagan"    value={unpaidCount}                   icon={AlertCircle}  colorCls="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" />
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Top row */}
        <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
          <SlidersHorizontal size={13} className="text-slate-400 shrink-0" />

          {/* Status pills */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('status', filters.status === opt.value ? '' : opt.value)}
                className={[
                  'px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150',
                  filters.status === opt.value ? opt.activeCls : INACTIVE_PILL,
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
              >
                <X size={11} /> Tozalash
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              {showAdvanced ? 'Yig\'ish ▲' : 'Batafsil ▼'}
            </button>
          </div>
        </div>

        {/* Advanced filter row */}
        {showAdvanced && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Driver */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Haydovchi</label>
              <select
                value={filters.driverId}
                onChange={(e) => set('driverId', e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">Barchasi</option>
                {drivers.map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
              </select>
            </div>

            {/* Vehicle */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Mashina</label>
              <select
                value={filters.vehicleId}
                onChange={(e) => set('vehicleId', e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">Barchasi</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plateNumber}</option>)}
              </select>
            </div>

            {/* Date from */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Sana (dan)</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => set('dateFrom', e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            {/* Date to */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Sana (gacha)</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => set('dateTo', e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <SkeletonRows />
      ) : flights.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <EmptyState
            icon={Plane}
            title="Reyslar topilmadi"
            description="Yangi reys yaratish uchun quyidagi tugmani bosing"
            action={() => setShowForm(true)}
            actionLabel="Yangi reys"
          />
        </div>
      ) : (
        /* ── Table ── */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-10">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Haydovchi</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Mashina</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Daromad</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Xarajat</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Foyda</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">To'lov</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sana</th>
                  <th className="w-8 px-2" />
                </tr>
              </thead>
              <tbody>
                {flights.map((flight, idx) => {
                  const statusInfo  = FLIGHT_STATUSES.find((s) => s.value === flight.status);
                  const paymentInfo = PAYMENT_STATUSES.find((s) => s.value === flight.paymentStatus);
                  const profit      = parseFloat(flight.netProfit || 0);

                  return (
                    <tr
                      key={flight.id}
                      onClick={() => navigate(`/dashboard/flights/${flight.id}`)}
                      className={[
                        'group border-b border-slate-50 dark:border-slate-800/50 last:border-0',
                        'hover:bg-primary-50/40 dark:hover:bg-primary-900/10 cursor-pointer transition-colors duration-100',
                        flight.status === 'active' ? 'border-l-2 border-l-primary-500' : '',
                      ].join(' ')}
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                        {idx + 1}
                      </td>

                      {/* Driver */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                            <User size={13} className="text-primary-600 dark:text-primary-400" />
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-200 text-sm leading-tight">
                            {flight.driver?.fullName || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Vehicle plate */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-[11px] font-bold bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 px-2 py-0.5 rounded tracking-widest">
                          {flight.vehicle?.plateNumber || '—'}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <Badge status={flight.status} label={statusInfo?.label} dot size="xs" />
                      </td>

                      {/* Income */}
                      <td className="px-4 py-3 text-right text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                        {formatMoney(flight.totalIncome, 'UZS', true)}
                      </td>

                      {/* Expenses */}
                      <td className="px-4 py-3 text-right text-xs font-bold text-red-600 dark:text-red-400 tabular-nums whitespace-nowrap">
                        {formatMoney(flight.lightExpenses, 'UZS', true)}
                      </td>

                      {/* Profit */}
                      <td className="px-4 py-3 text-right text-xs font-bold tabular-nums whitespace-nowrap">
                        <span className={profit >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}>
                          {formatMoney(flight.netProfit, 'UZS', true)}
                        </span>
                      </td>

                      {/* Payment status */}
                      <td className="px-4 py-3">
                        <Badge status={flight.paymentStatus} label={paymentInfo?.label} size="xs" />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {formatDate(flight.startedAt, true)}
                      </td>

                      {/* Arrow */}
                      <td className="px-2 py-3">
                        <ChevronRight
                          size={15}
                          className="text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors duration-100"
                        />
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
      <FlightForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          fetchFlights();
        }}
      />
    </div>
  );
};

export default Flights;
