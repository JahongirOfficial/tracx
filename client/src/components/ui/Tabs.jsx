/**
 * Tabs — two visual variants with smooth transitions and mobile horizontal scroll.
 *
 * Props:
 *   tabs      – [{ value, label, icon?, count? }]
 *   activeTab – currently active tab value
 *   onChange  – (value) => void
 *   variant   – 'line' (default) | 'pill'
 *   className – extra classes on the root element
 */

/* ── Line variant styles ── */
const lineTab = {
  root: 'border-b border-slate-200 dark:border-slate-800',
  nav: 'flex gap-0 px-1 -mb-px overflow-x-auto scrollbar-none',
  active:
    'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400',
  inactive:
    'border-b-2 border-transparent text-slate-500 dark:text-slate-400 ' +
    'hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600',
  btn: 'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-150',
  count: {
    active: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    inactive: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  },
};

/* ── Pill variant styles ── */
const pillTab = {
  root: 'bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1',
  nav: 'flex gap-1 overflow-x-auto scrollbar-none',
  active:
    'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm',
  inactive:
    'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
  btn: 'flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-150',
  count: {
    active: 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300',
    inactive: 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500',
  },
};

const Tabs = ({ tabs = [], activeTab, onChange, variant = 'line', className = '' }) => {
  const theme = variant === 'pill' ? pillTab : lineTab;

  return (
    <div className={`${theme.root} ${className}`}>
      <nav className={theme.nav} role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          const TabIcon = tab.icon;

          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange?.(tab.value)}
              className={[
                theme.btn,
                isActive ? theme.active : theme.inactive,
              ].join(' ')}
            >
              {/* Optional icon */}
              {TabIcon && (
                <TabIcon
                  size={15}
                  aria-hidden="true"
                  className="flex-shrink-0"
                />
              )}

              {/* Label */}
              {tab.label}

              {/* Optional count badge */}
              {tab.count !== undefined && (
                <span
                  className={[
                    'ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold leading-none',
                    isActive ? theme.count.active : theme.count.inactive,
                  ].join(' ')}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
