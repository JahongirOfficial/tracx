/**
 * LoadingSpinner — gradient conic spinner, page-level loader, and shimmer skeletons.
 *
 * Exports:
 *   default       LoadingSpinner   – inline spinner, sizes: sm | md | lg | xl
 *   named         PageLoader       – full-screen centered loader with text
 *   named         SkeletonCard     – card-shaped shimmer placeholder
 *   named         SkeletonRow      – single-line shimmer placeholder
 *   named         SkeletonTable    – table-like multi-row shimmer
 */

/* ── Spinner sizes ── */
const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
  xl: 'w-14 h-14',
};

/* ── Default export: inline spinner ── */
const LoadingSpinner = ({ size = 'md', className = '' }) => (
  /*
   * Conic-gradient ring technique:
   * The outer div provides the visible gradient ring via mask.
   * We rely on the .spinner-gradient class defined in index.css.
   */
  <span
    role="status"
    aria-label="Yuklanmoqda"
    className={[
      sizeMap[size] ?? sizeMap.md,
      'spinner-gradient flex-shrink-0',
      className,
    ].join(' ')}
  />
);

/* ── PageLoader: full-screen overlay ── */
export const PageLoader = ({ text = 'Yuklanmoqda...' }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm">
    {/* Stacked spinner rings for visual depth */}
    <div className="relative flex items-center justify-center">
      {/* Outer subtle ring */}
      <span
        aria-hidden="true"
        className="absolute w-14 h-14 rounded-full border-2 border-primary-100 dark:border-primary-900/50"
      />
      {/* Gradient spinner */}
      <LoadingSpinner size="lg" />
    </div>

    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">
      {text}
    </p>
  </div>
);

/* ── SkeletonCard: card shimmer placeholder ── */
export const SkeletonCard = ({ lines = 3 }) => (
  <div
    aria-hidden="true"
    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card overflow-hidden"
  >
    {/* Title bar */}
    <div className="h-4 rounded-full skeleton-shimmer w-2/5 mb-4" />

    {/* Content lines */}
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={[
          'h-3 rounded-full skeleton-shimmer mb-2',
          i === lines - 1 ? 'w-1/3' : i % 2 === 0 ? 'w-full' : 'w-5/6',
        ].join(' ')}
      />
    ))}
  </div>
);

/* ── SkeletonRow: single shimmer row ── */
export const SkeletonRow = ({ cols = 4 }) => (
  <div
    aria-hidden="true"
    className="flex items-center gap-4 py-3.5 px-4 border-b border-slate-100 dark:border-slate-800 last:border-0"
  >
    {Array.from({ length: cols }).map((_, i) => (
      <div
        key={i}
        className={[
          'h-3 rounded-full skeleton-shimmer',
          i === 0 ? 'w-1/4' : i === cols - 1 ? 'w-1/6' : 'flex-1',
        ].join(' ')}
      />
    ))}
  </div>
);

/* ── SkeletonTable: table shimmer with header ── */
export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div
    aria-hidden="true"
    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden"
  >
    {/* Fake header */}
    <div className="flex gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className={[
            'h-2.5 rounded-full skeleton-shimmer',
            i === 0 ? 'w-1/4' : 'flex-1',
          ].join(' ')}
        />
      ))}
    </div>

    {/* Fake rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} cols={cols} />
    ))}
  </div>
);

export default LoadingSpinner;
