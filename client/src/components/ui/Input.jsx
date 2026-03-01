/**
 * Input — clean top-label text input with icon, error and helper support.
 *
 * Props:
 *   label      – string label rendered above the field
 *   error      – error message string; triggers red ring + border
 *   helper     – helper text shown below (hidden when error is present)
 *   leftIcon   – Lucide icon component rendered inside left side
 *   required   – appends red asterisk to label
 *   type       – forwarded to <input>
 *   className  – extra wrapper classes
 *   ...props   – all native <input> attributes (value, onChange, placeholder…)
 */

const Input = ({
  label,
  error,
  helper,
  type = 'text',
  className = '',
  required = false,
  leftIcon: LeftIcon,
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

      {/* Input wrapper */}
      <div className="relative flex items-center">
        {/* Left icon */}
        {LeftIcon && (
          <span
            aria-hidden="true"
            className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"
          >
            <LeftIcon size={16} />
          </span>
        )}

        <input
          type={type}
          {...props}
          className={[
            /* Layout */
            'w-full px-4 py-3 text-sm',
            /* Left padding when icon is present */
            LeftIcon ? 'pl-10' : '',
            /* Shape */
            'rounded-xl',
            /* Colors */
            'bg-white dark:bg-slate-800/80',
            'text-slate-900 dark:text-slate-100',
            'placeholder-slate-400 dark:placeholder-slate-500',
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
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </div>

      {/* Error message */}
      {hasError && (
        <p className="text-xs text-danger-600 dark:text-danger-400 flex items-center gap-1">
          {error}
        </p>
      )}

      {/* Helper text */}
      {!hasError && helper && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>
      )}
    </div>
  );
};

export default Input;
