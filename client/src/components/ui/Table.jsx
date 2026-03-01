/**
 * Table — polished data table with sticky header, optional striping,
 * row hover highlight, mobile horizontal scroll, and built-in loading/empty states.
 *
 * Props:
 *   columns      – [{ key, title, render?, className?, cellClassName?, width? }]
 *   data         – array of row objects (each should have a unique `id` field)
 *   loading      – boolean; shows skeleton rows
 *   emptyTitle   – string
 *   emptyDesc    – string
 *   onRowClick   – (row) => void; makes rows clickable
 *   stickyHeader – boolean; makes thead sticky (default true)
 *   striped      – boolean; alternating row background
 *   className    – extra classes on the outer wrapper
 *   skeletonRows – number of skeleton rows to show while loading (default 5)
 */

import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = "Ma'lumot topilmadi",
  emptyDesc = '',
  onRowClick,
  stickyHeader = true,
  striped = false,
  className = '',
  skeletonRows = 5,
}) => {
  /* ── Loading state: skeleton rows ── */
  if (loading) {
    return (
      <div
        className={[
          'overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800',
          'bg-white dark:bg-slate-900 shadow-card',
          className,
        ].join(' ')}
      >
        {/* Skeleton header */}
        <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex gap-4">
          {columns.map((col) => (
            <div
              key={col.key}
              className="h-3 rounded-full skeleton-shimmer flex-1 max-w-[120px]"
            />
          ))}
        </div>

        {/* Skeleton rows */}
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <div
            key={i}
            className={[
              'flex gap-4 px-4 py-3.5',
              'border-b border-slate-50 dark:border-slate-800/60 last:border-b-0',
            ].join(' ')}
          >
            {columns.map((col, j) => (
              <div
                key={col.key}
                className={[
                  'h-3 rounded-full skeleton-shimmer',
                  j === 0 ? 'w-1/3' : j % 2 === 0 ? 'w-1/5' : 'w-1/4',
                ].join(' ')}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  /* ── Empty state ── */
  if (!data || data.length === 0) {
    return (
      <div
        className={[
          'overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800',
          'bg-white dark:bg-slate-900 shadow-card',
          className,
        ].join(' ')}
      >
        <EmptyState title={emptyTitle} description={emptyDesc} />
      </div>
    );
  }

  const isClickable = typeof onRowClick === 'function';

  return (
    /* Outer: rounded container with horizontal scroll on mobile */
    <div
      className={[
        'overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800',
        'bg-white dark:bg-slate-900 shadow-card',
        className,
      ].join(' ')}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          {/* ── Head ── */}
          <thead
            className={[
              stickyHeader ? 'sticky top-0 z-10' : '',
              'bg-slate-50/90 dark:bg-slate-800/90',
              stickyHeader ? 'backdrop-blur-sm' : '',
            ].join(' ')}
          >
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={[
                    'px-4 py-3 text-left',
                    'text-xs font-semibold text-slate-500 dark:text-slate-400',
                    'uppercase tracking-wider whitespace-nowrap',
                    col.className || '',
                  ].join(' ')}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={() => onRowClick?.(row)}
                className={[
                  /* Base */
                  'transition-colors duration-100',
                  /* Striped even rows */
                  striped && i % 2 === 1
                    ? 'bg-slate-50/60 dark:bg-slate-800/30'
                    : '',
                  /* Click / hover */
                  isClickable
                    ? 'cursor-pointer hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                    : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      'px-4 py-3.5',
                      'text-slate-700 dark:text-slate-300',
                      'whitespace-nowrap',
                      col.cellClassName || '',
                    ].join(' ')}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
