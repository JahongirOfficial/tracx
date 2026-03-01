/**
 * ExpenseForm — modal for adding an expense to a flight.
 *
 * Features:
 *   - Visual icon grid for expense type selection (emoji + label tiles).
 *   - Heavy expenses shown with dashed border and warning indicator.
 *   - Currency selector (UZS / USD) with optional exchange rate field.
 *   - Timing selector (before / during / after flight).
 *   - Works for both admin (/flights/:id/expenses) and driver (/driver/flights/:id/expenses).
 *
 * Props:
 *   isOpen, onClose — modal visibility
 *   flightId        — parent flight ID
 *   onSuccess       — callback after successful creation
 *   isDriver        — boolean, switches the API endpoint
 */

import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import useUiStore from '../../stores/uiStore';
import { EXPENSE_TYPES } from '../../utils/constants';
import { Clock, DollarSign, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

/* Section header */
const FormSection = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
      <Icon size={13} className="text-primary-600 dark:text-primary-400" />
    </div>
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      {title}
    </p>
    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
  </div>
);

/* Light (ordinary) expense types */
const LIGHT_TYPES = EXPENSE_TYPES.filter((t) => t.class === 'light');
/* Heavy (capital) expense types */
const HEAVY_TYPES = EXPENSE_TYPES.filter((t) => t.class === 'heavy');

const INITIAL_FORM = {
  type: '',
  amount: '',
  currency: 'UZS',
  exchangeRate: '',
  description: '',
  timing: 'during',
};

const ExpenseForm = ({ isOpen, onClose, flightId, onSuccess, isDriver = false }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const { addToast } = useUiStore();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedType = EXPENSE_TYPES.find((t) => t.value === form.type);
  const isHeavy = selectedType?.class === 'heavy';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isDriver
        ? `/driver/flights/${flightId}/expenses`
        : `/flights/${flightId}/expenses`;
      const { default: api } = await import('../../services/api');
      await api.post(endpoint, {
        type: form.type,
        amount: parseFloat(form.amount),
        currency: form.currency,
        exchangeRate:
          form.currency === 'USD' && form.exchangeRate
            ? parseFloat(form.exchangeRate)
            : undefined,
        description: form.description || undefined,
        timing: form.timing,
      });
      addToast("Xarajat qo'shildi", 'success');
      onSuccess?.();
      onClose();
      setForm(INITIAL_FORM);
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* Shared tile class */
  const tileClass = (type) =>
    [
      'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs',
      'transition-all duration-150 cursor-pointer select-none',
      form.type === type.value
        ? type.class === 'heavy'
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 shadow-sm'
          : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
        : type.class === 'heavy'
        ? 'border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-900/10',
    ].join(' ');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xarajat qo'shish" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* ── Section 1: Expense type grid ── */}
        <div>
          <FormSection icon={CheckCircle2} title="Xarajat turi" />

          {/* Light expenses */}
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 font-medium">Yengil xarajatlar</p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
            {LIGHT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => set('type', type.value)}
                className={tileClass(type)}
              >
                <span className="text-xl leading-none">{type.emoji}</span>
                <span className="truncate w-full text-center leading-tight font-medium">
                  {type.label}
                </span>
              </button>
            ))}
          </div>

          {/* Heavy expenses */}
          <p className="text-xs text-orange-500 dark:text-orange-400 mb-2 font-medium flex items-center gap-1">
            <AlertTriangle size={11} />
            Og'ir xarajatlar (foydadan chiqarilmaydi)
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {HEAVY_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => set('type', type.value)}
                className={tileClass(type)}
              >
                <span className="text-xl leading-none">{type.emoji}</span>
                <span className="truncate w-full text-center leading-tight font-medium">
                  {type.label}
                </span>
              </button>
            ))}
          </div>

          {/* Selected type indicator */}
          {selectedType && (
            <div
              className={[
                'mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium',
                isHeavy
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40',
              ].join(' ')}
            >
              <span className="text-base">{selectedType.emoji}</span>
              <span>
                {selectedType.label} —{' '}
                {isHeavy ? 'Og\'ir xarajat (hisob-kitobga kirmaydi)' : 'Yengil xarajat'}
              </span>
            </div>
          )}
        </div>

        {/* ── Section 2: Amount & currency ── */}
        <div>
          <FormSection icon={DollarSign} title="Miqdor" />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Miqdor"
              type="number"
              required
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              placeholder="0"
            />
            {/* Currency toggle */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Valyuta
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'UZS', label: "So'm" },
                  { value: 'USD', label: 'USD' },
                ].map((cur) => (
                  <button
                    key={cur.value}
                    type="button"
                    onClick={() => set('currency', cur.value)}
                    className={[
                      'flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-150',
                      form.currency === cur.value
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300',
                    ].join(' ')}
                  >
                    {cur.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* USD exchange rate */}
          {form.currency === 'USD' && (
            <div className="mt-3">
              <Input
                label="Kurs (UZS/USD)"
                type="number"
                value={form.exchangeRate}
                onChange={(e) => set('exchangeRate', e.target.value)}
                placeholder="12800"
              />
            </div>
          )}
        </div>

        {/* ── Section 3: Timing + description ── */}
        <div>
          <FormSection icon={Clock} title="Qo'shimcha" />
          <div className="flex flex-col gap-3">
            <Select
              label="Qachon"
              value={form.timing}
              onChange={(e) => set('timing', e.target.value)}
              options={[
                { value: 'before', label: 'Reysgacha' },
                { value: 'during', label: 'Reys davomida' },
                { value: 'after', label: 'Reysdan keyin' },
              ]}
            />
            <Input
              label="Tavsif (ixtiyoriy)"
              leftIcon={FileText}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Izoh..."
            />
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={!form.type || !form.amount}
          >
            Qo'shish
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseForm;
