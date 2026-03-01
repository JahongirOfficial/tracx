/**
 * FlightFilters — compact filter toolbar for the flights list page.
 *
 * Filters:
 *   status   — active / completed / cancelled
 *   driverId — loaded from API
 *   vehicleId — loaded from API
 *   dateFrom / dateTo — date range pickers
 *
 * When any filter is active a "Tozalash" chip appears to reset all filters.
 *
 * Props:
 *   filters  – current filter values object
 *   onChange – callback receiving new filter values object
 */

import { useState, useEffect } from 'react';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { X, SlidersHorizontal } from 'lucide-react';
import api from '../../services/api';

/* Filter status options */
const STATUS_OPTIONS = [
  { value: 'active', label: 'Faol' },
  { value: 'completed', label: 'Yakunlangan' },
  { value: 'cancelled', label: 'Bekor qilingan' },
];

/* Pill-style status toggle button */
const StatusPill = ({ value, label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap',
      'transition-all duration-150',
      active
        ? value === 'active'
          ? 'bg-blue-600 border-blue-600 text-white'
          : value === 'completed'
          ? 'bg-emerald-600 border-emerald-600 text-white'
          : 'bg-red-600 border-red-600 text-white'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600',
    ].join(' ')}
  >
    {label}
  </button>
);

const FlightFilters = ({ filters, onChange }) => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  /* Fetch drivers + vehicles for dropdowns */
  useEffect(() => {
    api.get('/drivers', { params: { limit: 100 } }).then((r) => setDrivers(r.data || []));
    api.get('/vehicles', { params: { limit: 100 } }).then((r) => setVehicles(r.data || []));
  }, []);

  const set = (k, v) => onChange({ ...filters, [k]: v });

  const reset = () =>
    onChange({ status: '', driverId: '', vehicleId: '', dateFrom: '', dateTo: '' });

  const hasFilters =
    filters.status ||
    filters.driverId ||
    filters.vehicleId ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div
      className={[
        'bg-white dark:bg-slate-900',
        'rounded-2xl border border-slate-200/80 dark:border-slate-800',
        'shadow-card',
        'p-4',
      ].join(' ')}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={15} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filtrlar</span>
        {hasFilters && (
          <button
            type="button"
            onClick={reset}
            className={[
              'ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
              'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
              'border border-red-100 dark:border-red-800/40',
              'hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150',
            ].join(' ')}
          >
            <X size={11} />
            Tozalash
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* Status pill row */}
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <StatusPill
                key={opt.value}
                value={opt.value}
                label={opt.label}
                active={filters.status === opt.value}
                onClick={() =>
                  set('status', filters.status === opt.value ? '' : opt.value)
                }
              />
            ))}
          </div>
        </div>

        {/* Second row: driver + vehicle dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Haydovchi"
            value={filters.driverId || ''}
            onChange={(e) => set('driverId', e.target.value)}
            placeholder="Barchasi"
            options={drivers.map((d) => ({ value: d.id, label: d.fullName }))}
          />
          <Select
            label="Mashina"
            value={filters.vehicleId || ''}
            onChange={(e) => set('vehicleId', e.target.value)}
            placeholder="Barchasi"
            options={vehicles.map((v) => ({ value: v.id, label: v.plateNumber }))}
          />
        </div>

        {/* Third row: date range */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Sana (dan)"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => set('dateFrom', e.target.value)}
          />
          <Input
            label="Sana (gacha)"
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => set('dateTo', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default FlightFilters;
