/**
 * Select — styled native select matching Input design language.
 *
 * Props:
 *   label       – string label rendered above
 *   error       – error message string; triggers red ring + border
 *   helper      – helper text below (hidden when error present)
 *   options     – [{ value, label }]
 *   placeholder – shown as first disabled option
 *   required    – appends red asterisk to label
 *   className   – extra wrapper classes
 *   ...props    – native <select> attributes (value, onChange…)
 */

const Select = ({
  label,
  error,
  helper,
  options = [],
  placeholder,
  required = false,
  className = '',
  ...props
}) => {
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
          {label}
          {required && (
            <span className="text-danger-500 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Select wrapper — positions the custom chevron */}
      <div className="relative flex items-center">
        <select
          {...props}
          className={[
            /* Layout */
            'w-full px-4 py-3 text-sm',
            /* Shape */
            'rounded-xl',
            /* Hide native arrow; we use our own */
            'appearance-none',
            /* Colors */
            'bg-white dark:bg-slate-800/80',
            'text-slate-900 dark:text-slate-100',
            /* Border */
            hasError
              ? 'border border-danger-500 dark:border-danger-500'
              : 'border border-slate-200 dark:border-slate-700',
            /* Focus ring */
            hasError
              ? 'focus:outline-none focus:ring-2 focus:ring-danger-500/30 focus:border-danger-500'
              : 'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
            /* Transition */
            'transition-all duration-150 ease-in-out',
            /* Disabled */
            'disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400 disabled:cursor-not-allowed',
            /* Shadow */
            'shadow-sm',
            /* Extra right padding so text doesn't overlap the chevron */
            'pr-10',
            /* Cursor */
            'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron icon */}
        <span
          aria-hidden="true"
          className="absolute right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"
        >
          {/* Inline SVG chevron — no extra package needed */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {/* Error message */}
      {hasError && (
        <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>
      )}

      {/* Helper text */}
      {!hasError && helper && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>
      )}
    </div>
  );
};

export default Select;
