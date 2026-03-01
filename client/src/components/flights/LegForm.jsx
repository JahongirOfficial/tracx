/**
 * LegForm — modal for adding a cargo leg (buyurtma) to a flight.
 *
 * Fields:
 *   fromCity, toCity, cargo, weight, paymentType, payment, transferFeePercent
 *
 * Live preview: when payment > 0, shows a mini summary card with
 *   commission amount and net payment.
 *
 * Props:
 *   isOpen, onClose  — modal visibility
 *   flightId         — parent flight ID
 *   onSuccess        — callback after successful creation
 */

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import useFlightStore from '../../stores/flightStore';
import useUiStore from '../../stores/uiStore';
import { PAYMENT_TYPES } from '../../utils/constants';
import { formatMoney } from '../../utils/formatters';
import { MapPin, Package, CreditCard, Percent, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

/* Section header inside the form */
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

const INITIAL_FORM = {
  fromCity: '',
  toCity: '',
  cargo: '',
  weight: '',
  payment: '',
  paymentType: 'cash',
  transferFeePercent: '0',
};

const LegForm = ({ isOpen, onClose, flightId, onSuccess, initialFromCity }) => {
  const [form, setForm] = useState({ ...INITIAL_FORM, fromCity: initialFromCity || '' });
  const [loading, setLoading] = useState(false);

  /* When modal opens, sync initialFromCity into form */
  useEffect(() => {
    if (isOpen) {
      setForm({ ...INITIAL_FORM, fromCity: initialFromCity || '' });
    }
  }, [isOpen, initialFromCity]);

  const { addLeg } = useFlightStore();
  const { addToast } = useUiStore();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* Live financial preview */
  const payment = parseFloat(form.payment) || 0;
  const feePercent = parseFloat(form.transferFeePercent) || 0;
  const transferFeeAmount = (payment * feePercent) / 100;
  const netPayment = payment - transferFeeAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addLeg(flightId, {
        fromCity: form.fromCity,
        toCity: form.toCity,
        cargo: form.cargo || undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        payment: parseFloat(form.payment),
        paymentType: form.paymentType,
        transferFeePercent: parseFloat(form.transferFeePercent) || 0,
      });
      addToast("Buyurtma qo'shildi", 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.fromCity && form.toCity && form.payment;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buyurtma qo'shish">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* ── Section 1: Route ── */}
        <div>
          <FormSection icon={MapPin} title="Marshrut" />
          {/* Visual from → to row */}
          <div className="flex items-end gap-2">
            <Input
              label="Qayerdan"
              required
              value={form.fromCity}
              onChange={(e) => set('fromCity', e.target.value)}
              placeholder="Toshkent"
              className="flex-1"
            />
            <div className="mb-3 text-slate-400 dark:text-slate-600 shrink-0">
              <ArrowRight size={18} />
            </div>
            <Input
              label="Qayerga"
              required
              value={form.toCity}
              onChange={(e) => set('toCity', e.target.value)}
              placeholder="Moskva"
              className="flex-1"
            />
          </div>
        </div>

        {/* ── Section 2: Cargo ── */}
        <div>
          <FormSection icon={Package} title="Yuk" />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Yuk nomi"
              value={form.cargo}
              onChange={(e) => set('cargo', e.target.value)}
              placeholder="Meva-sabzavot"
            />
            <Input
              label="Vazn (t)"
              type="number"
              value={form.weight}
              onChange={(e) => set('weight', e.target.value)}
              placeholder="10.0"
            />
          </div>
        </div>

        {/* ── Section 3: Payment ── */}
        <div>
          <FormSection icon={CreditCard} title="To'lov" />
          <div className="flex flex-col gap-3">
            <Select
              label="To'lov turi"
              value={form.paymentType}
              onChange={(e) => set('paymentType', e.target.value)}
              options={PAYMENT_TYPES}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Miqdor (UZS)"
                type="number"
                required
                value={form.payment}
                onChange={(e) => set('payment', e.target.value)}
                placeholder="0"
              />
              <Input
                label="Komissiya (%)"
                type="number"
                leftIcon={Percent}
                value={form.transferFeePercent}
                onChange={(e) => set('transferFeePercent', e.target.value)}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* ── Live payment preview ── */}
        {payment > 0 && (
          <div
            className={[
              'rounded-2xl border p-4',
              'bg-slate-50 dark:bg-slate-800/50',
              'border-slate-200 dark:border-slate-700',
            ].join(' ')}
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Hisob-kitob
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <TrendingDown size={13} className="text-red-500" />
                  Komissiya ({feePercent}%)
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  -{formatMoney(transferFeeAmount)}
                </span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <TrendingUp size={13} className="text-emerald-500" />
                  Sof to'lov
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(netPayment)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" fullWidth loading={loading} disabled={!canSubmit}>
            Qo'shish
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LegForm;
