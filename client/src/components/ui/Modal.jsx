import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

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
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showHeader = title || !hideClose;

  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          'relative w-full flex flex-col',
          'bg-white dark:bg-slate-900',
          'rounded-lg',
          'shadow-xl shadow-slate-900/15',
          'max-h-[90vh]',
          'modal-enter',
          'overflow-hidden',
          sizeMap[size] ?? sizeMap.md,
          className,
        ].filter(Boolean).join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
            {title ? (
              <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-tight pr-4">
                {title}
              </h2>
            ) : <span />}

            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {showHeader && <div className="h-px bg-slate-100 dark:bg-slate-800 shrink-0" />}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <>
            <div className="h-px bg-slate-100 dark:bg-slate-800 shrink-0" />
            <div className="px-6 py-4 shrink-0 bg-slate-50 dark:bg-slate-900/80">{footer}</div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
