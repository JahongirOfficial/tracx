/**
 * Modal — polished overlay modal with animated entrance and sticky header/footer.
 *
 * Props:
 *   isOpen       – boolean
 *   onClose      – function called on backdrop click or Esc
 *   title        – string; renders sticky header with gradient top border
 *   children     – modal body content
 *   footer       – node; renders sticky footer bar
 *   size         – 'sm' | 'md' | 'lg' | 'xl'
 *   hideClose    – hide the X button in header
 *   className    – extra classes on the panel
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/* Width map */
const sizeMap = {
  sm: 'max-w-[400px]',
  md: 'max-w-[540px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  hideClose = false,
  className = '',
}) => {
  /* Lock body scroll while open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showHeader = title || !hideClose;

  return createPortal(
    /* Full-screen overlay */
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Blurred backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          'relative w-full flex flex-col',
          'bg-white dark:bg-slate-900',
          'rounded-2xl',
          'shadow-modal',
          'max-h-[90vh]',
          'modal-enter',
          /* Overflow hidden so the top gradient border clips to rounded corners */
          'overflow-hidden',
          sizeMap[size] ?? sizeMap.md,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient top accent bar */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-500 via-primary-600 to-primary-400 z-10"
        />

        {/* Sticky header */}
        {showHeader && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
            {title ? (
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight pr-4">
                {title}
              </h2>
            ) : (
              /* Spacer when there's no title but we still render the close button */
              <span />
            )}

            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className={[
                  'flex items-center justify-center',
                  'w-8 h-8 rounded-xl',
                  'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  'transition-all duration-150',
                  'shrink-0',
                ].join(' ')}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Divider below header */}
        {showHeader && (
          <div className="h-px bg-slate-100 dark:bg-slate-800 shrink-0" />
        )}

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>

        {/* Sticky footer */}
        {footer && (
          <>
            <div className="h-px bg-slate-100 dark:bg-slate-800 shrink-0" />
            <div className="px-6 py-4 shrink-0 bg-slate-50/80 dark:bg-slate-900/80">
              {footer}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
