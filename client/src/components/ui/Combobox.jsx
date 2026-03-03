/**
 * Combobox — searchable select dropdown.
 * Props:
 *   label, required, value, onChange(value), options=[{value,label}],
 *   placeholder, disabled, className
 */
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

const Combobox = ({
  label,
  required,
  value,
  onChange,
  options = [],
  placeholder = 'Tanlang...',
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={[
          'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm',
          'border transition-all duration-150 text-left',
          open
            ? 'border-primary-500 ring-2 ring-primary-500/20 bg-white dark:bg-slate-800'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-600',
        ].join(' ')}
      >
        <span className={selected ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-0.5 rounded"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown
            size={14}
            className={['text-slate-400 transition-transform duration-150', open ? 'rotate-180' : ''].join(' ')}
          />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Qidirish..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-slate-400">
                Natija topilmadi
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={[
                    'w-full text-left px-3 py-2.5 text-sm transition-colors duration-100',
                    opt.value === value
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Combobox;
