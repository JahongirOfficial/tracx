/**
 * FlightCard — modern flight summary card with hover lift effect.
 *
 * Props:
 *   flight   – flight object from the store / API
 *   onClick  – optional override; defaults to navigate to flight detail
 *
 * Sections:
 *   Top row   — driver name + vehicle info on left, status badge on right.
 *   Finance   — income (green chip), expenses (red chip), profit (blue chip).
 *   Footer    — payment status badge + created date + leg/expense counters.
 *
 * Interaction:
 *   Hover → card lifts (shadow + -2px translateY) via Tailwind group classes.
 *   Click → navigate to /dashboard/flights/:id.
 */

import { useNavigate } from 'react-router-dom';
import { User, Truck, Calendar, Package, Receipt, ArrowUpRight } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatMoney, formatDate } from '../../utils/formatters';
import { FLIGHT_STATUSES, PAYMENT_STATUSES } from '../../utils/constants';

/* Small colored financial chip — more spacious padding, tighter label tracking */
const FinanceChip = ({ label, value, variant }) => {
  const styles = {
    income: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    expense: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    profit: {
      positive: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
      negative: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    },
  };

  const cls =
    variant === 'profit'
      ? parseFloat(value) >= 0
        ? styles.profit.positive
        : styles.profit.negative
      : styles[variant];

  return (
    <div className={['rounded-xl px-3 py-2.5', cls].join(' ')}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-bold leading-tight tabular-nums">
        {formatMoney(value, 'UZS', true)}
      </p>
    </div>
  );
};

const FlightCard = ({ flight, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(flight);
    } else {
      navigate(`/dashboard/flights/${flight.id}`);
    }
  };

  const statusInfo = FLIGHT_STATUSES.find((s) => s.value === flight.status);
  const paymentInfo = PAYMENT_STATUSES.find((s) => s.value === flight.paymentStatus);

  return (
    <div
      onClick={handleClick}
      className={[
        /* Base card surface */
        'bg-white dark:bg-slate-900',
        'rounded-2xl border border-slate-200/80 dark:border-slate-800',
        'shadow-card',
        /* Colored left accent border for active flights */
        flight.status === 'active' ? 'border-l-[3px] border-l-primary-500' : '',
        /* Hover lift */
        'group cursor-pointer',
        'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-800/50',
        'active:translate-y-0 active:shadow-card',
        'transition-all duration-200 ease-in-out',
        'p-5',
      ].join(' ')}
    >
      {/* ── Top row: driver + vehicle info / status badge ── */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          {/* Driver name */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <User size={12} className="text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {flight.driver?.fullName || '—'}
            </span>
          </div>

          {/* Vehicle info */}
          <div className="flex items-center gap-2">
            <Truck size={13} className="text-slate-400 shrink-0" />
            <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
              {flight.vehicle?.plateNumber || '—'}
            </span>
            {flight.vehicle?.brand && (
              <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                · {flight.vehicle.brand} {flight.vehicle.model}
              </span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <Badge
          status={flight.status}
          label={statusInfo?.label}
          color={statusInfo?.color}
          dot
        />
      </div>

      {/* ── Financial summary chips ── */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <FinanceChip label="Daromad" value={flight.totalIncome} variant="income" />
        <FinanceChip label="Xarajat" value={flight.lightExpenses} variant="expense" />
        <FinanceChip label="Foyda" value={flight.netProfit} variant="profit" />
      </div>

      {/* ── Footer row ── */}
      <div
        className={[
          'flex items-center justify-between',
          'pt-3 border-t border-slate-100 dark:border-slate-800',
        ].join(' ')}
      >
        {/* Left: payment status + date */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            status={flight.paymentStatus}
            label={paymentInfo?.label}
            size="xs"
          />
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Calendar size={11} />
            {formatDate(flight.startedAt, true)}
          </span>
        </div>

        {/* Right: counters + arrow */}
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1 text-xs">
            <Package size={11} />
            {flight._count?.legs ?? 0}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Receipt size={11} />
            {flight._count?.expenses ?? 0}
          </span>
          <ArrowUpRight
            size={15}
            className="text-primary-400 dark:text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150 -mr-0.5"
          />
        </div>
      </div>
    </div>
  );
};

export default FlightCard;
