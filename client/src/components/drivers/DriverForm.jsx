/**
 * DriverForm — modal for creating or editing a driver.
 *
 * Sections:
 *   1. Account   — username (disabled on edit), password (create only)
 *   2. Personal  — full name, phone
 *   3. Payment   — payment type toggle (per_trip / monthly), rate or salary
 *
 * Props:
 *   isOpen, onClose — modal visibility
 *   driver          — when provided, puts the form into edit mode
 */

import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useDriverStore from '../../stores/driverStore';
import useUiStore from '../../stores/uiStore';
import { AtSign, Lock, User, Percent, Banknote } from 'lucide-react';
import { PhoneInput } from '../ui/MaskedInput';

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

const DriverForm = ({ isOpen, onClose, driver = null }) => {
  const isEdit = !!driver;

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

  const { createDriver, updateDriver } = useDriverStore();
  const { addToast } = useUiStore();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form };
      /* Convert number fields — delete if empty so server uses default(0) */
      data.baseSalary = form.baseSalary !== '' ? parseFloat(form.baseSalary) || 0 : 0;
      data.perTripRate = form.perTripRate !== '' ? parseFloat(form.perTripRate) || 0 : 0;
      /* Don't send empty password on edit */
      if (!form.password) delete data.password;

      if (isEdit) {
        await updateDriver(driver.id, data);
        addToast('Haydovchi yangilandi', 'success');
      } else {
        await createDriver(data);
        addToast('Haydovchi yaratildi', 'success');
      }
      onClose();
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Haydovchini tahrirlash' : 'Yangi haydovchi'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* ── Section 1: Account ── */}
        <div>
          <FormSection icon={AtSign} title="Kirish ma'lumotlari" />
          <div className="flex flex-col gap-3">
            <Input
              label="Foydalanuvchi nomi"
              required={!isEdit}
              leftIcon={AtSign}
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              disabled={isEdit}
              placeholder="driver123"
              helper={isEdit ? "Foydalanuvchi nomi o'zgartirilmaydi" : undefined}
            />
            {!isEdit && (
              <Input
                label="Parol"
                type="password"
                required
                leftIcon={Lock}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Kamida 8 ta belgi"
              />
            )}
          </div>
        </div>

        {/* ── Section 2: Personal info ── */}
        <div>
          <FormSection icon={User} title="Shaxsiy ma'lumotlar" />
          <div className="flex flex-col gap-3">
            <Input
              label="To'liq ism"
              required
              leftIcon={User}
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              placeholder="Alisher Navoiy"
            />
            <PhoneInput
              label="Telefon"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>
        </div>

        {/* ── Section 3: Payment type ── */}
        <div>
          <FormSection icon={Banknote} title="To'lov turi" />
          {/* Toggle buttons */}
          <div className="flex gap-2 mb-3">
            {[
              { value: 'per_trip', label: 'Reys bo\'yicha (%)' },
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
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Conditional rate/salary field */}
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
              type="number"
              leftIcon={Banknote}
              value={form.baseSalary}
              onChange={(e) => set('baseSalary', e.target.value)}
              placeholder="3 000 000"
            />
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            {isEdit ? 'Saqlash' : 'Yaratish'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DriverForm;
