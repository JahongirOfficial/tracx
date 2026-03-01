/**
 * StatCard — KPI metric card with gradient icon, trend indicator and colored accent.
 *
 * Props:
 *   label    – metric label string
 *   value    – metric value (string or number)
 *   icon     – Lucide icon component
 *   color    – 'blue' | 'green' | 'purple' | 'orange'
 *   trend    – number (positive = up, negative = down, undefined = hidden)
 *   onClick  – makes the card interactive
 *   className – extra classes
 */

import { TrendingUp, TrendingDown } from 'lucide-react';

/* Per-color design tokens — modernized with cleaner emerald/red trend colors */
const colorThemes = {
  blue: {
    iconWrap: 'bg-gradient-to-br from-blue-500 to-blue-600',
    iconShadow: 'shadow-blue-500/25',
    value: 'text-blue-700 dark:text-blue-300',
    accent: 'bg-blue-500',
    trendUp: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/25 dark:text-emerald-400',
    trendDown: 'text-red-600 bg-red-50 dark:bg-red-900/25 dark:text-red-400',
  },
  green: {
    iconWrap: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    iconShadow: 'shadow-emerald-500/25',
    value: 'text-emerald-700 dark:text-emerald-300',
    accent: 'bg-emerald-500',
    trendUp: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/25 dark:text-emerald-400',
    trendDown: 'text-red-600 bg-red-50 dark:bg-red-900/25 dark:text-red-400',
  },
  purple: {
    iconWrap: 'bg-gradient-to-br from-violet-500 to-purple-600',
    iconShadow: 'shadow-violet-500/25',
    value: 'text-violet-700 dark:text-violet-300',
    accent: 'bg-violet-500',
    trendUp: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/25 dark:text-emerald-400',
    trendDown: 'text-red-600 bg-red-50 dark:bg-red-900/25 dark:text-red-400',
  },
  orange: {
    iconWrap: 'bg-gradient-to-br from-orange-500 to-amber-500',
    iconShadow: 'shadow-orange-500/25',
    value: 'text-orange-700 dark:text-orange-300',
    accent: 'bg-orange-500',
    trendUp: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/25 dark:text-emerald-400',
    trendDown: 'text-red-600 bg-red-50 dark:bg-red-900/25 dark:text-red-400',
  },
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  onClick,
  className = '',
}) => {
  const theme = colorThemes[color] ?? colorThemes.blue;
  const isClickable = typeof onClick === 'function';
  const hasTrend = trend !== undefined && trend !== null;
  const isUp = hasTrend && trend >= 0;

  return (
    <div
      onClick={onClick}
      className={[
        /* Base surface */
        'relative bg-white dark:bg-slate-900',
        'rounded-2xl border border-slate-100 dark:border-slate-800',
        'shadow-sm overflow-hidden p-5',
        /* Interaction */
        isClickable
          ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* ── Top row: label (left) + icon (right) ── */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none mt-1">
          {label}
        </p>
        {/* Gradient icon container with colored drop-shadow */}
        <div
          aria-hidden="true"
          className={[
            'w-9 h-9 rounded-xl flex items-center justify-center shadow-md shrink-0',
            theme.iconWrap,
            theme.iconShadow,
          ].join(' ')}
        >
          {Icon && <Icon size={17} className="text-white" strokeWidth={2} />}
        </div>
      </div>

      {/* ── Value ── */}
      <p className={['text-2xl font-extrabold leading-none tabular-nums', theme.value].join(' ')}>
        {value}
      </p>

      {/* ── Trend badge ── */}
      {hasTrend && (
        <div className="mt-3">
          <span
            className={[
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
              isUp ? theme.trendUp : theme.trendDown,
            ].join(' ')}
          >
            {isUp ? (
              <TrendingUp size={11} aria-hidden="true" />
            ) : (
              <TrendingDown size={11} aria-hidden="true" />
            )}
            {isUp ? '+' : ''}
            {trend}%
          </span>
        </div>
      )}

      {/* ── Bottom accent line ── */}
      <div
        aria-hidden="true"
        className={['absolute bottom-0 left-0 h-0.5 w-full opacity-50', theme.accent].join(' ')}
      />
    </div>
  );
};

export default StatCard;
