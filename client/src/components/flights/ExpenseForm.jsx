import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useUiStore from '../../stores/uiStore';
import { EXPENSE_TYPES } from '../../utils/constants';
import { AlertTriangle, Droplets, Gauge } from 'lucide-react';

const FUEL_TYPES = ['fuel', 'fuel_metan', 'fuel_propan', 'fuel_benzin', 'fuel_diesel'];
const GAS_TYPES  = ['fuel_metan', 'fuel_propan'];

const todayStr = () => new Date().toISOString().split('T')[0];

const INITIAL = {
  type: '',
  amount: '',
  currency: 'UZS',
  exchangeRate: '',
  description: '',
  fuelLiters: '',
  odometerAtExpense: '',
  expenseDate: todayStr(),
};

const LIGHT_TYPES = EXPENSE_TYPES.filter((t) => t.class === 'light');
const HEAVY_TYPES = EXPENSE_TYPES.filter((t) => t.class === 'heavy');

const ExpenseForm = ({ isOpen, onClose, flightId, onSuccess, isDriver = false, expense = null }) => {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const { addToast } = useUiStore();

  const isEditMode = !!expense;

  useEffect(() => {
    if (isOpen && expense) {
      setForm({
        type: expense.type || '',
        amount: expense.amount?.toString() || '',
        currency: expense.currency || 'UZS',
        exchangeRate: expense.exchangeRate?.toString() || '',
        description: expense.description || '',
        fuelLiters: expense.fuelLiters?.toString() || '',
        odometerAtExpense: expense.odometerAtExpense?.toString() || '',
        expenseDate: expense.expenseDate
          ? new Date(expense.expenseDate).toISOString().split('T')[0]
          : todayStr(),
      });
    } else if (isOpen && !expense) {
      setForm({ ...INITIAL, expenseDate: todayStr() });
    }
  }, [isOpen, expense]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedType = EXPENSE_TYPES.find((t) => t.value === form.type);
  const isHeavy      = selectedType?.class === 'heavy';
  const isFuel       = FUEL_TYPES.includes(form.type);
  const fuelUnit     = GAS_TYPES.includes(form.type) ? 'kub' : 'litr';

  const pricePerUnit =
    isFuel && form.fuelLiters && form.amount && parseFloat(form.fuelLiters) > 0
      ? Math.round(parseFloat(form.amount) / parseFloat(form.fuelLiters))
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { default: api } = await import('../../services/api');
      const payload = {
        type: form.type,
        amount: parseFloat(form.amount),
        currency: form.currency,
        exchangeRate:
          form.currency === 'USD' && form.exchangeRate
            ? parseFloat(form.exchangeRate)
            : undefined,
        description: form.description || undefined,
        timing: 'during',
        expenseDate: form.expenseDate,
        fuelLiters: isFuel && form.fuelLiters ? parseFloat(form.fuelLiters) : undefined,
        fuelPricePerLiter: pricePerUnit ?? undefined,
        odometerAtExpense:
          isFuel && form.odometerAtExpense ? parseInt(form.odometerAtExpense) : undefined,
      };

      if (isEditMode) {
        const ep = isDriver
          ? `/driver/flights/${flightId}/expenses/${expense.id}`
          : `/flights/${flightId}/expenses/${expense.id}`;
        await api.put(ep, payload);
        addToast('Xarajat yangilandi', 'success');
      } else {
        const ep = isDriver
          ? `/driver/flights/${flightId}/expenses`
          : `/flights/${flightId}/expenses`;
        await api.post(ep, payload);
        addToast("Xarajat qo'shildi", 'success');
      }

      onSuccess?.();
      onClose();
      setForm(INITIAL);
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tileCls = (type) =>
    [
      'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-[11px] font-medium',
      'transition-all duration-150 cursor-pointer select-none',
      form.type === type.value
        ? type.class === 'heavy'
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 shadow-sm'
          : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
        : type.class === 'heavy'
        ? 'border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-900/10',
    ].join(' ');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Xarajatni tahrirlash' : "Xarajat qo'shish"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* ── 1. Xarajat turi ── */}
        <div className="space-y-3">
          {/* Light */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Oddiy xarajatlar
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
              {LIGHT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => set('type', type.value)}
                  className={tileCls(type)}
                >
                  <span className="text-xl leading-none">{type.emoji}</span>
                  <span className="truncate w-full text-center">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Heavy */}
          <div>
            <p className="text-[11px] font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertTriangle size={10} />
              Kapital (foydadan chiqarilmaydi)
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
              {HEAVY_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => set('type', type.value)}
                  className={tileCls(type)}
                >
                  <span className="text-xl leading-none">{type.emoji}</span>
                  <span className="truncate w-full text-center">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected badge */}
          {selectedType && (
            <div
              className={[
                'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border',
                isHeavy
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/40 text-orange-700 dark:text-orange-400'
                  : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800/40 text-primary-700 dark:text-primary-400',
              ].join(' ')}
            >
              <span className="text-base">{selectedType.emoji}</span>
              <span className="font-semibold">{selectedType.label}</span>
              <span className="opacity-50">—</span>
              <span className="opacity-80">
                {isHeavy ? 'Kapital xarajat' : 'Oddiy xarajat'}
              </span>
            </div>
          )}
        </div>

        {/* ── divider ── */}
        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        {/* ── 2. Summa ── */}
        <div className="space-y-3">
          {/* Amount (full width, prominent) */}
          <Input
            label="Summa"
            type="number"
            required
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            placeholder="0"
          />

          {/* Currency + Date side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Valyuta
              </label>
              <div className="flex gap-2">
                {['UZS', 'USD'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('currency', c)}
                    className={[
                      'flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-150',
                      form.currency === c
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300',
                    ].join(' ')}
                  >
                    {c === 'UZS' ? "So'm" : 'USD'}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Sana"
              type="date"
              value={form.expenseDate}
              onChange={(e) => set('expenseDate', e.target.value)}
            />
          </div>

          {/* USD kurs */}
          {form.currency === 'USD' && (
            <Input
              label="Kurs (UZS/USD)"
              type="number"
              value={form.exchangeRate}
              onChange={(e) => set('exchangeRate', e.target.value)}
              placeholder="12800"
            />
          )}
        </div>

        {/* ── 3. Yoqilg'i (conditional) ── */}
        {isFuel && (
          <>
            <div className="h-px bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets size={11} />
                Yoqilg'i ma'lumotlari
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={fuelUnit === 'kub' ? 'Kub soni' : 'Litr soni'}
                  type="number"
                  leftIcon={Droplets}
                  value={form.fuelLiters}
                  onChange={(e) => set('fuelLiters', e.target.value)}
                  placeholder="0"
                />
                <Input
                  label="Odometr (km)"
                  type="number"
                  leftIcon={Gauge}
                  value={form.odometerAtExpense}
                  onChange={(e) => set('odometerAtExpense', e.target.value)}
                  placeholder="0"
                />
              </div>
              {pricePerUnit !== null && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <Droplets size={13} className="text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    1 {fuelUnit} narxi:
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tabular-nums ml-auto">
                    {pricePerUnit.toLocaleString()} UZS
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── 4. Izoh ── */}
        <Input
          label="Izoh (ixtiyoriy)"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Qo'shimcha ma'lumot..."
        />

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={!form.type || !form.amount}
          >
            {isEditMode ? 'Saqlash' : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseForm;
