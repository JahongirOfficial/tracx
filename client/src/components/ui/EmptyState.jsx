/**
 * EmptyState — beautiful empty state with gradient icon container and subtle pattern.
 *
 * Props:
 *   title       – heading text
 *   description – subtext
 *   icon        – Lucide icon component (default: Package)
 *   action      – onClick callback for the action button
 *   actionLabel – button label text
 *   compact     – reduced padding for use inside cards/tables
 */

import { Package } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  title,
  description,
  icon: Icon = Package,
  action,
  actionLabel,
  compact = false,
}) => {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-10 px-4' : 'py-16 px-6',
      ].join(' ')}
    >
      {/* Gradient icon container with subtle radial glow */}
      <div className="relative mb-5">
        {/* Outer glow ring */}
        <div
          aria-hidden="true"
          className={[
            'absolute inset-0 rounded-2xl',
            'bg-gradient-to-br from-primary-400/20 to-primary-600/10',
            'dark:from-primary-500/20 dark:to-primary-700/10',
            'blur-xl scale-125',
          ].join(' ')}
        />

        {/* Icon wrapper */}
        <div
          className={[
            'relative flex items-center justify-center',
            compact ? 'w-14 h-14 rounded-xl' : 'w-16 h-16 rounded-2xl',
            'bg-gradient-to-br from-primary-50 to-primary-100',
            'dark:from-primary-900/40 dark:to-primary-800/30',
            'border border-primary-200/60 dark:border-primary-700/40',
            'shadow-sm',
          ].join(' ')}
        >
          <Icon
            size={compact ? 24 : 28}
            className="text-primary-500 dark:text-primary-400"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Heading */}
      <h3
        className={[
          'font-semibold text-slate-800 dark:text-slate-200',
          compact ? 'text-sm mb-1' : 'text-base mb-1.5',
        ].join(' ')}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={[
            'text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed',
            compact ? 'text-xs mb-4' : 'text-sm mb-5',
          ].join(' ')}
        >
          {description}
        </p>
      )}

      {/* Action button */}
      {action && actionLabel && (
        <Button onClick={action} size={compact ? 'sm' : 'md'}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
