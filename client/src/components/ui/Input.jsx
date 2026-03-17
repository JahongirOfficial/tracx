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

/* Format number with space thousands separator: 1000000 → "1 000 000" */
const fmtMoney = (v) => {
  const raw = String(v).replace(/\s/g, '');
  if (raw === '' || raw === '-') return raw;
  const [int, dec] = raw.split('.');
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (dec !== undefined ? '.' + dec : '');
};

const Input = ({
  label,
  error,
  helper,
  type = 'text',
  className = '',
  required = false,
  leftIcon: LeftIcon,
  money = false,
  value,
  onChange,
  ...props
}) => {
  const hasError = Boolean(error);

  /* money mode: display formatted, emit raw on change */
  const moneyValue   = money ? fmtMoney(value ?? '') : value;
  const moneyChange  = money
    ? (e) => {
        const raw = e.target.value.replace(/\s/g, '');
        if (raw !== '' && !/^-?\d*\.?\d*$/.test(raw)) return;
        onChange?.({ ...e, target: { ...e.target, value: raw } });
      }
    : onChange;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide select-none">
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
            className="absolute left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"
          >
            <LeftIcon size={15} />
          </span>
        )}

        <input
          type={money ? 'text' : type}
          inputMode={money ? 'numeric' : undefined}
          value={moneyValue}
          onChange={moneyChange}
          {...props}
          className={[
            'w-full px-3 py-2.5 text-sm',
            LeftIcon ? 'pl-9' : '',
            'rounded-md',
            'bg-white dark:bg-slate-800/80',
            'text-slate-900 dark:text-slate-100',
            'placeholder-slate-400 dark:placeholder-slate-500',
            hasError
              ? 'border border-danger-500 dark:border-danger-500'
              : 'border border-slate-200 dark:border-slate-700',
            hasError
              ? 'focus:outline-none focus:ring-1 focus:ring-danger-500/40 focus:border-danger-500'
              : 'focus:outline-none focus:ring-1 focus:ring-primary-500/40 focus:border-primary-500',
            'transition-colors duration-150',
            'disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400 disabled:cursor-not-allowed',
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
