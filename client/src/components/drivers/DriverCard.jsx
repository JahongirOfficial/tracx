/**
 * DriverCard — modern driver summary card with gradient avatar and hover lift.
 *
 * Features:
 *   - Avatar circle with gradient background derived from driver name initials.
 *   - Status badge (free / busy / offline) with colored dot.
 *   - Balance display (green if positive, red if negative).
 *   - Phone number row.
 *   - Payment type + rate in footer.
 *   - Hover: card lifts with shadow and translateY.
 *   - Click: navigate to driver detail page.
 *
 * Props:
 *   driver – driver object from the store / API
 */

import { useNavigate } from 'react-router-dom';
import { Phone, ArrowUpRight, Banknote, PercentCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatMoney } from '../../utils/formatters';
import { DRIVER_STATUSES } from '../../utils/constants';

/* Deterministic gradient palette based on first char of name */
const AVATAR_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-600',
  'from-teal-500 to-green-600',
  'from-fuchsia-500 to-purple-600',
];

const getAvatarGradient = (name = '') => {
  const code = (name.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[code];
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

const DriverCard = ({ driver }) => {
  const navigate = useNavigate();
  const statusInfo = DRIVER_STATUSES.find((s) => s.value === driver.status);
  const gradient = getAvatarGradient(driver.fullName);
  const initials = getInitials(driver.fullName || driver.username);
  const balanceNum = parseFloat(driver.currentBalance) || 0;

  return (
    <div
      onClick={() => navigate(`/dashboard/drivers/${driver.id}`)}
      className={[
        /* Card surface */
        'bg-white dark:bg-slate-900',
        'rounded-2xl border border-slate-200/80 dark:border-slate-800',
        'shadow-card',
        /* Hover lift */
        'group cursor-pointer',
        'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-800/50',
        'active:translate-y-0 active:shadow-card',
        'transition-all duration-200 ease-in-out',
        'p-5',
      ].join(' ')}
    >
      {/* ── Top row: avatar + name + status ── */}
      <div className="flex items-start gap-3 mb-4">
        {/* Gradient avatar */}
        <div
          className={[
            'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0',
            'bg-gradient-to-br shadow-md',
            gradient,
          ].join(' ')}
        >
          <span className="text-sm font-bold text-white leading-none">{initials}</span>
        </div>

        {/* Name + username */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
            {driver.fullName}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
            @{driver.username}
          </p>
        </div>

        {/* Status badge + arrow */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge status={driver.status} label={statusInfo?.label} dot />
          <ArrowUpRight
            size={13}
            className="text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          />
        </div>
      </div>

      {/* ── Phone number ── */}
      {driver.phone && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <Phone size={12} className="text-slate-500 dark:text-slate-400" />
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {driver.phone}
          </span>
        </div>
      )}

      {/* ── Footer: balance + payment type ── */}
      <div
        className={[
          'flex items-center justify-between pt-3',
          'border-t border-slate-100 dark:border-slate-800',
        ].join(' ')}
      >
        {/* Balance */}
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5 flex items-center gap-1">
            <Banknote size={11} />
            Balans
          </p>
          <p
            className={[
              'text-sm font-bold tabular-nums',
              balanceNum >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400',
            ].join(' ')}
          >
            {formatMoney(driver.currentBalance, 'UZS', true)}
          </p>
        </div>

        {/* Payment type */}
        <div className="text-right">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5 flex items-center justify-end gap-1">
            <PercentCircle size={11} />
            Ulush
          </p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {driver.paymentType === 'per_trip'
              ? `${driver.perTripRate}%`
              : 'Oylik'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;
