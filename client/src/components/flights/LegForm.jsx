/**
 * LegForm — modal for adding a cargo leg (buyurtma) to a flight.
 * 2-step stepper:
 *   Step 0: Marshrut & Yuk — fromCity, toCity, cargo, weight
 *   Step 1: To'lov         — paymentType, payment amount
 */

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import StepHeader from '../ui/StepHeader';
import useFlightStore from '../../stores/flightStore';
import useUiStore from '../../stores/uiStore';
import { PAYMENT_TYPES } from '../../utils/constants';
import { MapPin, Package, CreditCard, ArrowRight, ChevronRight } from 'lucide-react';

const STEPS = ['Marshrut & Yuk', "To'lov"];

const INITIAL_FORM = {
  fromCity: '',
  toCity: '',
  cargo: '',
  weight: '',
  payment: '',
  paymentType: 'cash',
};

const LegForm = ({ isOpen, onClose, flightId, onSuccess, initialFromCity }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...INITIAL_FORM, fromCity: initialFromCity || '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...INITIAL_FORM, fromCity: initialFromCity || '' });
      setStep(0);
    }
  }, [isOpen, initialFromCity]);

  const { addLeg } = useFlightStore();
  const { addToast } = useUiStore();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleClose = () => { setStep(0); onClose(); };

  const canAdvance = !!form.fromCity.trim() && !!form.toCity.trim();

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
        transferFeePercent: 0,
      });
      addToast("Yo'nalish qo'shildi", 'success');
      onSuccess?.();
      handleClose();
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Yo'nalish qo'shish">
      <StepHeader steps={STEPS} current={step} />

      <form onSubmit={handleSubmit}>

        {/* ── Step 0: Marshrut & Yuk ── */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <MapPin size={13} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Marshrut</span>
              </div>
              <div className="p-4">
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
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <Package size={13} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Yuk</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
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

            <div className="flex gap-3">
              <Button type="button" variant="secondary" fullWidth onClick={handleClose}>Bekor qilish</Button>
              <Button type="button" fullWidth disabled={!canAdvance} onClick={() => setStep(1)}>
                Keyingi <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 1: To'lov ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            {/* Summary chip */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{form.fromCity}</span>
              <ArrowRight size={12} className="text-slate-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{form.toCity}</span>
              {form.cargo && <span className="text-xs text-slate-400 ml-auto truncate">{form.cargo}</span>}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <CreditCard size={13} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">To'lov</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <Select
                  label="To'lov turi"
                  value={form.paymentType}
                  onChange={(e) => set('paymentType', e.target.value)}
                  options={PAYMENT_TYPES}
                />
                <Input
                  label="Miqdor (UZS)"
                  money
                  required
                  value={form.payment}
                  onChange={(e) => set('payment', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" fullWidth onClick={() => setStep(0)}>Orqaga</Button>
              <Button type="submit" fullWidth loading={loading} disabled={!form.payment}>
                Qo'shish
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default LegForm;
