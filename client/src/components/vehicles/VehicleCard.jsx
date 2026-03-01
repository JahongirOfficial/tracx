/**
 * VehicleCard — modern vehicle summary card with oil-change warning indicator.
 *
 * Features:
 *   - Plate number prominently displayed in a mono-font badge.
 *   - Brand / model / year subtitle.
 *   - Status badge (excellent / normal / attention / critical).
 *   - Colored left accent border when oil change is critical (orange/red).
 *   - Odometer reading with gauge icon.
 *   - Oil change status row (good vs. needs oil).
 *   - Flight count in footer.
 *   - Hover: card lifts with shadow and translateY.
 *   - Click: navigate to vehicle detail page.
 *
 * Props:
 *   vehicle – vehicle object from the store / API
 */

import { useNavigate } from 'react-router-dom';
import { Gauge, AlertTriangle, CheckCircle, Truck, ArrowUpRight } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatOdometer } from '../../utils/formatters';
import { VEHICLE_STATUSES } from '../../utils/constants';

const VehicleCard = ({ vehicle }) => {
  const navigate = useNavigate();
  const statusInfo = VEHICLE_STATUSES.find((s) => s.value === vehicle.status);

  /* Determine if oil change is overdue */
  const kmSinceLastOil = (vehicle.currentOdometer || 0) - (vehicle.lastOilChangeKm || 0);
  const interval = vehicle.oilChangeIntervalKm || 10000;
  const oilPct = Math.min(kmSinceLastOil / interval, 1); // 0 → 1
  const needsOilChange =
    vehicle.needsOilChange || kmSinceLastOil >= interval;
  const oilWarning = !needsOilChange && oilPct >= 0.8; // within 20% of due

  /* Left accent border color based on oil status */
  const accentBorder = needsOilChange
    ? 'border-l-4 border-l-red-500'
    : oilWarning
    ? 'border-l-4 border-l-amber-500'
    : '';

  return (
    <div
      onClick={() => navigate(`/dashboard/vehicles/${vehicle.id}`)}
      className={[
        /* Card surface */
        'bg-white dark:bg-slate-900',
        'rounded-2xl border border-slate-200/80 dark:border-slate-800',
        'shadow-card',
        /* Oil-change accent border */
        accentBorder,
        /* Hover lift */
        'group cursor-pointer',
        'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-800/50',
        'active:translate-y-0 active:shadow-card',
        'transition-all duration-200 ease-in-out',
        'p-5',
      ].join(' ')}
    >
      {/* ── Top row: truck icon + plate + status ── */}
      <div className="flex items-start gap-3 mb-4">
        {/* Truck icon block */}
        <div
          className={[
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
            needsOilChange
              ? 'bg-red-100 dark:bg-red-900/20'
              : oilWarning
              ? 'bg-amber-100 dark:bg-amber-900/20'
              : 'bg-slate-100 dark:bg-slate-800',
          ].join(' ')}
        >
          <Truck
            size={20}
            className={
              needsOilChange
                ? 'text-red-600 dark:text-red-400'
                : oilWarning
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-500 dark:text-slate-400'
            }
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Plate number — prominent mono badge */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className={[
                'inline-block font-mono font-bold text-[13px] tracking-widest',
                'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900',
                'px-3 py-1 rounded-lg shadow-sm',
              ].join(' ')}
            >
              {vehicle.plateNumber}
            </span>
          </div>

          {/* Brand / model / year */}
          {vehicle.brand && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {vehicle.brand} {vehicle.model}
              {vehicle.year ? ` · ${vehicle.year}` : ''}
              {vehicle.color ? ` · ${vehicle.color}` : ''}
            </p>
          )}
        </div>

        {/* Status badge + arrow */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge status={vehicle.status} label={statusInfo?.label} dot />
          <ArrowUpRight
            size={14}
            className="text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          />
        </div>
      </div>

      {/* ── Odometer ── */}
      <div
        className={[
          'flex items-center gap-2 py-2.5 px-3 rounded-xl mb-3',
          'bg-slate-50 dark:bg-slate-800/50',
        ].join(' ')}
      >
        <Gauge size={15} className="text-slate-400 shrink-0" />
        <span className="text-xs text-slate-500 dark:text-slate-400">Speedometr</span>
        <span className="ml-auto text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
          {formatOdometer(vehicle.currentOdometer)}
        </span>
      </div>

      {/* ── Oil change status ── */}
      <div
        className={[
          'flex items-center gap-2 py-2.5 px-3 rounded-xl',
          needsOilChange
            ? 'bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30'
            : oilWarning
            ? 'bg-amber-50 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-900/30'
            : 'bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-900/30',
        ].join(' ')}
      >
        {needsOilChange ? (
          <>
            <AlertTriangle size={14} className="text-red-500 shrink-0" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">
              Moy almashtirish kerak!
            </span>
            <span className="ml-auto text-xs text-red-500 tabular-nums">
              +{formatOdometer(kmSinceLastOil - interval)}
            </span>
          </>
        ) : oilWarning ? (
          <>
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Moy yaqinda kerak
            </span>
            <span className="ml-auto text-xs text-amber-500 tabular-nums">
              {formatOdometer(interval - kmSinceLastOil)} qoldi
            </span>
          </>
        ) : (
          <>
            <CheckCircle size={14} className="text-emerald-500 shrink-0" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Moy yaxshi
            </span>
            <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-500 tabular-nums">
              {formatOdometer(interval - kmSinceLastOil)} qoldi
            </span>
          </>
        )}
      </div>

      {/* ── Footer: flight count ── */}
      {vehicle._count?.flights !== undefined && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {vehicle._count.flights} ta reys bajarilgan
        </p>
      )}
    </div>
  );
};

export default VehicleCard;
