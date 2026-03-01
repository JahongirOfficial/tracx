/**
 * Button — modern SaaS-quality button component.
 *
 * Variants : primary | secondary | danger | ghost | success | outline
 * Sizes    : xs | sm | md | lg
 * Props    : fullWidth, loading, disabled, icon (Lucide component), pill
 */

/* Variant base classes */
const variantMap = {
  primary:
    'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 ' +
    'text-white shadow-sm hover:shadow-md ' +
    'disabled:from-primary-300 disabled:to-primary-300 disabled:shadow-none ' +
    'dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700',

  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-700 ' +
    'dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 ' +
    'shadow-sm hover:shadow-md',

  danger:
    'bg-gradient-to-r from-danger-600 to-danger-500 hover:from-danger-700 hover:to-danger-600 ' +
    'text-white shadow-sm hover:shadow-md ' +
    'disabled:from-danger-300 disabled:to-danger-300 disabled:shadow-none',

  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-600 ' +
    'dark:hover:bg-slate-700/60 dark:text-slate-300',

  success:
    'bg-gradient-to-r from-success-600 to-success-500 hover:from-success-700 hover:to-success-600 ' +
    'text-white shadow-sm hover:shadow-md ' +
    'disabled:from-success-300 disabled:to-success-300 disabled:shadow-none',

  outline:
    'bg-transparent border border-slate-300 hover:border-primary-500 hover:text-primary-600 ' +
    'text-slate-700 dark:border-slate-600 dark:text-slate-300 ' +
    'dark:hover:border-primary-400 dark:hover:text-primary-400',
};

/* Size classes — min-height enforced for touch targets */
const sizeMap = {
  xs: 'px-2.5 py-1 text-xs min-h-[30px]',
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-sm min-h-[40px]',
  lg: 'px-5 py-3 text-base min-h-[48px]',
};

/* Icon size matched to button size */
const iconSizeMap = { xs: 12, sm: 14, md: 16, lg: 18 };

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  pill = false,
  type = 'button',
  onClick,
  className = '',
  icon: Icon,
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={[
        /* Base */
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-all duration-150 ease-in-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2',
        'dark:focus-visible:ring-offset-slate-900',
        'select-none',
        /* Shape */
        pill ? 'rounded-full' : 'rounded-xl',
        /* Disabled */
        isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        /* Variant */
        variantMap[variant] ?? variantMap.primary,
        /* Size */
        sizeMap[size] ?? sizeMap.md,
        /* Full width */
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Loading spinner */}
      {loading && (
        <span
          aria-hidden="true"
          className={[
            'border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0',
            size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
          ].join(' ')}
        />
      )}

      {/* Left icon (hidden while loading) */}
      {!loading && Icon && (
        <Icon size={iconSizeMap[size] ?? 16} className="flex-shrink-0" aria-hidden="true" />
      )}

      {children}
    </button>
  );
};

export default Button;
