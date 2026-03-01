/**
 * MaskedInput — formatted inputs for phone and plate numbers.
 *
 * PhoneInput  → +998 XX XXX XX XX
 * PlateInput  → 01 A 123 AA  (O'zbekiston davlat raqami)
 *
 * Both components accept the same props as Input:
 *   label, error, helper, required, className, value, onChange
 * onChange receives a synthetic event-like object: { target: { value: rawDigits } }
 * so Zustand/React state works the same way.
 */

import { useRef } from 'react';

/* ─── Shared styled input ──────────────────────────────────────── */
const StyledInput = ({ hasError, leftAddon, inputRef, ...inputProps }) => (
  <div className="relative flex items-center">
    {leftAddon && (
      <span className="absolute left-3.5 text-sm font-medium text-slate-500 dark:text-slate-400 pointer-events-none select-none">
        {leftAddon}
      </span>
    )}
    <input
      ref={inputRef}
      {...inputProps}
      className={[
        'w-full px-4 py-3 text-sm rounded-xl transition-all duration-150 shadow-sm',
        leftAddon ? 'pl-[3.75rem]' : '',
        'bg-white dark:bg-slate-800/80',
        'text-slate-900 dark:text-slate-100',
        'placeholder-slate-400 dark:placeholder-slate-500',
        hasError
          ? 'border border-danger-500 focus:outline-none focus:ring-2 focus:ring-danger-500/30 focus:border-danger-500'
          : 'border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
        'disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400 disabled:cursor-not-allowed',
      ].filter(Boolean).join(' ')}
    />
  </div>
);

/* ─── Shared wrapper ───────────────────────────────────────────── */
const FieldWrapper = ({ label, required, error, helper, className = '', children }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
        {label}
        {required && <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
    )}
    {children}
    {error && (
      <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>
    )}
    {!error && helper && (
      <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   PHONE INPUT   →  +998 77 310 98 28
   ══════════════════════════════════════════════════════════════════ */

/**
 * Format 9 raw digits into "+998 XX XXX XX XX" display string.
 * Only the 9 digits after +998 are managed.
 */
function formatPhoneDisplay(digits) {
  // digits: up to 9 chars
  const d = digits.slice(0, 9);
  let out = '';
  if (d.length > 0) out += d.slice(0, 2);         // XX
  if (d.length > 2) out += ' ' + d.slice(2, 5);   // XXX
  if (d.length > 5) out += ' ' + d.slice(5, 7);   // XX
  if (d.length > 7) out += ' ' + d.slice(7, 9);   // XX
  return out ? '+998 ' + out : '';
}

/**
 * Extract raw digits from a phone display value (strips +998 and spaces).
 */
function phoneDisplayToDigits(display) {
  return display.replace(/\D/g, '').replace(/^998/, '').slice(0, 9);
}

export const PhoneInput = ({
  label,
  error,
  helper,
  required,
  className,
  value = '',      // raw 9-digit string stored in state
  onChange,        // (e) => void, e.target.value = raw digits
  placeholder = '+998 90 123 45 67',
  disabled,
  ...rest
}) => {
  const inputRef = useRef(null);

  // Display value computed from raw digits
  const displayValue = formatPhoneDisplay(value);

  const handleChange = (e) => {
    const raw = e.target.value;

    // Allow clearing
    if (!raw || raw === '+') {
      onChange?.({ target: { value: '' } });
      return;
    }

    // Extract just the local digits (after +998 prefix)
    const digits = phoneDisplayToDigits(raw);
    onChange?.({ target: { value: digits } });
  };

  const handleKeyDown = (e) => {
    // Allow backspace to work naturally on display value
    if (e.key === 'Backspace' && value.length === 0) {
      e.preventDefault();
    }
  };

  return (
    <FieldWrapper label={label} required={required} error={error} helper={helper} className={className}>
      <StyledInput
        inputRef={inputRef}
        type="tel"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        hasError={Boolean(error)}
        disabled={disabled}
        maxLength={18}  // "+998 XX XXX XX XX" = 18 chars
        {...rest}
      />
    </FieldWrapper>
  );
};

/* ══════════════════════════════════════════════════════════════════
   PLATE INPUT   →  01 A 123 AA
   Format: 2 digits  +  space  +  1-2 letters  +  space  +  2-3 digits  +  space  +  2 letters
   Most common UZ plate: "01 A 123 AA"
   ══════════════════════════════════════════════════════════════════ */

/**
 * Format raw alphanumeric string into Uzbekistan plate format.
 * Pattern: DD L DDD LL  (digit digit, letter, digit digit digit, letter letter)
 * Example: "01A123AA" → "01 A 123 AA"
 */
function formatPlateDisplay(raw) {
  // Keep only letters and digits, uppercase
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);

  let out = '';
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (i === 2 || i === 3 || i === 6) {
      out += ' ';
    }
    out += ch;
  }
  return out.trim();
}

/**
 * Strip formatting to get raw alphanumeric string.
 */
function plateDisplayToRaw(display) {
  return display.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
}

export const PlateInput = ({
  label,
  error,
  helper,
  required,
  className,
  value = '',      // raw alphanumeric stored in state e.g. "01A123AA"
  onChange,        // (e) => void, e.target.value = raw "01A123AA"
  placeholder = '01 A 123 AA',
  disabled,
  ...rest
}) => {
  const inputRef = useRef(null);

  const displayValue = formatPlateDisplay(value);

  const handleChange = (e) => {
    const raw = plateDisplayToRaw(e.target.value);
    onChange?.({ target: { value: raw } });
  };

  return (
    <FieldWrapper label={label} required={required} error={error} helper={helper} className={className}>
      <StyledInput
        inputRef={inputRef}
        type="text"
        inputMode="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        hasError={Boolean(error)}
        disabled={disabled}
        maxLength={11}  // "01 A 123 AA" = 11 chars
        style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}
        {...rest}
      />
    </FieldWrapper>
  );
};

export default { PhoneInput, PlateInput };
