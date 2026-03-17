const variantMap = {
  primary:
    'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 ' +
    'text-white shadow-sm ' +
    'disabled:bg-primary-300 disabled:shadow-none ' +
    'dark:bg-primary-600 dark:hover:bg-primary-700',

  secondary:
    'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 ' +
    'dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 ' +
    'border border-slate-200 dark:border-slate-700',

  danger:
    'bg-danger-600 hover:bg-danger-700 active:bg-danger-800 ' +
    'text-white shadow-sm ' +
    'disabled:bg-danger-300 disabled:shadow-none',

  ghost:
    'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 ' +
    'dark:hover:bg-slate-800 dark:text-slate-300',

  success:
    'bg-success-600 hover:bg-success-700 active:bg-success-800 ' +
    'text-white shadow-sm ' +
    'disabled:bg-success-300 disabled:shadow-none',

  outline:
    'bg-transparent border border-slate-300 hover:border-primary-500 hover:text-primary-600 ' +
    'active:bg-primary-50 text-slate-700 dark:border-slate-600 dark:text-slate-300 ' +
    'dark:hover:border-primary-400 dark:hover:text-primary-400',
};

const sizeMap = {
  xs: 'px-2.5 py-1 text-xs min-h-[30px]',
  sm: 'px-3 py-1.5 text-sm min-h-[34px]',
  md: 'px-4 py-2 text-sm min-h-[38px]',
  lg: 'px-5 py-2.5 text-base min-h-[44px]',
};

const iconSizeMap = { xs: 12, sm: 14, md: 15, lg: 17 };

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
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1',
        'dark:focus-visible:ring-offset-slate-900',
        'select-none',
        pill ? 'rounded-full' : 'rounded-md',
        isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        variantMap[variant] ?? variantMap.primary,
        sizeMap[size] ?? sizeMap.md,
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {loading && (
        <span
          aria-hidden="true"
          className={[
            'border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0',
            size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
          ].join(' ')}
        />
      )}
      {!loading && Icon && (
        <Icon size={iconSizeMap[size] ?? 15} className="flex-shrink-0" aria-hidden="true" />
      )}
      {children}
    </button>
  );
};

export default Button;
