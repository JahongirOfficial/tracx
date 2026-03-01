/**
 * Toast / ToastContainer — notification toasts with:
 *   - toast-enter slide-in animation
 *   - 4px colored left border matching type
 *   - auto-dismiss countdown progress bar (thin line at bottom)
 *   - stacked from bottom-right on desktop, bottom-center on mobile
 *
 * Reads from the uiStore (toasts array + removeToast action).
 * Each toast object: { id, type: 'success'|'error'|'warning'|'info', message, duration? }
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import useUiStore from '../../stores/uiStore';

/* ── Per-type design tokens ── */
const typeTheme = {
  success: {
    border: 'border-l-success-500',
    iconColor: 'text-success-500',
    progressColor: 'bg-success-500',
    Icon: CheckCircle2,
  },
  error: {
    border: 'border-l-danger-500',
    iconColor: 'text-danger-500',
    progressColor: 'bg-danger-500',
    Icon: XCircle,
  },
  warning: {
    border: 'border-l-warning-500',
    iconColor: 'text-warning-500',
    progressColor: 'bg-warning-500',
    Icon: AlertTriangle,
  },
  info: {
    border: 'border-l-primary-500',
    iconColor: 'text-primary-500',
    progressColor: 'bg-primary-500',
    Icon: Info,
  },
};

/* Default auto-dismiss duration in ms */
const DEFAULT_DURATION = 4500;

/* ── Single Toast item ── */
const ToastItem = ({ toast, onClose }) => {
  const duration = toast.duration ?? DEFAULT_DURATION;
  const theme = typeTheme[toast.type] ?? typeTheme.info;
  const { Icon } = theme;
  const progressRef = useRef(null);

  /* Auto-dismiss */
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onClose]);

  /* Animate progress bar width from 100% → 0 in sync with duration */
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    /* Force reflow before starting the transition */
    el.style.transition = 'none';
    el.style.width = '100%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `width ${duration}ms linear`;
        el.style.width = '0%';
      });
    });
  }, [duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        /* Base */
        'relative flex items-start gap-3',
        'bg-white dark:bg-slate-800',
        'rounded-xl shadow-lg',
        /* Left colored border */
        'border-l-4',
        theme.border,
        /* Outer border */
        'border border-l-[4px] border-slate-200/80 dark:border-slate-700/60',
        /* Padding */
        'px-4 py-3.5',
        /* Width */
        'w-full max-w-sm',
        /* Enter animation */
        'toast-enter',
        'overflow-hidden',
      ].join(' ')}
    >
      {/* Type icon */}
      <span className={`mt-0.5 flex-shrink-0 ${theme.iconColor}`} aria-hidden="true">
        <Icon size={18} strokeWidth={2} />
      </span>

      {/* Message */}
      <p className="flex-1 text-sm text-slate-700 dark:text-slate-200 leading-snug pr-1">
        {toast.message}
      </p>

      {/* Close button */}
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
        className={[
          'flex-shrink-0 mt-0.5',
          'w-6 h-6 flex items-center justify-center rounded-lg',
          'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
          'hover:bg-slate-100 dark:hover:bg-slate-700',
          'transition-colors duration-150',
        ].join(' ')}
      >
        <X size={13} strokeWidth={2.5} />
      </button>

      {/* Auto-dismiss progress bar — thin line at bottom */}
      <div
        aria-hidden="true"
        ref={progressRef}
        className={[
          'absolute bottom-0 left-0 h-[2px]',
          theme.progressColor,
          'opacity-60 rounded-bl-xl',
        ].join(' ')}
        style={{ width: '100%' }}
      />
    </div>
  );
};

/* ── Container ── */
const ToastContainer = () => {
  const { toasts, removeToast } = useUiStore();

  if (!toasts || toasts.length === 0) return null;

  return createPortal(
    /*
     * Desktop: bottom-right, fixed
     * Mobile (< sm): bottom-center, full-width-ish
     */
    <div
      aria-label="Notifications"
      className={[
        'fixed z-[200]',
        /* Desktop */
        'sm:bottom-5 sm:right-5',
        /* Mobile: centered */
        'bottom-4 left-4 right-4 sm:left-auto',
        /* Stack vertically, newest on top */
        'flex flex-col-reverse gap-2.5',
        /* Width cap on desktop */
        'sm:w-[360px]',
      ].join(' ')}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
