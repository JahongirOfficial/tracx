import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import StepHeader from '../ui/StepHeader';
import { PlateInput } from '../ui/MaskedInput';
import useVehicleStore from '../../stores/vehicleStore';
import useUiStore from '../../stores/uiStore';
import { Car, Wrench, ChevronRight } from 'lucide-react';

const STEPS = ['Mashina', 'Texnik'];

const VehicleForm = ({ isOpen, onClose, vehicle = null }) => {
  const isEdit = !!vehicle;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    plateNumber: vehicle?.plateNumber || '',
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    color: vehicle?.color || '',
    currentOdometer: vehicle?.currentOdometer || '',
    oilChangeIntervalKm: vehicle?.oilChangeIntervalKm || '10000',
    lastOilChangeKm: vehicle?.lastOilChangeKm || '',
  });
  const [loading, setLoading] = useState(false);
  const { createVehicle, updateVehicle } = useVehicleStore();
  const { addToast } = useUiStore();

  const handleClose = () => { setStep(0); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        year: form.year ? parseInt(form.year) : undefined,
        currentOdometer: form.currentOdometer ? parseInt(form.currentOdometer) : 0,
        oilChangeIntervalKm: parseInt(form.oilChangeIntervalKm) || 10000,
        lastOilChangeKm: form.lastOilChangeKm ? parseInt(form.lastOilChangeKm) : 0,
      };
      if (isEdit) {
        await updateVehicle(vehicle.id, data);
        addToast('Mashina yangilandi', 'success');
      } else {
        await createVehicle(data);
        addToast("Mashina qo'shildi", 'success');
      }
      handleClose();
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const canAdvance = form.plateNumber.trim().length >= 6;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? 'Mashinani tahrirlash' : 'Yangi mashina'}>
      <StepHeader steps={STEPS} current={step} />

      <form onSubmit={handleSubmit}>

        {/* ── Step 0: Mashina ── */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <Car size={13} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Asosiy ma'lumotlar
                </span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <PlateInput
                  label="Davlat raqami"
                  required
                  value={form.plateNumber}
                  onChange={(e) => set('plateNumber', e.target.value)}
                  disabled={isEdit}
                  helper={isEdit ? "Davlat raqami o'zgartirilmaydi" : undefined}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Marka" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Mercedes" />
                  <Input label="Model" value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="Actros" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Yil" type="number" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="2020" />
                  <Input label="Rang" value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="Oq" />
                </div>
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

        {/* ── Step 1: Texnik ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            {/* Summary chip */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <Car size={13} className="text-slate-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{form.plateNumber}</span>
              {form.brand && <span className="text-xs text-slate-400 ml-auto">{form.brand} {form.model}</span>}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <Wrench size={13} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Texnik ko'rsatkichlar
                </span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <Input
                  label="Joriy speedometr (km)"
                  type="number"
                  value={form.currentOdometer}
                  onChange={(e) => set('currentOdometer', e.target.value)}
                  placeholder="0"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Moy intervali (km)"
                    type="number"
                    value={form.oilChangeIntervalKm}
                    onChange={(e) => set('oilChangeIntervalKm', e.target.value)}
                  />
                  <Input
                    label="Oxirgi moy (km)"
                    type="number"
                    value={form.lastOilChangeKm}
                    onChange={(e) => set('lastOilChangeKm', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" fullWidth onClick={() => setStep(0)}>Orqaga</Button>
              <Button type="submit" fullWidth loading={loading}>{isEdit ? 'Saqlash' : "Qo'shish"}</Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default VehicleForm;
