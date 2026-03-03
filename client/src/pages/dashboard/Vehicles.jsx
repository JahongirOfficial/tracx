import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Truck, CheckCircle, AlertTriangle, Clock,
  Gauge, AlertCircle, ChevronRight, Search, X, SlidersHorizontal,
  LayoutList, LayoutGrid,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import VehicleForm from '../../components/vehicles/VehicleForm';
import EmptyState from '../../components/ui/EmptyState';
import { formatOdometer } from '../../utils/formatters';
import { VEHICLE_STATUSES } from '../../utils/constants';
import useVehicleStore from '../../stores/vehicleStore';

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
      <div key={i} className={['h-[56px] skeleton-shimmer', i !== 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''].join(' ')} />
    ))}
  </div>
);

/* ── Skeleton cards ── */
const SkeletonCards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="h-[110px] skeleton-shimmer" />
      </div>
    ))}
  </div>
);

/* ── Vehicle card (grid view) ── */
const VehicleCard = ({ vehicle }) => {
  const navigate = useNavigate();
  const statusInfo = VEHICLE_STATUSES.find((s) => s.value === vehicle.status);

  return (
    <div
      onClick={() => navigate(`/dashboard/vehicles/${vehicle.id}`)}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-150 p-4"
    >
      {/* Plate + brand */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="font-mono text-xs font-bold bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 px-2 py-0.5 rounded tracking-widest">
            {vehicle.plateNumber}
          </span>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1.5 leading-tight">
            {vehicle.brand || '—'} {vehicle.model || ''}
          </p>
          {(vehicle.year || vehicle.color) && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              {[vehicle.year, vehicle.color].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <Badge status={vehicle.status} label={statusInfo?.label} dot size="xs" />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mt-2">
        <OilCell vehicle={vehicle} />
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
          <Gauge size={12} className="text-slate-400" />
          {formatOdometer(vehicle.currentOdometer)}
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          {vehicle._count?.flights ?? 0} reys
        </span>
      </div>
    </div>
  );
};

/* ── Oil status helper ── */
const OilCell = ({ vehicle }) => {
  const kmSince  = (vehicle.currentOdometer || 0) - (vehicle.lastOilChangeKm || 0);
  const interval = vehicle.oilChangeIntervalKm || 10000;
  const pct      = Math.min(kmSince / interval, 1);
  const overdue  = vehicle.needsOilChange || kmSince >= interval;
  const warning  = !overdue && pct >= 0.8;

  if (overdue) return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/15 px-2 py-0.5 rounded-full">
      <AlertCircle size={11} /> Kerak!
    </span>
  );
  if (warning) return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/15 px-2 py-0.5 rounded-full">
      <AlertTriangle size={11} /> Yaqinlashdi
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/15 px-2 py-0.5 rounded-full">
      <CheckCircle size={11} /> Yaxshi
    </span>
  );
};

const STATUS_OPTIONS = [
  { value: 'excellent',   label: "A'lo",          activeCls: 'bg-emerald-600 border-emerald-600 text-white' },
  { value: 'normal',      label: 'Normal',         activeCls: 'bg-blue-600 border-blue-600 text-white' },
  { value: 'attention',   label: "E'tibor kerak",  activeCls: 'bg-amber-500 border-amber-500 text-white' },
  { value: 'critical',    label: 'Kritik',         activeCls: 'bg-red-600 border-red-600 text-white' },
];
const INACTIVE_PILL = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300';

/* ── Main component ── */
const Vehicles = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm]   = useState(false);
  const [status, setStatus]       = useState('');
  const [search, setSearch]       = useState('');
  const [viewMode, setViewMode]   = useState(() => localStorage.getItem('vehicles_view') || 'table');

  const { vehicles, meta, loading, fetchVehicles } = useVehicleStore();

  useEffect(() => {
    const params = {};
    if (status) params.status = status;
    if (search) params.search = search;
    fetchVehicles(params);
  }, [status, search]);

  const reset      = () => { setStatus(''); setSearch(''); };
  const hasFilters = status || search;
  const setView    = (mode) => { setViewMode(mode); localStorage.setItem('vehicles_view', mode); };

  /* Counts */
  const excellentCount = vehicles.filter((v) => v.status === 'excellent').length;
  const normalCount    = vehicles.filter((v) => v.status === 'normal').length;
  const attnCount      = vehicles.filter((v) => v.status === 'attention' || v.status === 'critical').length;
  const oilDueCount    = vehicles.filter((v) => {
    const km = (v.currentOdometer || 0) - (v.lastOilChangeKm || 0);
    return v.needsOilChange || km >= (v.oilChangeIntervalKm || 10000);
  }).length;

  return (
    <div className="page-enter space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            Mashinalar
            {meta?.total ? (
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg tabular-nums">
                {meta.total}
              </span>
            ) : null}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Avtomobil parki boshqaruvi</p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm(true)} className="sm:self-start">
          Yangi mashina
        </Button>
      </div>

      {/* ── Quick stats ── */}
      {!loading && vehicles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickStat label="Jami"        value={meta?.total || vehicles.length} icon={Truck}         colorCls="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" />
          <QuickStat label="A'lo / Normal" value={excellentCount + normalCount} icon={CheckCircle}   colorCls="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" />
          <QuickStat label="E'tibor"     value={attnCount}                      icon={AlertTriangle}  colorCls="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" />
          <QuickStat label="Moy kerak"   value={oilDueCount}                    icon={Clock}          colorCls="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" />
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
                  'px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150',
                  status === opt.value ? opt.activeCls : INACTIVE_PILL,
                ].join(' ')}
              >
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
              placeholder="Plaka, brend..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 w-40"
            />
          </div>

          {hasFilters && (
            <button type="button" onClick={reset} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors">
              <X size={11} /> Tozalash
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => setView('table')}
              title="Jadval ko'rinishi"
              className={['px-2 py-1.5 transition-colors', viewMode === 'table' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'].join(' ')}
            >
              <LayoutList size={14} />
            </button>
            <button
              type="button"
              onClick={() => setView('card')}
              title="Karta ko'rinishi"
              className={['px-2 py-1.5 transition-colors', viewMode === 'card' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'].join(' ')}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        viewMode === 'card' ? <SkeletonCards /> : <SkeletonRows />
      ) : vehicles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <EmptyState
            icon={Truck}
            title="Mashinalar topilmadi"
            description="Yangi mashina qo'shish uchun quyidagi tugmani bosing"
            action={() => setShowForm(true)}
            actionLabel="Yangi mashina"
          />
        </div>
      ) : viewMode === 'card' ? (
        /* ── Card grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        /* ── Table ── */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-10">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Plaka</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Brend / Model</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Moy holati</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Odometr</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Reyslar</th>
                  <th className="w-8 px-2" />
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle, idx) => {
                  const statusInfo = VEHICLE_STATUSES.find((s) => s.value === vehicle.status);

                  return (
                    <tr
                      key={vehicle.id}
                      onClick={() => navigate(`/dashboard/vehicles/${vehicle.id}`)}
                      className="group border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-primary-50/40 dark:hover:bg-primary-900/10 cursor-pointer transition-colors duration-100"
                    >
                      <td className="px-4 py-3.5 text-xs text-slate-400 dark:text-slate-500 tabular-nums">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] font-bold bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 px-2.5 py-1 rounded tracking-widest">
                          {vehicle.plateNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                            {vehicle.brand || '—'} {vehicle.model || ''}
                          </p>
                          {(vehicle.year || vehicle.color) && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {[vehicle.year, vehicle.color].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge status={vehicle.status} label={statusInfo?.label} dot size="xs" />
                      </td>
                      <td className="px-4 py-3.5">
                        <OilCell vehicle={vehicle} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="flex items-center justify-end gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                          <Gauge size={12} className="text-slate-400" />
                          {formatOdometer(vehicle.currentOdometer)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {vehicle._count?.flights ?? '—'}
                      </td>
                      <td className="px-2 py-3.5">
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
      <VehicleForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); fetchVehicles(); }}
      />
    </div>
  );
};

export default Vehicles;
