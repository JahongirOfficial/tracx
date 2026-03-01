/**
 * DriverFilters — compact filter toolbar for the drivers list page.
 *
 * Filters:
 *   status  — free / busy / offline (pill toggle buttons)
 *   search  — free-text search by name / username
 *
 * Props:
 *   filters  – current filter values object
 *   onChange – callback receiving updated filter values
 */

import { SlidersHorizontal, Search, X } from 'lucide-react';
import Input from '../ui/Input';

/* Status pill config */
const STATUS_OPTIONS = [
  { value: 'free', label: "Bo'sh", active: 'bg-emerald-600 border-emerald-600 text-white', dot: 'bg-emerald-400' },
  { value: 'busy', label: 'Band', active: 'bg-amber-500 border-amber-500 text-white', dot: 'bg-amber-400' },
  { value: 'offline', label: 'Offline', active: 'bg-slate-500 border-slate-500 text-white', dot: 'bg-slate-400' },
];

const DriverFilters = ({ filters, onChange }) => {
  const set = (k, v) => onChange({ ...filters, [k]: v });

  const reset = () => onChange({ status: '', search: '' });

  const hasFilters = filters.status || filters.search;

  return (
    <div
      className={[
        'bg-white dark:bg-slate-900',
        'rounded-2xl border border-slate-200/80 dark:border-slate-800',
        'shadow-card',
        'p-4',
      ].join(' ')}
    >
      {/* Header */}
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
            {STATUS_OPTIONS.map((opt) => {
              const isActive = filters.status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('status', isActive ? '' : opt.value)}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border',
                    'transition-all duration-150',
                    isActive
                      ? opt.active
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600',
                  ].join(' ')}
                >
                  {/* Status dot */}
                  <span
                    className={[
                      'w-1.5 h-1.5 rounded-full',
                      isActive ? 'bg-white/80' : opt.dot,
                    ].join(' ')}
                  />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search input */}
        <Input
          label="Qidirish"
          leftIcon={Search}
          value={filters.search || ''}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Ism, foydalanuvchi nomi..."
        />
      </div>
    </div>
  );
};

export default DriverFilters;
