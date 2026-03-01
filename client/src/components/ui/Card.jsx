/**
 * Card — rounded-2xl surface component with shadow-card and optional hover lift.
 *
 * Props:
 *   children   – content
 *   padding    – 'none' | 'sm' | 'md' | 'lg' | 'xl'
 *   onClick    – when provided adds cursor-pointer + hover shadow lift
 *   className  – extra classes
 *   as         – rendered HTML element (default 'div')
 */

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
};

const Card = ({
  children,
  className = '',
  padding = 'md',
  onClick,
  as: Tag = 'div',
}) => {
  const isInteractive = typeof onClick === 'function';

  return (
    <Tag
      onClick={onClick}
      className={[
        /* Base surface */
        'bg-white dark:bg-slate-900',
        'rounded-2xl',
        'border border-slate-200/80 dark:border-slate-800',
        /* Default shadow */
        'shadow-card',
        /* Hover lift when clickable */
        isInteractive
          ? 'cursor-pointer hover:shadow-card-hover active:scale-[0.99]'
          : '',
        /* Smooth transition */
        'transition-all duration-150 ease-in-out',
        /* Padding */
        paddingMap[padding] ?? paddingMap.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
};

export default Card;
