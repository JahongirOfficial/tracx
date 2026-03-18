/**
 * DriverForm — modal for creating or editing a driver.
 * 2-step stepper:
 *   Step 0: Hisob & Shaxsiy — username, password (create), fullName, phone
 *   Step 1: To'lov          — paymentType, rate / salary
 */

import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import StepHeader from '../ui/StepHeader';
import useDriverStore from '../../stores/driverStore';
import useUiStore from '../../stores/uiStore';
import { AtSign, Lock, User, Percent, Banknote, ChevronRight } from 'lucide-react';
import { PhoneInput } from '../ui/MaskedInput';

const STEPS = ["Hisob & Shaxsiy", "To'lov"];

const DriverForm = ({ isOpen, onClose, driver = null }) => {
  const isEdit = !!driver;
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    username: driver?.username || '',
    password: '',
    fullName: driver?.fullName || '',
    phone: driver?.phone || '',
    paymentType: driver?.paymentType || 'per_trip',
    baseSalary: driver?.baseSalary || '',
    perTripRate: driver?.perTripRate || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { createDriver, updateDriver } = useDriverStore();
  const { addToast } = useUiStore();

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleClose = () => { setStep(0); setErrors({}); onClose(); };

  const validateStep0 = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "To'liq ism kiritilishi shart";
    if (!isEdit) {
      if (!form.username.trim()) errs.username = 'Username kiritilishi shart';
      else if (form.username.trim().length < 3) errs.username = 'Username kamida 3 ta belgi';
      if (!form.password) errs.password = 'Parol kiritilishi shart';
      else if (form.password.length < 8) errs.password = 'Parol kamida 8 ta belgi';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const canAdvance = () => {
    if (!form.fullName.trim()) return false;
    if (!isEdit && (!form.username.trim() || form.username.trim().length < 3)) return false;
    if (!isEdit && (!form.password || form.password.length < 8)) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form };
      data.username = form.username.trim();
      data.fullName = form.fullName.trim();
      data.baseSalary = form.baseSalary !== '' ? parseFloat(form.baseSalary) || 0 : 0;
      data.perTripRate = form.perTripRate !== '' ? parseFloat(form.perTripRate) || 0 : 0;
      if (!form.password) delete data.password;

      if (isEdit) {
        await updateDriver(driver.id, data);
        addToast('Haydovchi yangilandi', 'success');
      } else {
        await createDriver(data);
        addToast('Haydovchi yaratildi', 'success');
      }
      handleClose();
    } catch (err) {
      // Server validatsiya xatolari (field-level)
      if (err?.errors?.length) {
        const serverErrs = {};
        err.errors.forEach(({ field, message }) => { serverErrs[field] = message; });
        setErrors(serverErrs);
        // Agar 1-stepda xato bo'lsa, orqaga qaytish
        const step0Fields = ['username', 'password', 'fullName', 'phone'];
        if (err.errors.some((e) => step0Fields.includes(e.field))) setStep(0);
        addToast('Maydonlarni tekshiring', 'error');
      } else {
        addToast(err?.message || 'Xato yuz berdi', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? 'Haydovchini tahrirlash' : 'Yangi haydovchi'}>
      <StepHeader steps={STEPS} current={step} />

      <form onSubmit={handleSubmit}>

        {/* ── Step 0: Hisob & Shaxsiy ── */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            {!isEdit && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <Lock size={13} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Kirish ma'lumotlari</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <Input
                    label="Foydalanuvchi nomi"
                    required
                    leftIcon={AtSign}
                    value={form.username}
                    onChange={(e) => set('username', e.target.value)}
                    placeholder="driver123"
                    error={errors.username}
                  />
                  <Input
                    label="Parol"
                    type="password"
                    required
                    leftIcon={Lock}
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="Kamida 8 ta belgi"
                    error={errors.password}
                  />
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <User size={13} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Shaxsiy ma'lumotlar</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <Input
                  label="To'liq ism"
                  required
                  leftIcon={User}
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  placeholder="Alisher Navoiy"
                  error={errors.fullName}
                />
                <PhoneInput
                  label="Telefon"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  error={errors.phone}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" fullWidth onClick={handleClose}>Bekor qilish</Button>
              <Button type="button" fullWidth disabled={!canAdvance()} onClick={() => { if (validateStep0()) setStep(1); }}>
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
              <User size={13} className="text-slate-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{form.fullName}</span>
              {!isEdit && <span className="text-xs font-mono text-slate-400 ml-auto">@{form.username}</span>}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <Banknote size={13} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">To'lov turi</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex gap-2">
                  {[
                    { value: 'per_trip', label: "Reys bo'yicha (%)" },
                    { value: 'monthly', label: 'Oylik maosh' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('paymentType', opt.value)}
                      className={[
                        'flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150',
                        form.paymentType === opt.value
                          ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {form.paymentType === 'per_trip' ? (
                  <Input
                    label="Reys ulushi (%)"
                    type="number"
                    leftIcon={Percent}
                    value={form.perTripRate}
                    onChange={(e) => set('perTripRate', e.target.value)}
                    placeholder="30"
                    min="0"
                    max="100"
                    helper="Har bir reysdan haydovchiga beriladigan foiz"
                  />
                ) : (
                  <Input
                    label="Oylik maosh (UZS)"
                    money
                    leftIcon={Banknote}
                    value={form.baseSalary}
                    onChange={(e) => set('baseSalary', e.target.value)}
                    placeholder="3 000 000"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" fullWidth onClick={() => setStep(0)}>Orqaga</Button>
              <Button type="submit" fullWidth loading={loading}>{isEdit ? 'Saqlash' : 'Yaratish'}</Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default DriverForm;
