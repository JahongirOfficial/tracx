/**
 * Badge — status pill with optional leading dot indicator.
 *
 * Props:
 *   status  – semantic key ('active' | 'completed' | 'cancelled' | 'free' | 'busy' |
 *             'offline' | 'pending' | 'partial' | 'paid' | 'in_progress' |
 *             'excellent' | 'normal' | 'attention' | 'critical' | 'trial' | 'basic' | 'pro')
 *   label   – override display text (falls back to status)
 *   color   – direct color key override: 'blue' | 'green' | 'red' | 'orange' |
 *             'yellow' | 'gray' | 'purple' | 'teal' | 'pink'
 *   size    – 'xs' | 'sm'
 *   dot     – show a pulsing/static dot indicator before the text
 */

/* ── Color palette ── */
const colorMap = {
  blue: {
    wrap: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  green: {
    wrap: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    dot: 'bg-green-500',
  },
  red: {
    wrap: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    dot: 'bg-red-500',
  },
  orange: {
    wrap: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  yellow: {
    wrap: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  gray: {
    wrap: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  purple: {
    wrap: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
    dot: 'bg-purple-500',
  },
  teal: {
    wrap: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
    dot: 'bg-teal-500',
  },
  pink: {
    wrap: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
    dot: 'bg-pink-500',
  },
};

/* ── Semantic status → color mapping ── */
const statusColorMap = {
  /* Flight */
  active: 'blue',
  completed: 'green',
  cancelled: 'red',
  /* Driver */
  free: 'green',
  busy: 'orange',
  offline: 'gray',
  /* Payment */
  pending: 'red',
  partial: 'orange',
  paid: 'green',
  /* Leg / trip */
  in_progress: 'blue',
  /* Vehicle condition */
  excellent: 'green',
  normal: 'blue',
  attention: 'orange',
  critical: 'red',
  /* Subscription */
  trial: 'yellow',
  basic: 'blue',
  pro: 'purple',
};

/* ── Size classes ── */
const sizeMap = {
  xs: 'px-2 py-0.5 text-xs gap-1',
  sm: 'px-2.5 py-1 text-xs gap-1.5',
};

/* ── Dot size ── */
const dotSizeMap = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
};

const Badge = ({ status, label, color, size = 'sm', dot = false }) => {
  const resolvedColor = color || statusColorMap[status] || 'gray';
  const colors = colorMap[resolvedColor] ?? colorMap.gray;
  const displayText = label || status || '';

  return (
    <span
      className={[
        'inline-flex items-center font-medium rounded-full',
        'whitespace-nowrap',
        sizeMap[size] ?? sizeMap.sm,
        colors.wrap,
      ].join(' ')}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={[
            'rounded-full flex-shrink-0',
            dotSizeMap[size] ?? dotSizeMap.sm,
            colors.dot,
          ].join(' ')}
        />
      )}
      {displayText}
    </span>
  );
};

export default Badge;
