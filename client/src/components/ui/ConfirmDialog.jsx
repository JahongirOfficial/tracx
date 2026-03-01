/**
 * ConfirmDialog — centered confirmation overlay with colored icon ring and
 * gradient action button.
 *
 * Props:
 *   isOpen        – boolean
 *   onClose       – cancel / backdrop close handler
 *   onConfirm     – confirm action handler
 *   title         – heading string
 *   message       – body text
 *   confirmLabel  – confirm button text (default 'Tasdiqlash')
 *   danger        – boolean; uses red styling (default true)
 *   loading       – boolean; shows spinner on confirm button
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Tasdiqlash',
  danger = true,
  loading = false,
}) => {
  /* Escape key support */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !loading) onClose?.();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, loading]);

  /* Body scroll lock */
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

  if (!isOpen) return null;

  /* Icon and ring color based on danger/neutral */
  const IconComponent = danger ? AlertTriangle : HelpCircle;

  const iconRingClass = danger
    ? 'bg-danger-50 dark:bg-danger-900/30 ring-4 ring-danger-100 dark:ring-danger-800/40'
    : 'bg-amber-50 dark:bg-amber-900/30 ring-4 ring-amber-100 dark:ring-amber-800/40';

  const iconColorClass = danger
    ? 'text-danger-600 dark:text-danger-400'
    : 'text-amber-500 dark:text-amber-400';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md fade-in"
        onClick={!loading ? onClose : undefined}
      />

      {/* Dialog panel */}
      <div
        className={[
          'relative w-full max-w-[400px]',
          'bg-white dark:bg-slate-900',
          'rounded-2xl shadow-modal',
          'overflow-hidden',
          'modal-enter',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient accent */}
        <div
          aria-hidden="true"
          className={[
            'absolute top-0 left-0 right-0 h-[3px]',
            danger
              ? 'bg-gradient-to-r from-danger-500 to-danger-400'
              : 'bg-gradient-to-r from-amber-500 to-amber-400',
          ].join(' ')}
        />

        {/* Close button */}
        <button
          type="button"
          onClick={!loading ? onClose : undefined}
          disabled={loading}
          aria-label="Close"
          className={[
            'absolute top-4 right-4',
            'w-8 h-8 flex items-center justify-center rounded-xl',
            'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            'transition-all duration-150',
            loading ? 'opacity-40 cursor-not-allowed' : '',
          ].join(' ')}
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
          {/* Colored icon with ring */}
          <div
            aria-hidden="true"
            className={[
              'w-14 h-14 rounded-full flex items-center justify-center mb-5',
              iconRingClass,
            ].join(' ')}
          >
            <IconComponent
              size={26}
              className={iconColorClass}
              strokeWidth={1.75}
            />
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 leading-snug">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-7 max-w-xs">
            {message}
          </p>

          {/* Action buttons */}
          <div className="flex gap-3 w-full">
            {/* Cancel */}
            <Button
              variant="secondary"
              fullWidth
              onClick={!loading ? onClose : undefined}
              disabled={loading}
              size="md"
            >
              Bekor qilish
            </Button>

            {/* Confirm */}
            <Button
              variant={danger ? 'danger' : 'primary'}
              fullWidth
              onClick={onConfirm}
              loading={loading}
              size="md"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
